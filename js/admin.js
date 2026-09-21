/**
 * ShopSphere - Admin Dashboard & CRUD Management
 * Handles Product CRUD (Create, Read, Update, Delete), real-time KPIs, and Analytics.
 */

import { getProducts, createProduct, updateProduct, deleteProduct } from './api.js';
import { getOrders } from './storage.js';
import { openModal, closeModal, showToast } from './ui.js';
import { escapeHTML, formatCurrency, isValidPositiveNumber, isValidStock } from './validation.js';

export class AdminDashboard {
  constructor() {
    this.products = [];
    this.orders = [];
    this.filteredProducts = [];
    this.editingProductId = null;
    this.deletingProductId = null;

    // Dom elements
    this.tableBody = document.getElementById('admin-product-table-body');
    this.searchEl = document.getElementById('admin-product-search');
    this.categoryFilterEl = document.getElementById('admin-category-filter');
    this.addBtn = document.getElementById('admin-add-product-btn');

    // Modals
    this.productModal = document.getElementById('admin-product-modal');
    this.productForm = document.getElementById('admin-product-form');
    this.modalTitle = document.getElementById('admin-modal-title');
    this.deleteModal = document.getElementById('admin-delete-modal');
    this.confirmDeleteBtn = document.getElementById('admin-confirm-delete-btn');
  }

  async init() {
    this.products = await getProducts();
    this.orders = getOrders();
    this.filteredProducts = [...this.products];

    this.renderStats();
    this.renderCategoryBreakdown();
    this.populateCategoryFilter();
    this.renderTable();
    this.bindEvents();
  }

