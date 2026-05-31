document.addEventListener("DOMContentLoaded", () => {
    // Grab references to the HTML elements
    const sizeSelect = document.getElementById("size-select");
    const mainImage = document.getElementById("product-main-img");
    const thumbImage = document.getElementById("product-thumb-img");
    const priceDisplay = document.getElementById("price-display");

    // Safety check: ensure required elements exist on this specific page
    if (sizeSelect && mainImage && priceDisplay) {

        // Function to update view based on a specific <option> element
        function updateProductView(optionElement, updateUrl = true) {
            if (!optionElement) return;

            // Extract the custom data attributes directly from the HTML option
            const price = optionElement.getAttribute("data-price");
            const imageSrc = optionElement.getAttribute("data-image");
            const imageAlt = optionElement.getAttribute("data-alt");
            const urlCode = optionElement.value; // 'l', 'm', or 's'

            // 1. Update UI Elements
            if (price) priceDisplay.textContent = price;
            if (imageSrc) {
                mainImage.src = imageSrc;
                mainImage.alt = imageAlt || "";
                
                if (thumbImage) {
                    thumbImage.src = imageSrc;
                    thumbImage.alt = imageAlt || "";
                }
            }

            // 2. Keep dropdown select menu visually synced
            sizeSelect.value = urlCode;

            // 3. Update the URL parameter seamlessly for sharing (?variant=m)
            if (updateUrl) {
                const newUrl = window.location.protocol + "//" + 
                               window.location.host + 
                               window.location.pathname + 
                               `?variant=${urlCode}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
            }
        }

        // ==========================================================================
        // RUN ON PAGE LOAD
        // ==========================================================================
        const urlParams = new URLSearchParams(window.location.search);
        const currentVariantParam = urlParams.get('variant')?.toLowerCase(); // e.g., 'm'
        
        // Try to find an option matching the URL parameter
        let targetOption = Array.from(sizeSelect.options).find(opt => opt.value === currentVariantParam);

        if (targetOption) {
            // URL matched perfectly (e.g., ?variant=m), load that variant directly
            updateProductView(targetOption, false);
        } else {
            // No valid URL parameter? Default to the very first choice listed in your HTML (Large)
            updateProductView(sizeSelect.options[0], true);
        }

        // ==========================================================================
        // RUN ON USER SELECTION CHANGE
        // ==========================================================================
        sizeSelect.addEventListener("change", (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            updateProductView(selectedOption, true);
        });
    }
});