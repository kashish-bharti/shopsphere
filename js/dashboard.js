/**
 * ShopSphere - User Account & Order History Dashboard
 * Displays customer stats, detailed order tracking, and profile settings.
 */

import { getCurrentUser, logoutUser } from './auth.js';
import { getOrders, getWishlist, getCart, getUsers, saveUsers, saveSession } from './storage.js';
import { addToCart } from './cart.js';
import { showToast } from './ui.js';
import { escapeHTML, formatCurrency } from './validation.js';

export function initDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  const orders = getOrders().filter(o => o.userId === user.id || o.userEmail === user.email);
  const wishlist = getWishlist();
  const cart = getCart();

  // Populate User Header
  const nameEl = document.getElementById('dash-user-name');
  const emailEl = document.getElementById('dash-user-email');
  const roleEl = document.getElementById('dash-user-role');
  const avatarEl = document.getElementById('dash-user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (roleEl) roleEl.textContent = user.role.toUpperCase();
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

  // Populate KPIs
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const elOrders = document.getElementById('dash-kpi-orders');
  const elSpent = document.getElementById('dash-kpi-spent');
  const elWish = document.getElementById('dash-kpi-wishlist');
  const elCart = document.getElementById('dash-kpi-cart');

  if (elOrders) elOrders.textContent = orders.length;
  if (elSpent) elSpent.textContent = formatCurrency(totalSpent);
  if (elWish) elWish.textContent = wishlist.length;
  if (elCart) elCart.textContent = cart.reduce((s, i) => s + i.quantity, 0);

  // Populate Profile Form
  const inputName = document.getElementById('profile-name');
  const inputEmail = document.getElementById('profile-email');
  const inputAddress = document.getElementById('profile-address');
  const users = getUsers();
  const fullUser = users.find(u => u.id === user.id) || user;

  if (inputName) inputName.value = fullUser.name || '';
  if (inputEmail) inputEmail.value = fullUser.email || '';
  if (inputAddress) inputAddress.value = fullUser.address || '';

  // Render Orders
  renderOrderHistory(orders);

  // Profile Form submit
  const profileForm = document.getElementById('dash-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedName = inputName.value.trim();
      const updatedAddress = inputAddress.value.trim();

      if (!updatedName) {
        showToast('Name cannot be empty', 'error');
        return;
      }

      const allUsers = getUsers();
      const idx = allUsers.findIndex(u => u.id === user.id);
      if (idx > -1) {
        allUsers[idx].name = updatedName;
        allUsers[idx].address = updatedAddress;
        saveUsers(allUsers);

        // update session
        user.name = updatedName;
        saveSession(user);

        if (nameEl) nameEl.textContent = updatedName;
        if (avatarEl) avatarEl.textContent = updatedName.charAt(0).toUpperCase();
        showToast('Profile information saved!', 'success');
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('dash-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
    });
  }
}

function renderOrderHistory(orders) {
  const container = document.getElementById('dash-orders-container');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="state-box" style="margin: 1rem 0;">
        <div class="state-icon state-empty">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h3 class="state-title">No orders placed yet</h3>
        <p class="state-desc">When you place orders, they will appear here with full tracking and receipts.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => {
    const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const statusBadgeClass = {
      'Delivered': 'badge-success',
      'Processing': 'badge-warning',
      'In Transit': 'badge-primary'
    }[order.status] || 'badge-slate';

    const itemsHtml = order.items.map(item => `
      <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--slate-100);">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" style="width: 48px; height: 48px; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--slate-200); padding: 2px;" />
        <div style="flex: 1;">
          <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--slate-800);">${escapeHTML(item.title)}</h4>
          <span style="font-size: 0.75rem; color: var(--slate-500);">Qty: ${item.quantity} &times; ${formatCurrency(item.price)}</span>
        </div>
        <span style="font-weight: 700; font-size: 0.875rem; color: var(--slate-900);">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `).join('');

    return `
      <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: var(--radius-lg); margin-bottom: 1.5rem; overflow: hidden; box-shadow: var(--shadow-xs);">
        <div style="background: var(--slate-50); padding: 1rem 1.25rem; border-bottom: 1px solid var(--slate-200); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 600;">Order ID</div>
            <div style="font-weight: 700; color: var(--slate-900); font-family: var(--font-mono);">${order.id}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 600;">Date Placed</div>
            <div style="font-weight: 600; color: var(--slate-700);">${formattedDate}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; font-weight: 600;">Total Amount</div>
            <div style="font-weight: 800; color: var(--primary-600);">${formatCurrency(order.total)}</div>
          </div>
          <div>
            <span class="badge ${statusBadgeClass}">${order.status}</span>
          </div>
        </div>
        <div style="padding: 1.25rem;">
          ${itemsHtml}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; flex-wrap: wrap; gap: 0.75rem;">
            <span style="font-size: 0.8125rem; color: var(--slate-500);">Paid via ${escapeHTML(order.paymentMethod || 'Simulated Card')}</span>
            <button type="button" class="btn btn-outline btn-sm reorder-btn" data-order-id="${order.id}">
              Re-order All Items
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-order button handler
  container.querySelectorAll('.reorder-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      const order = orders.find(o => o.id === orderId);
      if (order && order.items) {
        order.items.forEach(it => addToCart(it, it.quantity));
        showToast('Items added to cart! Proceeding to cart...', 'success');
        setTimeout(() => {
          window.location.href = 'cart.html';
        }, 500);
      }
    });
  });
}
