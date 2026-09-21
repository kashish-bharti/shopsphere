/**
 * ShopSphere - Product Catalog & Details Management
 * Handles multi-facet filtering, real-time search, sorting, pagination, and details rendering.
 */

import { getProducts, getProductById } from './api.js';
import { isInWishlist } from './storage.js';
import { addToCart } from './cart.js';
import { toggleWishlist } from './wishlist.js';
import { renderStars, renderProductSkeletons, showToast } from './ui.js';
import { escapeHTML, formatCurrency } from './validation.js';

/**
 * Generates an accessible, responsive product card HTML string
 */
export function createProductCardHTML(product) {
  const isWishlisted = isInWishlist(product.id);
  const badgeHtml = product.badge ? `
    <span class="product-badge-pill ${
      product.badge === 'Sale' ? 'badge-sale' :
      product.badge === 'Low Stock' ? 'badge-low-stock' :
      product.badge === 'Bestseller' ? 'badge-popular' : 'badge-new'
    }">${escapeHTML(product.badge)}</span>
  ` : '';

  const originalPrice = product.badge === 'Sale' ? (product.price * 1.25).toFixed(2) : null;

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        ${badgeHtml}
        <button type="button" 
          class="wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" 
          data-id="${product.id}"
          aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">
          <svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        <a href="product-details.html?id=${product.id}" tabindex="-1">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}" loading="lazy" />
        </a>
      </div>
      <div class="product-info">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <h3 class="product-title">
          <a href="product-details.html?id=${product.id}">${escapeHTML(product.title)}</a>
        </h3>
        <div class="product-rating">
          ${renderStars(product.rating ? product.rating.rate : 4.5)}
          <span class="rating-count">(${product.rating ? product.rating.count : 50})</span>
        </div>
        <div class="product-price-row">
          <span class="current-price">${formatCurrency(product.price)}</span>
          ${originalPrice ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : ''}
        </div>
        <div class="product-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-block add-to-cart-btn" data-id="${product.id}">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Filter & Sort Catalog Class
 */
export class ProductCatalog {
  constructor({
    gridContainer,
    countContainer,
    paginationContainer,
    searchInput,
    categoryButtons,
    priceRangeInput,
    priceDisplay,
    ratingSelect,
    sortSelect,
    clearFiltersBtn
  }) {
    this.grid = gridContainer;
    this.countEl = countContainer;
    this.paginationEl = paginationContainer;
    this.searchInput = searchInput;
    this.categoryButtons = categoryButtons;
    this.priceRangeInput = priceRangeInput;
    this.priceDisplay = priceDisplay;
    this.ratingSelect = ratingSelect;
    this.sortSelect = sortSelect;
    this.clearFiltersBtn = clearFiltersBtn;

    this.allProducts = [];
    this.filteredProducts = [];
    this.state = {
      search: '',
      category: 'all',
      maxPrice: 1000,
      minRating: 0,
      sortBy: 'default',
      currentPage: 1,
      itemsPerPage: 8
    };

    this.debounceTimer = null;
  }

  async init() {
    if (this.grid) renderProductSkeletons(this.grid, 8);
    this.allProducts = await getProducts();
    this.bindEvents();

    // Check URL params for category or search filter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('category')) {
      this.state.category = urlParams.get('category').toLowerCase();
      this.updateCategoryUI();
    }
    if (urlParams.get('search')) {
      this.state.search = urlParams.get('search');
      if (this.searchInput) this.searchInput.value = this.state.search;
    }

