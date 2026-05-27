// --- Supabase konfiguration ---
const SUPABASE_URL = "https://oqhkidahpkhrhayxgeum.supabase.co"; // 
const SUPABASE_KEY = "sb_publishable_X99T3SQDpC5WT3Df8K8V_Q_2zDICoRx"; // 

// Initiera Supabase-klienten (Se till att du har CDN-länken i din HTML)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Lokal array för att spara produkterna vi hämtar från databasen
let dbProducts = [];

// Lokal prislista (eftersom pris inte fanns i din produkttabell ännu)
const priceMatrix = {
    "chain-stinger": {
        "Standard": { "Small": 29, "Medium": 35, "Large": 39 }, // [cite: 5]
        "UV": { "Small": 35, "Medium": 39, "Large": 45 } // [cite: 5]
    },
    "mono-leader": { "20cm": 29, "30cm": 35, "40cm": 39 }, // [cite: 6]
    "jig-heads": { "7g": 35, "10g": 39 }, // [cite: 6]
    "split-rings": { "10st": 17, "15st": 27, "20st": 33 }, // [cite: 7]
    "swivels": { "10st": 19, "15st": 29, "20st": 35 }, // [cite: 8]
    "uv-hooks": { "#1/0": 40, "#2/0": 40 }, // [cite: 8]
    "digital-scale": { "Standard": 199 } // [cite: 9]
};

document.addEventListener("DOMContentLoaded", async () => {
    // 1. HÄMTA ALLA PRODUKTER FRÅN SUPABASE VID START
    await fetchProductsFromSupabase();

    // 2. INITIERA ALLA PRODUKTKORT PÅ SIDAN
    initChainStinger();
    initStandardProduct("prod-mono-leader", "mono-leader", "HÅRD MONO TAFS");
    initStandardProduct("prod-jig-heads", "jig-heads", "JIGGSKALLAR 4-PACK");
    initStandardProduct("prod-split-rings", "split-rings", "SPLIT-RINGS");
    initStandardProduct("prod-swivels", "swivels", "LEKANDEN");
    initStandardProduct("prod-uv-hooks", "uv-hooks", "UV KROKAR 4-PACK");
    initStandardProduct("prod-digital-scale", "digital-scale", "ROBUST VÅG 50kg");

    // 3. VARUKORGS-FUNKTIONALITET
    initCart();
});

// Funktion för att hämta all data från din tabell 'products'
async function fetchProductsFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*');

        if (error) throw error;
        dbProducts = data; // Spara datan lokalt i vår array
        console.log("Data hämtad från Supabase:", dbProducts);
    } catch (error) {
        console.error("Kunde inte hämta data från Supabase:", error.message);
    }
}

// Logik för Chain Stinger (eftersom namnet i din DB är uppdelat i "LARGE CHAIN STINGER", "MEDIUM..." etc)
function initChainStinger() {
    const card = document.getElementById("prod-chain-stinger");
    if (!card) return;

    const variantSel = card.querySelector(".variant-select");
    const sizeSel = card.querySelector(".size-select");
    const priceTxt = card.querySelector(".price-val");
    const imgEl = document.getElementById("img-chain-stinger");
    const buyBtn = card.querySelector(".add-to-cart");

    function updateCard() {
        const variant = variantSel.value; // "Standard" eller "UV"
        const size = sizeSel.value;       // "Small", "Medium", "Large"

        // Uppdatera pris live utifrån matrisen
        priceTxt.innerText = priceMatrix["chain-stinger"][variant][size];

        // Växla bild baserat på din regel (ignorera storlek, kolla bara variant)
        if (variant === "UV") {
            imgEl.src = "images/uv-stinger.png";
        } else {
            imgEl.src = "images/chain-stinger.png";
        }

        // Leta upp matchande produkt i Supabase-datan för att kolla lagersaldo
        // I din DB heter de t.ex. "SMALL CHAIN STINGER" och variant "Standard" eller "UV"
        const dbName = `${size.toUpperCase()} CHAIN STINGER`;
        const matchedProduct = dbProducts.find(p => p.name === dbName && p.variant === variant);

        if (matchedProduct) {
            // Spara databasens ID på knappen så vi vet vad kunden köper
            buyBtn.setAttribute("data-product-id", matchedProduct.id);
            
            // Kolla lagersaldo (stock_quantity)
            if (matchedProduct.stock_quantity <= 0) {
                buyBtn.innerText = "Slutsåld";
                buyBtn.disabled = true;
                buyBtn.style.opacity = "0.5";
            } else {
                buyBtn.innerText = "Lägg i varukorg";
                buyBtn.disabled = false;
                buyBtn.style.opacity = "1";
            }
        }
    }

    variantSel.addEventListener("change", updateCard);
    sizeSel.addEventListener("change", updateCard);
    
    // Kör en gång vid start om datan laddats
    if (dbProducts.length > 0) updateCard();
}

// Logik för standardprodukter (Tafsar, jiggskallar, ringar, lekanden, våg)
function initStandardProduct(cardId, matrixKey, dbName) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const sizeSel = card.querySelector(".size-select");
    const priceTxt = card.querySelector(".price-val");
    const buyBtn = card.querySelector(".add-to-cart");

    function updateCard() {
        const selectedVariant = sizeSel.value; // T.ex. "20cm", "7g", "10st"

        // Uppdatera priset
        if (priceMatrix[matrixKey][selectedVariant]) {
            priceTxt.innerText = priceMatrix[matrixKey][selectedVariant];
        } else if (priceMatrix[matrixKey]["Standard"]) {
            priceTxt.innerText = priceMatrix[matrixKey]["Standard"];
        }

        // Sök i din Supabase-data efter matchande namn och variant
        const matchedProduct = dbProducts.find(p => p.name === dbName && p.variant === selectedVariant);

        if (matchedProduct) {
            buyBtn.setAttribute("data-product-id", matchedProduct.id);

            // Kolla lagerstatus
            if (matchedProduct.stock_quantity <= 0) {
                buyBtn.innerText = "Slutsåld";
                buyBtn.disabled = true;
                buyBtn.style.opacity = "0.5";
            } else {
                buyBtn.innerText = "Lägg i varukorg";
                buyBtn.disabled = false;
                buyBtn.style.opacity = "1";
            }
        }
    }

    sizeSel.addEventListener("change", updateCard);
    if (dbProducts.length > 0) updateCard();
}

// Varukorgs-knapparna och räknaren
function initCart() {
    const cartCountElement = document.getElementById("cart-count");
    let currentCartCount = 0;
    const buyButtons = document.querySelectorAll(".add-to-cart");

    buyButtons.forEach(button => {
        button.addEventListener("click", function() {
            const productId = this.getAttribute("data-product-id");
            console.log(`Produkt med ID ${productId} lades till i kundvagnen.`);

            currentCartCount++;
            cartCountElement.innerText = currentCartCount;

            // Klick-feedback
            const originalText = this.innerText;
            this.innerText = "Tillagd!";
            this.style.backgroundColor = "var(--text-white)";
            this.style.color = "var(--bg-black)";

            setTimeout(() => {
                this.innerText = originalText;
                this.style.backgroundColor = "";
                this.style.color = "";
            }, 1000);
        });
    });
}