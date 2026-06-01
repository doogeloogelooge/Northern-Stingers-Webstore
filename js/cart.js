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
  // 2. CART STATE & CORE FUNCTIONALITY
  // ==========================================
  
  // Load existing cart from local storage, or start empty
  let cart = JSON.parse(localStorage.getItem('ns_cart')) || [];

  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsList = document.querySelector('.cart-items-list');
  
  // Footer total selectors
  const totalSummaryElement = document.querySelector('.summary-row.total span:last-child');
  const shippingElement = document.querySelector('.summary-row:not(.total) span:last-child');
  const freeShippingNotice = document.querySelector('.free-shipping-notice');

  function openCart() {
    if (cartDrawer && cartOverlay) {
      renderCart(); // Always refresh view on open
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

  // Save state helper
  function saveCart() {
    localStorage.setItem('ns_cart', JSON.stringify(cart));
  }

  // ==========================================
  // CORE CART ACTIONS
  // ==========================================

  // Add an item or increment its quantity if it already exists
  function addItemToCart(id, title, brand, price, img) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, title, brand, price, img, quantity: 1 });
    }

    saveCart();
    renderCart();
    openCart(); // Slide the cart open automatically
  }

  // Expose function globally so inline onclick events can find it
  window.addItemToCart = addItemToCart;

  // Modify quantities inside the pill selector
  function updateQuantity(id, amount) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += amount;

    // If quantity hits 0 or below, wipe it out completely
    if (item.quantity <= 0) {
      cart = cart.filter(item => item.id !== id);
    }

    saveCart();
    renderCart();
  }

  // Handle direct item deletion via trash can
  function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  }

  // ==========================================
  // RENDERING & CALCULATIONS ENGINE
  // ==========================================
  function renderCart() {
    if (!cartItemsList) return;

    // 1. Clear out previous HTML generation
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="empty-cart-message">Din varukorg är tom.</p>';
      if (totalSummaryElement) totalSummaryElement.textContent = '0 kr';
      if (shippingElement) shippingElement.textContent = '39 kr';
      if (freeShippingNotice) freeShippingNotice.textContent = 'Handla för 399 kr till för att få fri frakt!';
      return;
    }

    let subtotal = 0;

    // 2. Map through array and inject layout matching your design rules
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // 1. Reconstruct the full path safely using the item ID
      // If your item ID is saved as 'ns-uv-krokar-1?variant=1/0', 
      // we attach it directly to the active category folder path.
      let productUrl = '#';
      if (item.id) {
        // Automatically reads the clean page category path (e.g., /fiskeprylar/krokar/)
        const currentFolder = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        productUrl = `${currentFolder}${item.id.toLowerCase()}`;
      }

      const itemHTML = `
        <div class="cart-item" data-id="${item.id}">
          <a href="${productUrl}" class="cart-item-link">
            <img src="${item.img}" alt="${item.title}" class="item-img">
          </a>
          
          <div class="item-details">
            <a href="${productUrl}" class="cart-item-title-link">
              <span class="item-title">${item.title}</span>
            </a>
            <span class="item-brand">${item.brand}</span>
            <div class="item-actions">
              <div class="quantity-selector">
                <button class="qty-minus" data-id="${item.id}">&minus;</button>
                <input type="number" value="${item.quantity}" readonly>
                <button class="qty-plus" data-id="${item.id}">&plus;</button>
              </div>
              <button class="delete-btn" data-id="${item.id}">
                <i class="fa fa-trash-o"></i>
              </button>
            </div>
          </div>
          <div class="item-price">${itemTotal} kr</div>
        </div>
      `;
      cartItemsList.insertAdjacentHTML('beforeend', itemHTML);
    });

    // 3. Financial calculations & Free Shipping Threshold rules
    const shippingThreshold = 399;
    let shippingCost = subtotal >= shippingThreshold ? 0 : 61;
    
    if (shippingCost === 0) {
        if (freeShippingNotice) freeShippingNotice.textContent = "Grattis! Du har uppnått fri frakt.";
        
        // Uses .innerHTML to dynamically inject both text and your HTML image link container
        if (shippingElement) {
            shippingElement.innerHTML = `
            Fri frakt 
            <a href="https://www.postnord.se" target="_blank" class="shipping-alternative-img-cart">
                <img src="/images/icons/postnord.png" alt="PostNord" class="shipping-logo">
            </a>
            `;
        }
        } else {
        const remaining = shippingThreshold - subtotal;
        if (freeShippingNotice) {
            freeShippingNotice.textContent = `Om du handlar för ytterligare ${remaining} kr så får du fraktfritt!`;
        }
        
        // Injects the calculated cost plus the logo link string template safely
        if (shippingElement) {
            shippingElement.innerHTML = `
            ${shippingCost} kr 
            <a href="https://www.postnord.se" target="_blank" class="shipping-alternative-img-cart">
                <img src="/images/icons/postnord.png" alt="PostNord" class="shipping-logo">
            </a>
            `;
        }
        }

    if (totalSummaryElement) totalSummaryElement.textContent = `${subtotal + shippingCost} kr`;
  }

  // ==========================================
  // EVENT DELEGATION
  // ==========================================
  if (cartDrawer) {
    cartDrawer.addEventListener('click', function (e) {
      const target = e.target;
      
      if (target.closest('.qty-minus')) {
        const id = target.closest('.qty-minus').getAttribute('data-id');
        updateQuantity(id, -1);
      }
      
      if (target.closest('.qty-plus')) {
        const id = target.closest('.qty-plus').getAttribute('data-id');
        updateQuantity(id, 1);
      }
      
      if (target.closest('.delete-btn')) {
        const id = target.closest('.delete-btn').getAttribute('data-id');
        removeItem(id);
      }
    });
  }

  // Toggle listeners
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Initial render on page load
  renderCart();

}); 