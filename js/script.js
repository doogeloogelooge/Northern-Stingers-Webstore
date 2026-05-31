document.addEventListener("DOMContentLoaded", function () {
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
});