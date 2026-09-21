/**
 * ShopSphere - Central Storage & State Persistence Layer
 * Provides typed helpers, default seeds, and reactive event broadcasting.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'shopsphere_products_v1',
  CART: 'shopsphere_cart_v1',
  WISHLIST: 'shopsphere_wishlist_v1',
  USERS: 'shopsphere_users_v1',
  SESSION: 'shopsphere_session_v1',
  ORDERS: 'shopsphere_orders_v1'
};

// Seed Products used for fallback and instant loading
export const SEED_PRODUCTS = [
  {
    id: 1,
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    price: 109.95,
    description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday gear in the spacious main compartment.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    rating: { rate: 4.6, count: 120 },
    stock: 18,
    isFeatured: true,
    badge: "Bestseller"
  },
  {
    id: 2,
    title: "Mens Casual Premium Slim Fit T-Shirts",
    price: 22.30,
    description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    rating: { rate: 4.1, count: 259 },
    stock: 24,
    isFeatured: true,
    badge: "Sale"
  },
  {
    id: 3,
    title: "Mens Cotton Jacket",
    price: 55.99,
    description: "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    rating: { rate: 4.7, count: 500 },
    stock: 12,
    isFeatured: false,
    badge: "Top Rated"
  },
  {
    id: 4,
    title: "Mens Casual Slim Fit",
    price: 15.99,
    description: "The color could be slightly different between on the screen and in practice. Please note that body builds vary by person, hence detailed size information should be reviewed.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    rating: { rate: 3.8, count: 430 },
    stock: 3, // Low stock demo
    isFeatured: false,
    badge: "Low Stock"
  },
  {
    id: 5,
    title: "John Hardy Women's Legends Naga Gold & Silver Dragon Bracelet",
    price: 695.00,
    description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance.",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 4.9, count: 400 },
    stock: 7,
    isFeatured: true,
    badge: "Luxury"
  },
  {
    id: 6,
    title: "Solid Gold Petite Micropave",
    price: 168.00,
    description: "Satisfaction Guaranteed. Return or exchange any order within 30 days. Designed and sold by Hafeez Center in the United States.",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 3.9, count: 70 },
    stock: 15,
    isFeatured: false,
    badge: null
  },
  {
    id: 7,
    title: "White Gold Plated Princess",
    price: 9.99,
    description: "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to spoil your love more for Engagement, Wedding, Anniversary, Valentine's Day.",
    category: "jewelery",
    image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
    rating: { rate: 4.3, count: 400 },
    stock: 45,
    isFeatured: false,
    badge: "Sale"
  },
  {
    id: 8,
    title: "WD 2TB Elements Portable External Hard Drive - USB 3.0",
    price: 64.00,
    description: "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    rating: { rate: 4.8, count: 830 },
    stock: 22,
    isFeatured: true,
    badge: "Bestseller"
  },
  {
    id: 9,
    title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    price: 109.00,
    description: "Easy upgrade for faster boot up, shutdown, application load and response. Boosts burst write performance, making it ideal for typical PC workloads.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    rating: { rate: 4.5, count: 470 },
    stock: 16,
    isFeatured: false,
    badge: null
  },
  {
    id: 10,
    title: "Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost",
    price: 109.00,
    description: "3D NAND flash are applied to deliver high transfer speeds. Remarkable transfer speeds that enable faster bootup and improved overall system performance.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",
    rating: { rate: 4.8, count: 319 },
    stock: 11,
    isFeatured: false,
    badge: null
  },
  {
    id: 11,
    title: "WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive",
    price: 114.00,
    description: "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer's limited warranty.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    rating: { rate: 4.8, count: 400 },
    stock: 9,
    isFeatured: false,
    badge: null
  },
  {
    id: 12,
    title: "Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin",
    price: 599.00,
    description: "21. 5 inches Full HD widescreen IPS display And Radeon free Sync technology. No compatibility for VESA Mount Refresh Rate: 75Hz - Using HDMI port.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",
    rating: { rate: 4.6, count: 250 },
    stock: 4,
    isFeatured: true,
    badge: "Low Stock"
  },
  {
    id: 13,
    title: "Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor",
    price: 999.99,
    description: "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by side QUANTUM DOT (QLED) TECHNOLOGY, HDR support and factory calibration.",
    category: "electronics",
    image: "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",
    rating: { rate: 4.9, count: 140 },
    stock: 5,
    isFeatured: true,
    badge: "Premium"
  },
  {
    id: 14,
    title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    price: 56.99,
    description: "Note: The Jackets is US standard size, Please choose size as your usual wear. Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece. Adjustable and Detachable Hood.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
    rating: { rate: 4.2, count: 235 },
    stock: 14,
    isFeatured: false,
    badge: "Popular"
  },
  {
    id: 15,
    title: "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
    price: 29.95,
    description: "100% POLYURETHANE (shell) 100% POLYESTER (lining). Detailed stitch detailing, 2 front pockets with zip, button detail on waist, side panels for better fit.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
    rating: { rate: 4.4, count: 340 },
    stock: 20,
    isFeatured: true,
    badge: "Sale"
  },
  {
    id: 16,
    title: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    price: 39.99,
    description: "Lightweight and packable casual rain jacket. Front storm flap with snap buttons and zip closure, 2 front flap pockets with buttons, drawstring hood.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg",
    rating: { rate: 3.8, count: 679 },
    stock: 19,
    isFeatured: false,
    badge: null
  },
  {
    id: 17,
    title: "MBJ Women's Solid Short Sleeve Boat Neck V",
    price: 9.85,
    description: "95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/71z3kpMAYUL._AC_UY879_.jpg",
    rating: { rate: 4.7, count: 130 },
    stock: 30,
    isFeatured: false,
    badge: null
  },
  {
    id: 18,
    title: "Opna Women's Short Sleeve Moisture",
    price: 7.95,
    description: "100% Polyester, Machine wash, 100% cationic polyester interlock, Lightweight, roomy and highly breathable with moisture wicking fabric which helps to keep moisture away.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
    rating: { rate: 4.5, count: 146 },
    stock: 25,
    isFeatured: false,
    badge: "Sale"
  },
  {
    id: 19,
    title: "DANVOUY Womens T Shirt Casual Cotton Short",
    price: 12.99,
    description: "95%Cotton,5%Spandex, Features: Casual, Short Sleeve, Letter Print,V-Neck,Fashion Tees, The fabric is soft and has some stretch. Suitable for Summer, Casual, Work, Holiday.",
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
    rating: { rate: 3.6, count: 145 },
    stock: 17,
    isFeatured: false,
    badge: null
  }
];

// Initial Seed Users (Simulated Auth)
export const SEED_USERS = [
  {
    id: 'usr_admin_1',
    name: 'Alex Vance',
    email: 'admin@shopsphere.com',
    password: 'Password@123',
    role: 'admin',
    createdAt: '2026-01-15T10:00:00.000Z',
    address: '100 Silicon Way, Tech City, CA'
  },
  {
    id: 'usr_cust_1',
    name: 'Sarah Jenkins',
    email: 'demo@shopsphere.com',
    password: 'Password@123',
    role: 'customer',
    createdAt: '2026-02-20T14:30:00.000Z',
    address: '742 Evergreen Terrace, Springfield, OR'
  }
];

// Initial Seed Orders (for instant customer dashboard evaluation)
export const SEED_ORDERS = [
  {
    id: 'ORD-2026-8941',
    userId: 'usr_cust_1',
    date: '2026-08-14T15:20:00.000Z',
    status: 'Delivered',
    items: [
      {
        id: 1,
        title: "Fjallraven - Foldsack No. 1 Backpack",
        price: 109.95,
        quantity: 1,
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
      },
      {
        id: 2,
        title: "Mens Casual Premium Slim Fit T-Shirts",
        price: 22.30,
        quantity: 2,
        image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
      }
    ],
    subtotal: 154.55,
    tax: 12.36,
    shipping: 0,
    total: 166.91,
    shippingAddress: {
      fullName: "Sarah Jenkins",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "97477",
      country: "United States"
    }
  },
  {
    id: 'ORD-2026-9210',
    userId: 'usr_cust_1',
    date: '2026-09-02T11:45:00.000Z',
    status: 'In Transit',
    items: [
      {
        id: 8,
        title: "WD 2TB Elements Portable External Hard Drive",
        price: 64.00,
        quantity: 1,
        image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg"
      }
    ],
    subtotal: 64.00,
    tax: 5.12,
    shipping: 0,
    total: 69.12,
    shippingAddress: {
      fullName: "Sarah Jenkins",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      postalCode: "97477",
      country: "United States"
    }
  }
];

/* --------------------------------------------------------------------------
   Event Dispatcher Helper
   -------------------------------------------------------------------------- */
