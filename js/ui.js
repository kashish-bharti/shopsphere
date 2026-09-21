/**
 * ShopSphere - UI Utilities & Accessible Component Controllers
 * Handles Toast notifications, Modal dialogs, Star ratings, and Skeletons.
 */

/**
 * Toast Notification System
 */
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  // SVG Icons based on type
  const iconSvg = {
    success: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    error: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    warning: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    info: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  }[type] || '';

  const titles = {
    success: 'Success',
    error: 'Notice',
    warning: 'Warning',
    info: 'Information'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Dismiss notification">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  const removeToast = () => {
    toast.classList.add('toast-removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  };

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) closeBtn.addEventListener('click', removeToast);

  const timer = setTimeout(removeToast, duration);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
}

/**
 * Accessible Modal Helpers (HTML5 <dialog>)
 */
export function openModal(dialogElement) {
  if (!dialogElement) return;
  if (typeof dialogElement.showModal === 'function') {
    dialogElement.showModal();
  } else {
    dialogElement.setAttribute('open', '');
  }
  document.body.style.overflow = 'hidden';

  // Auto focus first input or close button
  const focusable = dialogElement.querySelector('input, button:not(.modal-close-btn), select, textarea');
  if (focusable) focusable.focus();
}

export function closeModal(dialogElement) {
  if (!dialogElement) return;
  if (typeof dialogElement.close === 'function') {
    dialogElement.close();
  } else {
    dialogElement.removeAttribute('open');
  }
  document.body.style.overflow = '';
}

/**
 * Render star ratings SVG
 */
export function renderStars(rate = 4.5) {
  const rounded = Math.round(Number(rate) * 2) / 2;
  let starsHtml = '<div class="stars" aria-label="Rated ' + rate + ' out of 5 stars">';
  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) {
      // Full star
      starsHtml += `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    } else if (rounded >= i - 0.5) {
      // Half star
      starsHtml += `<svg viewBox="0 0 20 20" fill="currentColor"><defs><linearGradient id="half-star-${i}"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#cbd5e1"/></linearGradient></defs><path fill="url(#half-star-${i})" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    } else {
      // Empty star
      starsHtml += `<svg viewBox="0 0 20 20" fill="#cbd5e1"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
  }
  starsHtml += '</div>';
  return starsHtml;
}

/**
 * Render product skeleton placeholders
 */
export function renderProductSkeletons(container, count = 8) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text" style="width: 50%;"></div>
      <div class="skeleton skeleton-text" style="width: 90%;"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton skeleton-btn"></div>
    </div>
  `).join('');
}
