document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab");
  const products = document.querySelectorAll(".product-card");

  / Run the filter system once immediately on page load to initialize the active grid view state
  filterProducts("spinnfiske");

  tabs.forEach(tab => {
    tab.addEventListener("click", function () {
      / 1. Remove the active color styling theme from all tabs
      tabs.forEach(t => t.classList.remove("active"));
      
      / 2. Assign the active visual indicator highlights to the clicked tab button element
      this.classList.add("active");

      / 3. Extract the category keyword name from the custom target attribute field
      const targetCategory = this.getAttribute("data-target");

      / 4. Run execution filter method parameters
      filterProducts(targetCategory);
    });
  });

  / Reusable filtering engine structure 
  function filterProducts(categoryName) {
    products.forEach(card => {
      const cardCategory = card.getAttribute("data-category");

      if (cardCategory === categoryName) {
        / If categories match up cleanly, remove hidden styling rules to reveal item card panel
        card.classList.remove("is-hidden");
      } else {
        / If categories mismatch, append layout hide configuration parameters
        card.classList.add("is-hidden");
      }
    });
  } 
});