    this.applyFilters();
  }

  bindEvents() {
    // Search input (debounced 250ms)
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.state.search = e.target.value.trim().toLowerCase();
          this.state.currentPage = 1;
          this.applyFilters();
        }, 250);
      });
    }

    // Category buttons
    if (this.categoryButtons) {
      this.categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const category = btn.getAttribute('data-category') || 'all';
          this.state.category = category.toLowerCase();
          this.state.currentPage = 1;
          this.updateCategoryUI();
          this.applyFilters();
        });
      });
    }

    // Price range slider
    if (this.priceRangeInput) {
      this.priceRangeInput.addEventListener('input', (e) => {
        this.state.maxPrice = Number(e.target.value);
        if (this.priceDisplay) {
          this.priceDisplay.textContent = formatCurrency(this.state.maxPrice);
        }
        this.state.currentPage = 1;
        this.applyFilters();
      });
    }

    // Rating filter
    if (this.ratingSelect) {
      this.ratingSelect.addEventListener('change', (e) => {
        this.state.minRating = Number(e.target.value);
        this.state.currentPage = 1;
        this.applyFilters();
      });
    }

    // Sort select
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    // Clear filters button
    if (this.clearFiltersBtn) {
      this.clearFiltersBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Event delegation on product grid for Add-to-Cart and Wishlist
    if (this.grid) {
      this.grid.addEventListener('click', (e) => {
        const cartBtn = e.target.closest('.add-to-cart-btn');
        if (cartBtn) {
          const id = Number(cartBtn.getAttribute('data-id'));
          const prod = this.allProducts.find(p => p.id === id);
          if (prod) addToCart(prod, 1);
          return;
        }

        const wishBtn = e.target.closest('.wishlist-toggle-btn');
        if (wishBtn) {
          const id = Number(wishBtn.getAttribute('data-id'));
          const prod = this.allProducts.find(p => p.id === id);
          if (prod) {
            const added = toggleWishlist(prod);
            wishBtn.classList.toggle('active', added);
            const svg = wishBtn.querySelector('svg');
            if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
          }
        }
      });
    }
  }

  updateCategoryUI() {
    if (!this.categoryButtons) return;
    this.categoryButtons.forEach(btn => {
      const cat = (btn.getAttribute('data-category') || 'all').toLowerCase();
      if (cat === this.state.category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  resetFilters() {
    this.state = {
      search: '',
      category: 'all',
      maxPrice: 1000,
      minRating: 0,
      sortBy: 'default',
      currentPage: 1,
      itemsPerPage: 8
    };

    if (this.searchInput) this.searchInput.value = '';
    if (this.priceRangeInput) {
      this.priceRangeInput.value = 1000;
      if (this.priceDisplay) this.priceDisplay.textContent = formatCurrency(1000);
    }
    if (this.ratingSelect) this.ratingSelect.value = '0';
    if (this.sortSelect) this.sortSelect.value = 'default';
    this.updateCategoryUI();
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.allProducts];

    // 1. Search filter
    if (this.state.search) {
      const q = this.state.search;
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (this.state.category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === this.state.category);
    }

    // 3. Price filter
    result = result.filter(p => p.price <= this.state.maxPrice);

    // 4. Rating filter
    if (this.state.minRating > 0) {
      result = result.filter(p => (p.rating ? p.rating.rate : 0) >= this.state.minRating);
    }

    // 5. Sorting
    switch (this.state.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-high':
        result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Featured or default order
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    this.filteredProducts = result;
    this.render();
  }

  render() {
    if (!this.grid) return;

    if (this.countEl) {
      this.countEl.textContent = `Showing ${this.filteredProducts.length} products`;
    }

    // Empty state handling
    if (this.filteredProducts.length === 0) {
      this.grid.innerHTML = `
        <div class="state-box" style="grid-column: 1 / -1;">
          <div class="state-icon state-empty">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="state-title">No products found</h3>
          <p class="state-desc">We couldn't find any products matching your filters. Try adjusting your search query or reset your filters.</p>
          <button type="button" class="btn btn-primary" id="empty-reset-btn">Reset All Filters</button>
        </div>
      `;
      const btn = document.getElementById('empty-reset-btn');
      if (btn) btn.addEventListener('click', () => this.resetFilters());
      if (this.paginationEl) this.paginationEl.innerHTML = '';
      return;
    }

    // Pagination calculations
    const totalPages = Math.ceil(this.filteredProducts.length / this.state.itemsPerPage);
    const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const paginatedItems = this.filteredProducts.slice(startIndex, startIndex + this.state.itemsPerPage);

    this.grid.innerHTML = paginatedItems.map(p => createProductCardHTML(p)).join('');

    this.renderPagination(totalPages);
  }

  renderPagination(totalPages) {
    if (!this.paginationEl) return;
    if (totalPages <= 1) {
      this.paginationEl.innerHTML = '';
      return;
    }

    let html = `
      <button type="button" class="page-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} data-page="${this.state.currentPage - 1}" aria-label="Previous Page">
        &laquo;
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button type="button" class="page-btn ${this.state.currentPage === i ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    html += `
      <button type="button" class="page-btn" ${this.state.currentPage === totalPages ? 'disabled' : ''} data-page="${this.state.currentPage + 1}" aria-label="Next Page">
        &raquo;
      </button>
    `;

    this.paginationEl.innerHTML = html;

    this.paginationEl.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = Number(btn.getAttribute('data-page'));
        if (page && page !== this.state.currentPage) {
          this.state.currentPage = page;
          this.render();
          this.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
}
