/**
 * ShopSphere - Automated Unit & Integration Test Suite
 * Run with: npm test  OR  node tests/test-suite.js
 */

import { isValidEmail, isValidPassword, isValidPositiveNumber, isValidStock, formatCurrency, escapeHTML } from '../js/validation.js';
import { SEED_PRODUCTS, SEED_USERS, SEED_ORDERS } from '../js/storage.js';
import { COUPONS } from '../js/cart.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    failed++;
  }
}

console.log('\n--- Running ShopSphere Test Suite ---');

// 1. Validation Tests
console.log('\n[Group 1: Validation Utilities]');
assert(isValidEmail('test@shopsphere.com') === true, 'Valid email accepts test@shopsphere.com');
assert(isValidEmail('invalid-email') === false, 'Invalid email rejects plain strings');
assert(isValidEmail('') === false, 'Rejects empty email');
assert(isValidPassword('Password@123') === true, 'Accepts password with 6+ chars');
assert(isValidPassword('123') === false, 'Rejects password shorter than 6 chars');
assert(isValidPositiveNumber(49.99) === true, 'Valid positive price passes');
assert(isValidPositiveNumber(-10) === false, 'Negative price rejected');
assert(isValidStock(0) === true, 'Stock can be 0');
assert(isValidStock(25) === true, 'Stock can be positive integer');
assert(isValidStock(-5) === false, 'Stock cannot be negative');
assert(isValidStock(2.5) === false, 'Stock must be an integer');
assert(escapeHTML('<script>alert("xss")</script>') === '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', 'XSS characters properly escaped');
assert(formatCurrency(19.95) === '$19.95', 'Currency formats correctly as $19.95');

// 2. Storage Seeds Tests
console.log('\n[Group 2: Seed Integrity]');
assert(SEED_PRODUCTS.length >= 19, `Seed products catalog loaded with ${SEED_PRODUCTS.length} items`);
assert(SEED_PRODUCTS.every(p => p.id && p.title && p.price > 0 && p.category), 'All seed products have id, title, price, category');
assert(SEED_PRODUCTS.some(p => p.category === "electronics"), 'Seed contains electronics');
assert(SEED_PRODUCTS.some(p => p.category === "jewelery"), 'Seed contains jewelry');
assert(SEED_PRODUCTS.some(p => p.category === "men's clothing"), "Seed contains men's clothing");
assert(SEED_PRODUCTS.some(p => p.category === "women's clothing"), "Seed contains women's clothing");

assert(SEED_USERS.length >= 2, 'Pre-configured test accounts exist');
const adminUser = SEED_USERS.find(u => u.role === 'admin');
assert(adminUser && adminUser.email === 'admin@shopsphere.com', 'Admin seed user is correctly configured');
const custUser = SEED_USERS.find(u => u.role === 'customer');
assert(custUser && custUser.email === 'demo@shopsphere.com', 'Customer seed user is correctly configured');

assert(SEED_ORDERS.length >= 2, 'Seed orders are pre-populated for order tracking');
assert(SEED_ORDERS.every(o => o.id && o.items && o.total > 0 && o.status), 'Orders contain id, items, total, and status');

// 3. Coupons & Promotions Tests
console.log('\n[Group 3: Promo Coupons]');
assert(COUPONS['SAVE10'] && COUPONS['SAVE10'].value === 0.10, 'SAVE10 coupon is 10%');
assert(COUPONS['WELCOME20'] && COUPONS['WELCOME20'].value === 0.20, 'WELCOME20 coupon is 20%');
assert(COUPONS['FREESHIP'] && COUPONS['FREESHIP'].type === 'shipping', 'FREESHIP coupon eliminates shipping');

console.log('\n----------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed with flying colors!\n');
  process.exit(0);
}
