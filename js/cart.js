// --- GLOBAL CART STORAGE ENGINE ---

// 1. Fetch current cart array from localStorage safely
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('ns_cart')) || [];
  } catch (e) {
    return [];
  }
}

// 2. Save cart array state back to localStorage
function saveCart(cartArray) {
  localStorage.setItem('ns_cart', JSON.stringify(cartArray));
  updateCartNavCount();
  
  // Custom dispatch event so if the cart page is open, it updates live!
  window.dispatchEvent(new Event('cartUpdated'));
}

// 3. Add a variant to the cart array
function addToCart(variantId, productSlug, quantity = 1, productName, variantName = "") {
  let cart = getCart();
  
  // Check if this specific item/variant variation is already in the cart
  const existingItem = cart.find(item => item.variantId === variantId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      variantId: variantId,
      productSlug: productSlug,
      quantity: quantity,
      title: productName,
      variant: variantName
    });
  }
  
  saveCart(cart);
}

// 4. Update the visual badge total item count on your header shopping cart icon
function updateCartNavCount() {
  const cartBtn = document.getElementById('cart-toggle-btn');
  if (!cartBtn) return;
  
  const cart = getCart();
  // Sum up all quantities (e.g., 2 hooks + 1 stinger = 3 items total)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  let badge = cartBtn.querySelector('.nav-badge');
  
  if (totalItems > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      cartBtn.appendChild(badge);
    }
    badge.textContent = totalItems;
  } else if (badge) {
    badge.remove();
  }
}

// Run indicator update automatically when any page initializes
document.addEventListener('DOMContentLoaded', updateCartNavCount);