/**
 * ShopSphere - Simulated Authentication & Authorization Engine
 * Provides role-based session management and route protection using LocalStorage.
 */

import { getUsers, saveUsers, getSession, saveSession, clearSession } from './storage.js';
import { isValidEmail, isValidPassword } from './validation.js';
import { showToast } from './ui.js';

/**
 * Register a new user
 */
export function registerUser({ name, email, password, role = 'customer' }) {
  if (!name || name.trim().length < 2) {
    throw new Error('Please enter a valid full name.');
  }
  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 6 characters.');
  }

  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password: password, // Simulated storage
    role: role === 'admin' ? 'admin' : 'customer',
    createdAt: new Date().toISOString(),
    address: ''
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login newly registered user
  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    token: `sim_token_${Math.random().toString(36).substring(2)}`
  };
  saveSession(sessionUser);

  return sessionUser;
}

/**
 * Login existing user
 */
export function loginUser(email, password) {
  if (!isValidEmail(email)) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: `sim_token_${Math.random().toString(36).substring(2)}`
  };

  saveSession(sessionUser);
  return sessionUser;
}

/**
 * Log in with pre-seeded demo accounts (1-click evaluation)
 */
export function loginAsDemo(role = 'customer') {
  if (role === 'admin') {
    return loginUser('admin@shopsphere.com', 'Password@123');
  }
  return loginUser('demo@shopsphere.com', 'Password@123');
}

/**
 * Logout current user
 */
export function logoutUser() {
  clearSession();
  showToast('You have been logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}

/**
 * Get currently logged in user or null
 */
export function getCurrentUser() {
  return getSession();
}

/**
 * Route Guard: protects pages that require authentication
 */
export function requireAuth({ adminOnly = false, redirectUrl = 'login.html' } = {}) {
  const user = getCurrentUser();

  if (!user) {
    sessionStorage.setItem('shopsphere_redirect', window.location.pathname + window.location.search);
    window.location.href = `${redirectUrl}?reason=unauthenticated`;
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    alert('Access restricted to Administrators. Redirecting to your customer dashboard.');
    window.location.href = 'dashboard.html';
    return null;
  }

  return user;
}
