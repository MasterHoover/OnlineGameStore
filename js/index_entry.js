import { GAME_DATABASE } from "./data/game_database.js";
import { renderCatalogGrid, setupCatalogFilterListeners } from "./modules/catalog_core.js"; // 👈 Added import here
import { loadCart, updateCartCounter } from "./modules/cart_core.js";
import { initHeroCarousel } from "./modules/carousel_core.js";

function onIndexLoad() {
    console.log("Initializing Index Catalog Page...");
    loadCart();                       // Populates global state
    updateCartCounter();              // Sets navbar badge number
    renderCatalogGrid(GAME_DATABASE); // Builds the grid visual layout
    setupCatalogFilterListeners();    // 👈 Wire up the live filters here!
    // 🆕 Boot the carousel slider loop
    initHeroCarousel();
}

// Fire initialization immediately upon file load
onIndexLoad();