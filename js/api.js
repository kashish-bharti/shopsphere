/**
 * ShopSphere - REST API Integration Module
 * Integrates with Fake Store API with automatic fallback to LocalStorage.
 */

import { getStoredProducts, saveStoredProducts, SEED_PRODUCTS } from './storage.js';

const API_BASE_URL = 'https://fakestoreapi.com';
const TIMEOUT_MS = 6000;

/**
 * Fetch wrapper with timeout and robust error trapping
 */
async function fetchWithTimeout(resource, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Helper to enrich products from Fake Store API with realistic e-commerce attributes
 */
function enrichProduct(p, index) {
  return {
    id: p.id,
    title: p.title,
    price: Number(p.price) || 0,
    description: p.description || '',
    category: p.category || 'general',
    image: p.image || 'https://via.placeholder.com/300',
    rating: {
      rate: p.rating && p.rating.rate ? Number(p.rating.rate) : 4.2,
      count: p.rating && p.rating.count ? Number(p.rating.count) : 85
    },
    stock: p.stock !== undefined ? p.stock : (10 + (index * 3) % 25),
    isFeatured: p.isFeatured !== undefined ? p.isFeatured : (p.rating?.rate >= 4.5 || index < 4),
    badge: p.badge || (p.stock < 5 ? "Low Stock" : (p.rating?.rate >= 4.5 ? "Bestseller" : null))
  };
}

/**
 * Fetch all products
 */
export async function getProducts() {
  try {
    const stored = getStoredProducts();
    // Try fetching from external API to check for live updates
    const response = await fetchWithTimeout(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Merge remote data with existing custom stocks or user edits in localStorage
      const merged = data.map((remoteItem, idx) => {
        const localMatch = stored.find(s => s.id === remoteItem.id);
        if (localMatch) {
          return {
            ...enrichProduct(remoteItem, idx),
            ...localMatch // local modifications take precedence (e.g. stock, admin edits)
          };
        }
        return enrichProduct(remoteItem, idx);
      });

      // Also append any newly created custom products created by the admin (ids > 20)
      const customProducts = stored.filter(s => s.id > 20);
      const combined = [...merged, ...customProducts];
      saveStoredProducts(combined);
      return combined;
    }
    return stored;
  } catch (error) {
    console.warn("API unavailable or timed out; utilizing cached product catalog:", error.message);
    return getStoredProducts();
  }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id) {
  const numericId = Number(id);
  const localProducts = getStoredProducts();
  const localMatch = localProducts.find(p => p.id === numericId);

  try {
    // If ID is a custom admin product (> 20), fetch from local state directly
    if (numericId > 20 && localMatch) {
      return localMatch;
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${numericId}`);
    if (!response.ok) {
      throw new Error(`Product ${numericId} not found in remote API`);
    }
    const data = await response.json();
    if (data && data.id) {
      return localMatch ? { ...enrichProduct(data, 0), ...localMatch } : enrichProduct(data, 0);
    }
    return localMatch || null;
  } catch (error) {
    console.warn(`Failed fetching product ${id} from API, returning local cache:`, error.message);
    return localMatch || null;
  }
}

/**
 * Fetch categories list
 */
export async function getCategories() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/categories`);
    if (response.ok) {
      const categories = await response.json();
      if (Array.isArray(categories) && categories.length > 0) {
        return categories;
      }
    }
  } catch (error) {
    console.warn("Using fallback categories:", error.message);
  }

  // Fallback derived from stored products
  const products = getStoredProducts();
  const catSet = new Set(products.map(p => p.category));
  return Array.from(catSet);
}

/**
 * Create a new product (Simulated REST API + LocalStorage sync)
 */
export async function createProduct(productData) {
  try {
    // Try sending to FakeStoreAPI
    try {
      await fetchWithTimeout(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } catch {
      // Remote API may fail or be offline, proceed with local persistence
    }

    const products = getStoredProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title: productData.title.trim(),
      price: parseFloat(productData.price) || 0,
      description: productData.description.trim(),
      category: productData.category.toLowerCase(),
      image: productData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
      rating: {
        rate: parseFloat(productData.rating) || 4.5,
        count: 1
      },
      stock: parseInt(productData.stock, 10) || 10,
      isFeatured: Boolean(productData.isFeatured),
      badge: parseInt(productData.stock, 10) < 5 ? "Low Stock" : "New"
    };

    products.unshift(newProduct);
    saveStoredProducts(products);
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id, updatedData) {
  try {
    const numericId = Number(id);
    try {
      await fetchWithTimeout(`${API_BASE_URL}/products/${numericId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
    } catch {
      // Offline fallback
    }

    const products = getStoredProducts();
    const index = products.findIndex(p => p.id === numericId);
    if (index === -1) {
      throw new Error(`Product with ID ${numericId} not found`);
    }

    const updated = {
      ...products[index],
      ...updatedData,
      price: parseFloat(updatedData.price !== undefined ? updatedData.price : products[index].price),
      stock: parseInt(updatedData.stock !== undefined ? updatedData.stock : products[index].stock, 10),
      badge: (parseInt(updatedData.stock, 10) < 5) ? "Low Stock" : (products[index].badge || null)
    };

    products[index] = updated;
    saveStoredProducts(products);
    return updated;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id) {
  try {
    const numericId = Number(id);
    try {
      await fetchWithTimeout(`${API_BASE_URL}/products/${numericId}`, {
        method: "DELETE"
      });
    } catch {
      // Offline fallback
    }

    const products = getStoredProducts();
    const filtered = products.filter(p => p.id !== numericId);
    saveStoredProducts(filtered);
    return { success: true, id: numericId };
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}
