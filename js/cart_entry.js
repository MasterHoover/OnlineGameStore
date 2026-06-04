import { loadCart, updateCartCounter, renderCartPage, setupCartEventListeners } from "./modules/cart_core.js";

function onCartLoad() {
    console.log("Initializing Shopping Cart Page Content...");
    loadCart();
    updateCartCounter();
    renderCartPage();
    setupCartEventListeners(); // 👈 Initialize the listener engine here!
}

onCartLoad();