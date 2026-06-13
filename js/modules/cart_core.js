import { GAME_DATABASE } from "../data/game_database.js";
import { CartItem } from "../models/CartItem.js";

import { ERA_PLATFORM_MAP } from "./platform_mapping.js";
import { getGameEra } from "./platform_mapping.js";
import { getPlatformLabel } from "./platform_mapping.js";

const LOCAL_STORAGE_CART = "store-cart";
const CART_COUNT_ID = "cart-count";
const TOTAL_ITEMS_COUNT_ID = "cart-total-count";
const CART_ITEM_CONTAINER_ID = "cart-items-container";

export let cart = [];

export function loadCart() {
    const rawCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART)) || [];
    cart = rawCart.map(item => new CartItem(item.id, item.quantity));
}

export function addItemToCart(gameId) {
    loadCart();
    const existingItem = cart.find(item => item.id === gameId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(new CartItem(gameId, 1));
    }
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
}

export function updateCartCounter() {
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById(CART_COUNT_ID);
    if (badge) {
        badge.textContent = totalUnits;
    }

    const summaryCount = document.getElementById(TOTAL_ITEMS_COUNT_ID);
    if (summaryCount) {
        summaryCount.textContent = totalUnits;
    }
}

export function renderCartPage() {
    const container = document.getElementById(CART_ITEM_CONTAINER_ID);
    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<p class="cart-status-message">Your shopping cart is currently empty.</p>`;
        updateSummaryCard(0, 0);
        return;
    }

    let overallTotalPrice = 0;
    let overallTotalItems = 0;

    cart.forEach((cartItem) => {
        const gameData = GAME_DATABASE.find(game => game.id === cartItem.id);
        if (!gameData) return;

        const lineTotal = gameData.price * cartItem.quantity;
        overallTotalPrice += lineTotal;
        overallTotalItems += cartItem.quantity;

        // Check if quantity is 1 or lower to block decrementing
        const isMinusDisabled = parseInt(cartItem.quantity, 10) <= 1 ? "disabled" : "";

        const cleanPlatformLabel = getPlatformLabel(gameData.platform);

        const row = document.createElement("article");
        row.className = "cart-item-row";
        row.innerHTML = `
        <div class="cart-row-image cart-item-img-box">
            <img 
                src="assets/images/${gameData.image || 'placeholder.jpg'}" 
                alt="${gameData.title} Cover" 
                class="cart-item-img"
                onerror="this.onerror=null; this.src='assets/images/placeholder.jpg';"
                data-testid="cart-img-${cartItem.id}"
            />
        </div>
        
        <div class="cart-item-details">
            <h3 class="cart-item-title" data-testid="cart-title-${cartItem.id}">${gameData.title}</h3>
            
            <span class="cart-item-platform-tag" data-testid="cart-platform-${cartItem.id}">${cleanPlatformLabel}</span>
            
            <span class="cart-item-unit-price" data-testid="cart-unit-price-${cartItem.id}">
                $${gameData.price.toFixed(2)} / unit
            </span>
            
            <div class="cart-item-quantity-control">
                <button class="btn-qty-decrement" data-id="${cartItem.id}" data-testid="qty-minus-${cartItem.id}">−</button>
                <span class="cart-item-qty-value" data-testid="qty-val-${cartItem.id}">${cartItem.quantity}</span>
                <button class="btn-qty-increment" data-id="${cartItem.id}" data-testid="qty-plus-${cartItem.id}">+</button>
            </div>
        </div>
        
        <div class="cart-item-pricing">
            <span class="cart-item-total-label">Total</span>
            <span class="cart-item-price" data-testid="cart-row-total-${cartItem.id}">$${lineTotal.toFixed(2)}</span>
            <button class="cart-item-remove-btn" data-id="${cartItem.id}" data-testid="qty-remove-${cartItem.id}">Remove</button>
        </div>
    `;
        container.append(row);
    }); // 👈 1. Fixed: Added missing closing bracket and parenthesis for the forEach loop!

    // 💡 2. Added: Sync the aggregated calculation totals over to the sidebar UI component
    updateSummaryCard(overallTotalItems, overallTotalPrice);
} // 👈 3. Fixed: Added missing final closing brace for the renderCartPage function!

function updateSummaryCard(totalCount, totalPrice) {
    const countEl = document.getElementById(TOTAL_ITEMS_COUNT_ID);
    const priceEl = document.getElementById("cart-total-price");

    if (countEl) countEl.textContent = totalCount;
    if (priceEl) priceEl.textContent = `$${totalPrice.toFixed(2)}`;
}

export function setupCartEventListeners() {
    const container = document.getElementById(CART_ITEM_CONTAINER_ID);
    if (!container) return;

    container.addEventListener("click", (event) => {
        const target = event.target;

        // Find out which game ID this button belongs to
        const gameId = parseInt(target.getAttribute("data-id"), 10);
        if (isNaN(gameId)) return;

        loadCart(); // Grab the latest real-time storage state
        const cartItem = cart.find(item => item.id === gameId);

        // Handle Individual Row Deletion Lifecycle Completely
        if (target.classList.contains("cart-item-remove-btn")) {
            // Keep everything EXCEPT the chosen game ID
            cart = cart.filter(item => item.id !== gameId);
            saveAndRefreshCart();
            return; // Exit early since the target item element is now destroyed
        }

        // --- Our Existing Quantity Adjuster Logic Below ---
        if (!cartItem) return;

        // Handle Decrement Action (Hard floor at 1)
        if (target.classList.contains("btn-qty-decrement")) {
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                saveAndRefreshCart();
            }
            // Clicking minus when quantity is 1 now does absolutely nothing!
        }

        // Handle Increment Action
        if (target.classList.contains("btn-qty-increment")) {
            cartItem.quantity += 1;
            saveAndRefreshCart();
        }
    });
}

// Private helper to clean up layout rewriting syntax loops
function saveAndRefreshCart() {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    updateCartCounter(); // Update navigation badge
    renderCartPage();    // Re-draw rows and update sidebar summary math totals
}