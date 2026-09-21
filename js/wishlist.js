/**
 * ShopSphere - Wishlist Management Module
 * Handles toggling, removing, moving items to cart, and state synchronization.
 */

import { getWishlist, saveWishlist, isInWishlist } from './storage.js';
import { addToCart } from './cart.js';
import { showToast } from './ui.js';

/**
 * Toggle item in wishlist
 */
export function toggleWishlist(product) {
  if (!product || !product.id) return false;
  const wishlist = getWishlist();
  const index = wishlist.findIndex(item => item.id === Number(product.id));

  let added = false;
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`Removed "${product.title.substring(0, 20)}..." from wishlist`, 'info');
  } else {
    wishlist.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
      stock: product.stock
    });
    added = true;
    showToast(`Added "${product.title.substring(0, 20)}..." to wishlist!`, 'success');
  }

  saveWishlist(wishlist);
  return added;
}

/**
 * Remove specific item from wishlist
 */
export function removeFromWishlist(productId) {
  const wishlist = getWishlist();
  const filtered = wishlist.filter(item => item.id !== Number(productId));
  saveWishlist(filtered);
  showToast('Item removed from wishlist.', 'info');
}

/**
 * Move item from wishlist to cart
 */
export function moveWishlistItemToCart(productId) {
  const wishlist = getWishlist();
  const item = wishlist.find(i => i.id === Number(productId));
  if (!item) return;

  addToCart(item, 1);
  removeFromWishlist(productId);
}

/**
 * Move all wishlist items to cart
 */
export function moveAllWishlistToCart() {
  const wishlist = getWishlist();
  if (wishlist.length === 0) return;

  wishlist.forEach(item => {
    addToCart(item, 1);
  });

  saveWishlist([]);
  showToast('All wishlist items moved to cart!', 'success');
}
