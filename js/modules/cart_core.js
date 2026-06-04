import { GAME_DATABASE } from "../data/game_database.js";
import { CartItem } from "../models/CartItem.js";

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
        // Robust .find() method lookup to safely map the correct ID to the database array object
        const gameData = GAME_DATABASE.find(game => game.id === cartItem.id);
        if (!gameData) return;

        const lineTotal = gameData.price * cartItem.quantity;
        overallTotalPrice += lineTotal;
        overallTotalItems += cartItem.quantity;

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
            <span class="cart-item-unit-price" data-testid="cart-unit-price-${cartItem.id}">
                $${gameData.price.toFixed(2)} / unit
            </span>
            <span class="cart-item-qty-value" data-testid="cart-qty-${cartItem.id}">
                Quantity: ${cartItem.quantity}
            </span>
        </div>
        
        <div class="cart-item-pricing">
            <span class="cart-item-total-label">Total</span>
            <span class="cart-item-price" data-testid="cart-row-total-${cartItem.id}">
                $${lineTotal.toFixed(2)}
            </span>
        </div>
    `;
        container.append(row);
    });

    updateSummaryCard(overallTotalItems, overallTotalPrice);
}

function updateSummaryCard(totalCount, totalPrice) {
    const countEl = document.getElementById(TOTAL_ITEMS_COUNT_ID);
    const priceEl = document.getElementById("cart-total-price");

    if (countEl) countEl.textContent = totalCount;
    if (priceEl) priceEl.textContent = `$${totalPrice.toFixed(2)}`;
}