export function emitStorageEvent(eventName, detail = {}) {
  try {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  } catch (e) {
    console.warn("Event dispatch not available in this context", e);
  }
}

/* --------------------------------------------------------------------------
   Product Storage Methods
   -------------------------------------------------------------------------- */
export function getStoredProducts() {
  const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing stored products, re-seeding", err);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
}

export function saveStoredProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  emitStorageEvent('shopsphere:products-updated', { products });
}

/* --------------------------------------------------------------------------
   Cart Storage Methods
   -------------------------------------------------------------------------- */
export function getCart() {
  const raw = localStorage.getItem(STORAGE_KEYS.CART);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  emitStorageEvent('shopsphere:cart-updated', { cart, count: getCartTotalCount(cart) });
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.CART);
  emitStorageEvent('shopsphere:cart-updated', { cart: [], count: 0 });
}

export function getCartTotalCount(cart = getCart()) {
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

/* --------------------------------------------------------------------------
   Wishlist Storage Methods
   -------------------------------------------------------------------------- */
export function getWishlist() {
  const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWishlist(wishlist) {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  emitStorageEvent('shopsphere:wishlist-updated', { wishlist, count: wishlist.length });
}

export function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === Number(productId));
}

/* --------------------------------------------------------------------------
   Users & Session Storage Methods
   -------------------------------------------------------------------------- */
export function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_USERS;
  }
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  emitStorageEvent('shopsphere:auth-changed', { user });
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  emitStorageEvent('shopsphere:auth-changed', { user: null });
}

/* --------------------------------------------------------------------------
   Orders Storage Methods
   -------------------------------------------------------------------------- */
export function getOrders() {
  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_ORDERS;
  }
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  emitStorageEvent('shopsphere:orders-updated', { orders });
}

export function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

// Global initialization helper
export function initStorage() {
  getStoredProducts();
  getUsers();
  getOrders();
}
