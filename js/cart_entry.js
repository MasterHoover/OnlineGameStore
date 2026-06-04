import { loadCart, updateCartCounter, renderCartPage } from "./modules/cart_core.js";

function onCartLoad() {
    console.log("Initializing Shopping Cart Page Content...");
    loadCart();
    updateCartCounter();
    renderCartPage();
}

onCartLoad();