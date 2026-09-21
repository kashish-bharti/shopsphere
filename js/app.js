/**
 * ShopSphere - Global Application Bootstrapper
 * Coordinates navbar states, badges, mobile drawer, authentication widgets, and events.
 */

import { initStorage, getCart, getWishlist } from './storage.js';
import { getCurrentUser, logoutUser } from './auth.js';
import { showToast } from './ui.js';
import { escapeHTML } from './validation.js';

export function initApp() {
  initStorage();
  setupNavigation();
  updateBadges();
  setupAuthWidget();
  setupMobileDrawer();
  setupHeaderSearch();
  setupNewsletter();

  // Listen to custom reactive state events
  window.addEventListener('shopsphere:cart-updated', () => updateBadges());
  window.addEventListener('shopsphere:wishlist-updated', () => updateBadges());
  window.addEventListener('shopsphere:auth-changed', () => {
    setupAuthWidget();
    updateBadges();
  });
}

/**
 * Update Cart & Wishlist counters in header and mobile bottom bar
 */
export function updateBadges() {
  const cart = getCart();
  const wishlist = getWishlist();

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const wishTotal = wishlist.length;

  const cartBadges = document.querySelectorAll('.cart-count-badge');
  cartBadges.forEach(b => {
    b.textContent = cartTotal;
    b.style.display = cartTotal > 0 ? 'flex' : 'none';
  });

  const wishBadges = document.querySelectorAll('.wishlist-count-badge');
  wishBadges.forEach(b => {
    b.textContent = wishTotal;
    b.style.display = wishTotal > 0 ? 'flex' : 'none';
  });
}

/**
 * Active navigation link highlighting
 */
function setupNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-item a, .mobile-tab-btn');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Configure user auth button and dropdown in header
 */
function setupAuthWidget() {
  const user = getCurrentUser();
  const container = document.getElementById('user-nav-action');
  const mobileUserContainer = document.getElementById('mobile-drawer-user');

  if (container) {
    if (user) {
      container.innerHTML = `
        <div class="user-menu-wrapper">
          <button type="button" class="user-btn" id="user-menu-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Open user menu">
            <span class="user-avatar">${escapeHTML(user.name.charAt(0).toUpperCase())}</span>
            <span class="desktop-only">${escapeHTML(user.name.split(' ')[0])}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="desktop-only"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="dropdown-menu" id="user-dropdown-menu" role="menu">
            <div class="dropdown-header">
              <span class="user-name">${escapeHTML(user.name)}</span>
              <span class="user-email">${escapeHTML(user.email)}</span>
            </div>
            <a href="dashboard.html" class="dropdown-item" role="menuitem">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              My Dashboard
            </a>
            ${user.role === 'admin' ? `
              <a href="admin.html" class="dropdown-item" role="menuitem">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Admin Panel
              </a>
            ` : ''}
            <div class="dropdown-divider"></div>
            <button type="button" class="dropdown-item text-danger" id="nav-logout-btn" role="menuitem" style="width: 100%; border: none; background: transparent; cursor: pointer; text-align: left;">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      `;

      const trigger = document.getElementById('user-menu-trigger');
      const menu = document.getElementById('user-dropdown-menu');
      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = menu.classList.contains('open');
          menu.classList.toggle('open', !isOpen);
          trigger.setAttribute('aria-expanded', String(!isOpen));
        });

        document.addEventListener('click', () => {
          menu.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
      }

      const logoutBtn = document.getElementById('nav-logout-btn');
      if (logoutBtn) logoutBtn.addEventListener('click', () => logoutUser());
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">
          Sign In
        </a>
      `;
    }
  }

  if (mobileUserContainer) {
    if (user) {
      mobileUserContainer.innerHTML = `
        <div class="mobile-user-card">
          <span class="user-avatar" style="width: 38px; height: 38px; font-size: 1rem;">${escapeHTML(user.name.charAt(0).toUpperCase())}</span>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; color: var(--slate-900);">${escapeHTML(user.name)}</div>
            <div style="font-size: 0.75rem; color: var(--slate-500);">${escapeHTML(user.email)}</div>
          </div>
        </div>
      `;
    } else {
      mobileUserContainer.innerHTML = `
        <a href="login.html" class="btn btn-primary btn-block">Sign In / Register</a>
      `;
    }
  }
}

/**
 * Mobile Navigation Drawer Toggle
 */
function setupMobileDrawer() {
  const openBtn = document.getElementById('mobile-drawer-toggle');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const closeBtn = document.getElementById('mobile-drawer-close');

  if (openBtn && backdrop) {
    openBtn.addEventListener('click', () => {
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeDrawer = () => {
    if (backdrop) {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDrawer();
    });
  }
}

/**
 * Top Search Form Submissions
 */
function setupHeaderSearch() {
  const searchForm = document.getElementById('header-search-form');
  const searchInput = document.getElementById('header-search-input');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}

/**
 * Newsletter Subscription Form
 */
function setupNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        showToast('Thank you for subscribing! Check your inbox for 15% off.', 'success');
        input.value = '';
      }
    });
  }
}

// Auto-run if DOM is ready or attach to DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
