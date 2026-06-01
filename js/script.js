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