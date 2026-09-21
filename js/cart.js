/**
 * ShopSphere - Cart & Checkout Engine
 * Manages shopping cart operations, calculations, discounts, and order placement.
 */

import { getCart, saveCart, clearCart, getStoredProducts, saveStoredProducts, addOrder } from './storage.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './ui.js';

// Supported Coupons
export const COUPONS = {
  'SAVE10': { type: 'percent', value: 0.10, description: '10% Off Entire Order' },
  'WELCOME20': { type: 'percent', value: 0.20, description: '20% Off Welcome Discount' },
  'FREESHIP': { type: 'shipping', value: 1.0, description: 'Free Standard Shipping' }
};

/**
 * Add item to cart with inventory validation
 */
export function addToCart(product, quantity = 1) {
  if (!product || !product.id) return;
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  const availableStock = product.stock !== undefined ? product.stock : 20;

  if (availableStock <= 0) {
    showToast('This product is currently out of stock.', 'error');
    return;
  }

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > availableStock) {
      showToast(`Only ${availableStock} units available in stock.`, 'warning');
      existing.quantity = availableStock;
    } else {
      existing.quantity = newQty;
      showToast(`Updated quantity in cart (${existing.quantity})`, 'success');
    }
  } else {
    const initialQty = Math.min(quantity, availableStock);
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: initialQty,
      maxStock: availableStock
    });
    showToast(`Added "${product.title.substring(0, 24)}..." to cart!`, 'success');
  }

  saveCart(cart);
}

/**
 * Update quantity of a cart item
 */
export function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === Number(productId));
  if (!item) return;

  const targetQty = parseInt(quantity, 10);
  if (isNaN(targetQty) || targetQty <= 0) {
    removeFromCart(productId);
    return;
  }

  const limit = item.maxStock || 50;
  if (targetQty > limit) {
    showToast(`Maximum available stock is ${limit}`, 'warning');
    item.quantity = limit;
  } else {
    item.quantity = targetQty;
  }

  saveCart(cart);
}

/**
 * Remove an item from the cart
 */
export function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== Number(productId));
  saveCart(filtered);
  showToast('Item removed from cart.', 'info');
}

/**
 * Calculate totals with tax, shipping, and promo codes
 */
export function calculateCartTotals(appliedCoupon = null) {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discount = 0;
  let isFreeShipping = subtotal >= 50 || subtotal === 0;

  if (appliedCoupon && COUPONS[appliedCoupon.toUpperCase()]) {
    const promo = COUPONS[appliedCoupon.toUpperCase()];
    if (promo.type === 'percent') {
      discount = subtotal * promo.value;
    } else if (promo.type === 'shipping') {
      isFreeShipping = true;
    }
  }

  const shipping = isFreeShipping ? 0 : 9.99;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08; // 8% sales tax
  const total = Math.max(0, taxableAmount + shipping + tax);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    isFreeShipping
  };
}

/**
 * Place simulated order and update inventory
 */
export function placeOrder({ shippingAddress, paymentMethod = 'Mock Card', couponCode = null }) {
  const cart = getCart();
  if (cart.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const user = getCurrentUser();
  const totals = calculateCartTotals(couponCode);

  // 1. Deduct stock from products catalog
  const products = getStoredProducts();
  cart.forEach(cartItem => {
    const p = products.find(prod => prod.id === cartItem.id);
    if (p) {
      p.stock = Math.max(0, (p.stock || 10) - cartItem.quantity);
      if (p.stock < 5) p.badge = "Low Stock";
    }
  });
  saveStoredProducts(products);

  // 2. Generate unique order ID
  const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    userId: user ? user.id : 'guest_user',
    userEmail: user ? user.email : shippingAddress.email,
    date: new Date().toISOString(),
    status: 'Processing',
    items: [...cart],
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    couponApplied: couponCode || null,
    paymentMethod,
    shippingAddress
  };

  addOrder(newOrder);
  clearCart();
  showToast(`Order #${orderId} confirmed!`, 'success');

  return newOrder;
}
