document.addEventListener("DOMContentLoaded", function () {
  
  // ==========================================
  // 1. PRODUCT FILTERING LOGIC
  // ==========================================
  const tabs = document.querySelectorAll(".tab");
  const products = document.querySelectorAll(".product-card");

  filterProducts("spinnfiske");

  tabs.forEach(tab => {
    tab.addEventListener("click", function () {
      tabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      const targetCategory = this.getAttribute("data-target");
      filterProducts(targetCategory);
    });
  });

  function filterProducts(categoryName) {
    products.forEach(card => {
      const cardCategory = card.getAttribute("data-category");

      if (cardCategory === categoryName) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  // ==========================================
  // 2. CART DRAWER LOGIC (Moved Inside DOMContentLoaded)
  // ==========================================
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');

  // Functions are placed inside to keep everything nicely encapsulated
  function openCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; 
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = ''; 
    }
  }

  // Safety checks added in case these elements don't exist on all pages
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

});

function initializeGlobalSearch() {
  const searchBar = document.querySelector('#search-bar input');
  const searchBtn = document.querySelector('#search-bar button');

  if (!searchBar || !searchBtn) return;

  // Function to handle redirection
  function executeSearch() {
    const query = searchBar.value.trim();
    if (query.length > 0) {
      // Redirect to search page with query parameter
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  }

  // Listen for Enter key press
  searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  });

  // Listen for button click
  searchBtn.addEventListener('click', executeSearch);
}

// Global Wishlist Management Utilities
function getWishlist() {
  return JSON.parse(localStorage.getItem('ns_wishlist')) || [];
}

function toggleWishlist(productSlug, heartImgElement) {
  let wishlist = getWishlist();
  
  if (wishlist.includes(productSlug)) {
    // Remove from wishlist
    wishlist = wishlist.filter(slug => slug !== productSlug);
    heartImgElement.src = '/images/heart.png'; // Empty heart
    heartImgElement.classList.remove('active-heart');
  } else {
    // Add to wishlist
    wishlist.push(productSlug);
    heartImgElement.src = '/images/heart-filled.png'; // Make sure you have a filled heart asset!
    heartImgElement.classList.add('active-heart');
  }
  
  localStorage.setItem('ns_wishlist', JSON.stringify(wishlist));
  updateWishlistNavCount();
}

// updates the navigation heart icon with a little badge count if items exist
function updateWishlistNavCount() {
  const favoritesBtn = document.getElementById('favorites-btn');
  if (!favoritesBtn) return;
  
  const wishlist = getWishlist();
  let badge = favoritesBtn.querySelector('.nav-badge');
  
  if (wishlist.length > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      favoritesBtn.appendChild(badge);
    }
    badge.textContent = wishlist.length;
  } else if (badge) {
    badge.remove();
  }
}

// Attach a delegation listener to your headers or document on initial load
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistNavCount();

  // Redirect to favorites page when clicking the nav button
  const favoritesBtn = document.getElementById('favorites-btn');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
      window.location.href = '/wishlist.html';
    });
  }
});

// --- GLOBAL WISHLIST ENGINE ---

// 1. Fetch array from localStorage safely
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('ns_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

// 2. Main handler to toggle a product on/off
function toggleWishlist(productSlug, heartImgElement) {
  let wishlist = getWishlist();
  
  if (wishlist.includes(productSlug)) {
    // Remove from wishlist
    wishlist = wishlist.filter(slug => slug !== productSlug);
    if (heartImgElement) {
      heartImgElement.src = '/images/heart.png'; // Empty heart
      heartImgElement.classList.remove('active-heart');
    }
  } else {
    // Add to wishlist
    wishlist.push(productSlug);
    if (heartImgElement) {
      heartImgElement.src = '/images/heart-filled.png'; // Filled heart
      heartImgElement.classList.add('active-heart');
    }
  }
  
  localStorage.setItem('ns_wishlist', JSON.stringify(wishlist));
  updateWishlistNavCount();
}

// 3. Update the global header badge count indicator automatically
function updateWishlistNavCount() {
  const favoritesBtn = document.getElementById('favorites-btn');
  if (!favoritesBtn) return;
  
  const wishlist = getWishlist();
  let badge = favoritesBtn.querySelector('.nav-badge');
  
  if (wishlist.length > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      favoritesBtn.appendChild(badge);
    }
    badge.textContent = wishlist.length;
  } else if (badge) {
    badge.remove();
  }
}

// 4. Initial event attachments on load
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistNavCount();

  // Redirect to favorites page when clicking the header heart icon
  const favoritesBtn = document.getElementById('favorites-btn');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
      window.location.href = '/wishlist.html';
    });
  }
});

function updateGlobalCartBadge() {
  const badge = document.getElementById('global-cart-count'); // or whatever your ID is
  if (!badge) return;

  const cart = JSON.parse(localStorage.getItem('shopping_cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  badge.textContent = totalItems;
}

// Update the badge when the page first loads
document.addEventListener('DOMContentLoaded', updateGlobalCartBadge);

// Update the badge instantly whenever items change in the cart
window.addEventListener('cartUpdated', updateGlobalCartBadge);

// Run it once the DOM structure loads
document.addEventListener('DOMContentLoaded', initializeGlobalSearch);