  bindEvents() {
    // Search
    if (this.searchEl) {
      this.searchEl.addEventListener('input', () => this.filterProducts());
    }

    // Category Filter
    if (this.categoryFilterEl) {
      this.categoryFilterEl.addEventListener('change', () => this.filterProducts());
    }

    // Open Add Modal
    if (this.addBtn) {
      this.addBtn.addEventListener('click', () => this.openAddModal());
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('dialog.modal');
        if (modal) closeModal(modal);
      });
    });

    // Form Submit (Add or Edit)
    if (this.productForm) {
      this.productForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Confirm Delete
    if (this.confirmDeleteBtn) {
      this.confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());
    }

    // Table Actions (Event Delegation for Edit & Delete)
    if (this.tableBody) {
      this.tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.admin-edit-btn');
        if (editBtn) {
          const id = Number(editBtn.getAttribute('data-id'));
          this.openEditModal(id);
          return;
        }

        const deleteBtn = e.target.closest('.admin-delete-btn');
        if (deleteBtn) {
          const id = Number(deleteBtn.getAttribute('data-id'));
          this.openDeleteModal(id);
        }
      });
    }
  }

  filterProducts() {
    const q = this.searchEl ? this.searchEl.value.trim().toLowerCase() : '';
    const cat = this.categoryFilterEl ? this.categoryFilterEl.value.toLowerCase() : 'all';

    this.filteredProducts = this.products.filter(p => {
      const matchQuery = p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || String(p.id).includes(q);
      const matchCat = cat === 'all' || p.category.toLowerCase() === cat;
      return matchQuery && matchCat;
    });

    this.renderTable();
  }

  renderStats() {
    const totalProducts = this.products.length;
    const categories = new Set(this.products.map(p => p.category)).size;
    const avgPrice = totalProducts > 0 
      ? (this.products.reduce((sum, p) => sum + p.price, 0) / totalProducts) 
      : 0;
    const lowStockCount = this.products.filter(p => (p.stock || 0) < 5).length;
    const totalRevenue = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = this.orders.length;

    const elTotalProd = document.getElementById('stat-total-products');
    const elCategories = document.getElementById('stat-total-categories');
    const elAvgPrice = document.getElementById('stat-avg-price');
    const elLowStock = document.getElementById('stat-low-stock');
    const elRevenue = document.getElementById('stat-total-revenue');
    const elOrders = document.getElementById('stat-total-orders');

    if (elTotalProd) elTotalProd.textContent = totalProducts;
    if (elCategories) elCategories.textContent = categories;
    if (elAvgPrice) elAvgPrice.textContent = formatCurrency(avgPrice);
    if (elLowStock) elLowStock.textContent = lowStockCount;
    if (elRevenue) elRevenue.textContent = formatCurrency(totalRevenue);
    if (elOrders) elOrders.textContent = totalOrdersCount;
  }

  renderCategoryBreakdown() {
    const container = document.getElementById('admin-category-breakdown');
    if (!container) return;

    const counts = {};
    this.products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const total = this.products.length || 1;
    const entries = Object.entries(counts);

    container.innerHTML = entries.map(([cat, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div style="margin-bottom: 0.875rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.3rem;">
            <span style="text-transform: capitalize;">${escapeHTML(cat)}</span>
            <span>${count} items (${pct}%)</span>
          </div>
          <div style="height: 8px; background: var(--slate-100); border-radius: var(--radius-full); overflow: hidden;">
            <div style="height: 100%; width: ${pct}%; background: var(--primary-600); border-radius: var(--radius-full);"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  populateCategoryFilter() {
    if (!this.categoryFilterEl) return;
    const categories = Array.from(new Set(this.products.map(p => p.category)));
    this.categoryFilterEl.innerHTML = `
      <option value="all">All Categories</option>
      ${categories.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('')}
    `;
  }

  renderTable() {
    if (!this.tableBody) return;

    if (this.filteredProducts.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--slate-500);">
            No matching products found.
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = this.filteredProducts.map(p => {
      const stock = p.stock !== undefined ? p.stock : 10;
      const stockClass = stock <= 0 ? 'out-of-stock' : (stock < 5 ? 'low-stock' : 'in-stock');
      const stockLabel = stock <= 0 ? 'Out of Stock (0)' : (stock < 5 ? `Low Stock (${stock})` : `In Stock (${stock})`);

      return `
        <tr>
          <td style="font-weight: 700; color: var(--slate-500);">#${p.id}</td>
          <td>
            <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" class="table-img" loading="lazy"/>
          </td>
          <td style="max-width: 260px;">
            <div style="font-weight: 600; color: var(--slate-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHTML(p.title)}
            </div>
            <span style="font-size: 0.75rem; color: var(--slate-400); text-transform: capitalize;">${escapeHTML(p.category)}</span>
          </td>
          <td style="font-weight: 700; color: var(--slate-900);">${formatCurrency(p.price)}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px; font-weight: 600;">
              <span style="color: var(--warning-500);">★</span>
              <span>${p.rating ? p.rating.rate : '4.5'}</span>
            </div>
          </td>
          <td>
            <span class="stock-badge ${stockClass}">
              <span class="stock-dot"></span>
              ${stockLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary btn-sm admin-edit-btn" data-id="${p.id}" aria-label="Edit product ${p.id}">
                Edit
              </button>
              <button type="button" class="btn btn-danger btn-sm admin-delete-btn" data-id="${p.id}" aria-label="Delete product ${p.id}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddModal() {
    this.editingProductId = null;
    if (this.modalTitle) this.modalTitle.textContent = 'Add New Product';
    if (this.productForm) {
      this.productForm.reset();
      document.getElementById('prod-id').value = '';
      document.getElementById('prod-rating').value = '4.5';
      document.getElementById('prod-stock').value = '15';
    }
    openModal(this.productModal);
  }

  openEditModal(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    this.editingProductId = id;
    if (this.modalTitle) this.modalTitle.textContent = `Edit Product #${id}`;

    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-title').value = product.title;
    document.getElementById('prod-category').value = product.category;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-stock').value = product.stock !== undefined ? product.stock : 10;
    document.getElementById('prod-rating').value = product.rating ? product.rating.rate : 4.5;
    document.getElementById('prod-image').value = product.image;
    document.getElementById('prod-description').value = product.description;

    openModal(this.productModal);
  }

  openDeleteModal(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    this.deletingProductId = id;
    const nameEl = document.getElementById('delete-product-name');
    if (nameEl) nameEl.textContent = `"${product.title}" (#${product.id})`;
    openModal(this.deleteModal);
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('prod-title').value.trim();
    const category = document.getElementById('prod-category').value.trim();
    const price = document.getElementById('prod-price').value;
    const stock = document.getElementById('prod-stock').value;
    const rating = document.getElementById('prod-rating').value;
    const image = document.getElementById('prod-image').value.trim();
    const description = document.getElementById('prod-description').value.trim();

    if (!title) {
      showToast('Please provide a product title.', 'error');
      return;
    }
    if (!isValidPositiveNumber(price)) {
      showToast('Price must be greater than 0.', 'error');
      return;
    }
    if (!isValidStock(stock)) {
      showToast('Stock must be 0 or higher.', 'error');
      return;
    }

    const payload = {
      title,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      rating: parseFloat(rating) || 4.5,
      image: image || 'https://via.placeholder.com/400',
      description
    };

    try {
      if (this.editingProductId) {
        await updateProduct(this.editingProductId, payload);
        showToast('Product successfully updated!', 'success');
      } else {
        await createProduct(payload);
        showToast('Product successfully created!', 'success');
      }

      this.products = await getProducts();
      this.filterProducts();
      this.renderStats();
      this.renderCategoryBreakdown();
      closeModal(this.productModal);
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  }

  async handleConfirmDelete() {
    if (!this.deletingProductId) return;

    try {
      await deleteProduct(this.deletingProductId);
      showToast('Product successfully deleted.', 'info');
      this.products = await getProducts();
      this.filterProducts();
      this.renderStats();
      this.renderCategoryBreakdown();
      closeModal(this.deleteModal);
      this.deletingProductId = null;
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  }
}
