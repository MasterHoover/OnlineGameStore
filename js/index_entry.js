import { GAME_DATABASE } from "./data/game_database.js";
import { renderCatalogGrid } from "./modules/catalog_core.js";
import { loadCart, updateCartCounter } from "./modules/cart_core.js";

function onIndexLoad() {
    console.log("Initializing Index Catalog Page...");
    loadCart();            // Populates global state
    updateCartCounter();   // Sets navbar badge number
    renderCatalogGrid(GAME_DATABASE); // Builds the grid visual layout
}

// Fire initialization immediately upon file load
onIndexLoad();