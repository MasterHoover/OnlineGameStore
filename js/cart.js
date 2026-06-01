// cart.js

import { GAME_DATABASE } from "./game_database.js";
import { CartItem } from "./CartItem.js";

// Catalog Grid ID
const IMAGE_PATH = "assets/images/"
const IMAGE_PLACEHOLDER = "placeholder.jpg"


const CATALOG_GRID_ID = "catalog-grid";
const CART_COUNT_ID = "cart-count";
const LOCAL_STORAGE_CART = "store-cart";
const TOTAL_ITEMS_COUNT_ID = "cart-total-count";
const CART_ITEM_CONTAINER_ID = "cart-items-container";
const CART_EMPTY_MESSAGE = `
            <p class="cart-status-message">Your shopping cart is currently empty.</p>
        `

// cart array
let cart = [];

/*
export function initializeCartSystem(databaseReference) {
    const catalogGrid = document.getElementById(CATALOG_GRID_ID);

    if (!catalogGrid) {
        console.error("Cart System Initialization Failed: #catalog-grid not found.");
        return;
    }

    // Event Delegation: Listen for clicks on the entire grid container
    catalogGrid.addEventListener("click", (event) => {
        // Check if the clicked element is actually an "Add to Cart" button
        if (event.target.classList.contains("btn-add-cart")) {
            handleAddToCart(event, databaseReference);
        }
    });
}
*/

/**
 * Handles the logic of adding an item to the cart
 */
export function addItemToCart(event) {
    const button = event.currentTarget;
    const gameId = parseInt(button.getAttribute("data-id"), 10);

    // 1. Pull current structured cart state
    cart = JSON.parse(localStorage.getItem("store-cart")) || [];

    // 2. Check if the item is already present
    const existingItem = cart.find(item => item.id === gameId);

    if (existingItem) {
        // Increment quantity instead of adding a new entry
        existingItem.quantity += 1;
    } else {
        // Create a new fresh pairing object structure
        cart.push({ id: gameId, quantity: 1 });
    }

    // 3. Persist back to disk and update header metrics
    localStorage.setItem("store-cart", JSON.stringify(cart));
    updateCartCounter();
}

export function loadCart() {
    const rawCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART)) || [];
    cart = rawCart.map(item => new CartItem(item.id, item.quantity));
}

export function updateCartCounter() {
    // 1. Loop through your in-memory cart array and sum up the quantities
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

    console.log("updateCartCounter: total units is " + totalUnits);

    // 2. Update the DOM badge
    const cartCounter = document.getElementById(CART_COUNT_ID);
    if (cartCounter) {
        cartCounter.textContent = totalUnits;
    }
}

function generateCartRowElement(item) {
    const rowElement = document.createElement("div");
    rowElement.className = "cart-item-row";

    rowElement.innerHTML = `
        <div class="cart-item-info">
            <div class="cart-item-img-box">
                <img src="${IMAGE_PATH + (GAME_DATABASE[item.id].image || IMAGE_PLACEHOLDER)}" alt="${GAME_DATABASE[item.id].title} Cover" class="cart-item-img">
            </div>
            <div class="cart-item-meta">
                <h4 class="cart-item-title">${GAME_DATABASE[item.id].title}</h4>
                <span class="cart-item-platform-tag">${GAME_DATABASE[item.id].platform || "Retro"}</span>
            </div>
        </div>

        <div class="cart-item-quantity-control">
            <button class="btn-qty-minus" aria-label="Decrease quantity">−</button>
            <span class="cart-item-qty-value">${item.quantity || 1}</span>
            <button class="btn-qty-plus" aria-label="Increase quantity">+</button>
        </div>

        <div class="cart-item-pricing">
            <p class="cart-item-line-price">$${((GAME_DATABASE[item.id].price) * (item.quantity || 1)).toFixed(2)}</p>
            <button class="btn-remove-cart-item" data-id="${item.id}">Remove</button>
        </div>
    `
    return rowElement;
}

// Update the total items number shown in the order summary
function updateTotalItems() {
    const total_item_count = document.getElementById(TOTAL_ITEMS_COUNT_ID);
    if (total_item_count) {
        total_item_count.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function compileCart() {
    let cartClone = cart;
    let compiledCart = [];
    while (cartClone.length > 0) {
        const id = cartClone[0];
        let count = 1;
        for (let j = cartClone.length - 1; j > 0; j--) {
            if (cartClone[j] == cartClone[0]) {
                cartClone.splice(j, 1);
                count++;
            }
        }
        compiledCart.push(new CartItem(cartClone[0], count));
        cartClone.splice(0, 1);
    }
    return compiledCart;
}

function generateCart() {
    console.log("Cart content:");
    cart.forEach((item, index) => {
        console.log(GAME_DATABASE[item]);

    });

    const structuredCart = cart;
    const cart_item_container = document.getElementById("cart-items-container");

    if (!cart_item_container) return;

    // Clear out placeholder text cleanly
    cart_item_container.innerHTML = "";

    // 2. Loop directly through the items—no extra compile calculations needed!
    structuredCart.forEach((cartItem) => {
        // cartItem matches your CartItem class format: has .id and .quantity
        const rowElement = generateCartRowElement(cartItem);
        cart_item_container.append(rowElement);
    });

    // Update total calculations
    updateOrderSummary(structuredCart);

    if (cart_item_container) {
        compiledCart.forEach((item) => {
            console.log(item);
            cart_item_container.append(generateCartRowElement(item));
        });
    }
}

function initCartPage() {
    console.log("Init Cart Page")
    // 1. Pull the raw text string from the browser and convert it back to an array
    const savedCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART)) || [];

    if (savedCart.length === 0) {
        const cartItemContainer = document.getElementById("cart-items-container");
        if (cartItemContainer) {
            document.getElementById("cart-items-container").innerHTML = `
            <p class="cart-status-message">Your shopping cart is currently empty.</p>`;
        }

        return;
    }

    // 2. Loop through your saved IDs, cross-reference them with your game database, 
    // and render the horizontal cart rows!
    console.log("Loaded these items from page persistence:", savedCart);
    // renderCartRows(savedCart);
    loadCart();
    updateTotalItems();
    generateCart();
}

// Cart Page load calls
initCartPage();