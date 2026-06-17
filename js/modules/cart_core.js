import { GAME_DATABASE } from "../data/game_database.js";
import { CartItem } from "../models/CartItem.js";

import { ERA_PLATFORM_MAP } from "./platform_mapping.js";
import { getGameEra } from "./platform_mapping.js";
import { getPlatformLabel } from "./platform_mapping.js";

const LOCAL_STORAGE_CART = "store-cart";
const CART_COUNT_ID = "cart-count";
const TOTAL_ITEMS_COUNT_ID = "cart-total-count";
const CART_ITEM_CONTAINER_ID = "cart-items-container";
const TOTAL_PRICE_ID = "cart-total-price";

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

        // 🎯 FIX: Sync and disable the order summary checkout button before returning!
        updateOrderSummary(cart, GAME_DATABASE);
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

    updateOrderSummary(cart, GAME_DATABASE);
} // 👈 3. Fixed: Added missing final closing brace for the renderCartPage function!

function updateSummaryCard(totalCount, totalPrice) {
    const countEl = document.getElementById(TOTAL_ITEMS_COUNT_ID);
    const priceEl = document.getElementById(TOTAL_PRICE_ID);

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

    initCheckoutModalManager();
}

// Private helper to clean up layout rewriting syntax loops
function saveAndRefreshCart() {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    updateCartCounter(); // Update navigation badge
    renderCartPage();    // Re-draw rows and update sidebar summary math totals
}

// Append this routing engine onto your existing cart_core.js file

export function updateOrderSummary(cartItems, gameDatabase) {
    // 🎯 FIX: Using your correct structural IDs so the elements are found!
    const countElement = document.getElementById(TOTAL_ITEMS_COUNT_ID);
    const priceElement = document.getElementById(TOTAL_PRICE_ID);
    const openBtn = document.getElementById("btn-open-checkout");

    // If your main sidebar wrapper or price fields aren't on this page, exit safely
    if (!priceElement) {
        console.log("Order Summary: Price element not found on this view.");
        return;
    }

    let overallTotalPrice = 0;
    let overallTotalItems = 0;

    cartItems.forEach(item => {
        const game = gameDatabase.find(g => g.id === item.id);
        if (game) {
            overallTotalPrice += game.price * item.quantity;
            overallTotalItems += item.quantity;
        }
    });

    // Update your actual sidebar labels
    if (countElement) {
        countElement.textContent = overallTotalItems;
    }
    priceElement.textContent = `$${overallTotalPrice.toFixed(2)}`;

    // Handle button locking states cleanly
    if (openBtn) {
        if (cartItems.length > 0) {
            openBtn.removeAttribute("disabled");
            openBtn.style.cursor = "pointer";
            openBtn.style.opacity = "1";
            console.log("Checkout button enabled");
        } else {
            openBtn.setAttribute("disabled", "true");
            openBtn.style.cursor = "not-allowed";
            openBtn.style.opacity = "0.5";
            console.log("Checkout button disabled");
        }
    } else {
        console.log("openBtn not found");
    }
}

export function initCheckoutModalManager() {
    const modal = document.getElementById("checkout-modal");
    const openBtn = document.getElementById("btn-open-checkout");
    const closeBtn = document.getElementById("btn-close-checkout");
    const form = document.getElementById("mock-checkout-form");
    const card = document.getElementById("checkout-card");
    const expiry = document.getElementById("checkout-expiry");

    setupCardFormatting(card);
    setupExpiryFormatting(expiry);

    // 🎯 Grab the Submit/Authorize button
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!modal || !openBtn || !closeBtn || !form || !submitBtn) {
        console.log("Cart: Core checkout elements missing");
        return;
    }

    // Toggle Visibility Handlers
    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        // Initial check when opening the modal (will disable the button initially)
        checkFormValidity();
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        resetFormValidationStates();
    });

    // ==========================================================
    // Central Dynamic Button Toggler Logic
    // ==========================================================
    function checkFormValidity() {
        const email = document.getElementById("checkout-email")?.value.trim() || "";
        const name = document.getElementById("checkout-name")?.value.trim() || "";
        const card = document.getElementById("checkout-card")?.value.replace(/\s+/g, "") || "";
        const expiry = document.getElementById("checkout-expiry")?.value.trim() || "";
        const cvv = document.getElementById("checkout-cvv")?.value.trim() || "";

        // Run pristine, silent checks matching your exact regexes
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isNameValid = name.length >= 2;
        const isCardValid = /^\d{12}$/.test(card);
        const isExpiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
        const isCvvValid = /^\d{3}$/.test(cvv);

        const allFieldsValid = isEmailValid && isNameValid && isCardValid && isExpiryValid && isCvvValid;

        // Toggle properties and visual styles based on strict validity status
        if (allFieldsValid) {
            submitBtn.removeAttribute("disabled");
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
        } else {
            submitBtn.setAttribute("disabled", "true");
            submitBtn.style.opacity = "0.5";
            submitBtn.style.cursor = "not-allowed";
        }
    }

    // ==========================================================
    // On-Blur Inline Validation Rules
    // ==========================================================
    const validationRules = [
        { id: "checkout-email", errorId: "err-email", validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) },
        { id: "checkout-name", errorId: "err-name", validate: (val) => val.trim().length >= 2 },
        { id: "checkout-card", errorId: "err-card", validate: (val) => /^\d{12}$/.test(val.replace(/\s+/g, "")) },
        { id: "checkout-expiry", errorId: "err-expiry", validate: (val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val.trim()) },
        { id: "checkout-cvv", errorId: "err-cvv", validate: (val) => /^\d{3}$/.test(val.trim()) }
    ];

    validationRules.forEach(({ id, errorId, validate }) => {
        const inputElement = document.getElementById(id);
        if (!inputElement) return;

        // 1. Show descriptive errors when a user clicks/tabs away
        inputElement.addEventListener("blur", () => {
            const value = inputElement.value;
            if (value.trim() === "") {
                toggleFieldInvalid(inputElement, errorId, false);
                checkFormValidity();
                return;
            }

            toggleFieldInvalid(inputElement, errorId, !validate(value));
            checkFormValidity(); // 🎯 Update button status
        });

        // 2. Real-time typing fallback: When typing inside an input, check if the button can unlock early!
        inputElement.addEventListener("input", () => {
            checkFormValidity();
        });
    });

    // Form Interception Validation Loop
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (validateCheckoutForm()) {
            // ==========================================================
            // 🎯 STEP 2: Capture Data & Generate JSON Order File
            // ==========================================================

            // 1. Construct a structured receipt payload
            const orderReceipt = {
                orderId: `MOCK-ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                timestamp: new Date().toISOString(),
                customer: {
                    name: document.getElementById("checkout-name").value.trim(),
                    email: document.getElementById("checkout-email").value.trim()
                },
                purchasedItems: cart, // Captures the exact array state before the wipe
                finalPricePaid: document.getElementById(TOTAL_PRICE_ID)?.textContent || "$0.00"
            };

            // 2. Convert the JavaScript object into a formatted JSON string
            const jsonString = JSON.stringify(orderReceipt, null, 2);

            // 3. Create a temporary invisible download anchor link in memory
            const blob = new Blob([jsonString], { type: "application/json" });
            const downloadUrl = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement("a");

            downloadAnchor.href = downloadUrl;
            downloadAnchor.download = `${orderReceipt.orderId}.json`; // Sets file name

            // 4. Programmatically click the link to force the browser download pop-up, then clean up
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(downloadUrl);

            // ==========================================================
            // STEP 1: Success Reset Sequence (Your existing cleanup loop)
            // ==========================================================
            alert("🎉 Mock Purchase Successful! Your sandbox receipt JSON has been generated and saved.");

            localStorage.removeItem("shopping_cart");
            if (typeof cart !== 'undefined') {
                cart = [];
            }
            window.location.reload();
        }
    });
}

function validateCheckoutForm() {
    let isValid = true;

    const email = document.getElementById("checkout-email");
    const name = document.getElementById("checkout-name");
    const card = document.getElementById("checkout-card");
    const expiry = document.getElementById("checkout-expiry");
    const cvv = document.getElementById("checkout-cvv");

    // Email Pattern Mapping
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        toggleFieldInvalid(email, "err-email", true);
        isValid = false;
    } else {
        toggleFieldInvalid(email, "err-email", false);
    }

    // Name Validation
    if (name.value.trim().length < 2) {
        toggleFieldInvalid(name, "err-name", true);
        isValid = false;
    } else {
        toggleFieldInvalid(name, "err-name", false);
    }

    // Clean space groupings out of card numbers before verifying numerical length
    const rawCard = card.value.replace(/\s+/g, "");
    if (!/^\d{12}$/.test(rawCard)) {
        toggleFieldInvalid(card, "err-card", true);
        isValid = false;
    } else {
        toggleFieldInvalid(card, "err-card", false);
    }

    // Expiry verification mapping matching (MM/YY)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value.trim())) {
        toggleFieldInvalid(expiry, "err-expiry", true);
        isValid = false;
    } else {
        toggleFieldInvalid(expiry, "err-expiry", false);
    }

    // CVV verification matching
    if (!/^\d{3}$/.test(cvv.value.trim())) {
        toggleFieldInvalid(cvv, "err-cvv", true);
        isValid = false;
    } else {
        toggleFieldInvalid(cvv, "err-cvv", false);
    }

    return isValid;
}

function toggleFieldInvalid(inputElement, errorId, showAlert) {
    const errorSpan = document.getElementById(errorId);
    if (showAlert) {
        inputElement.classList.add("invalid-field");
        if (errorSpan) errorSpan.style.display = "block";
    } else {
        inputElement.classList.remove("invalid-field");
        if (errorSpan) errorSpan.style.display = "none";
    }
}

function resetFormValidationStates() {
    document.getElementById("mock-checkout-form")?.reset();
    const inputs = document.querySelectorAll("#mock-checkout-form input");
    const errors = document.querySelectorAll(".field-error-msg");

    inputs.forEach(i => i.classList.remove("invalid-field"));
    errors.forEach(e => e.style.display = "none");
}

// ==========================================================
// Card Number Automatic Spacing Utility (Every 4 Digits)
// ==========================================================
function setupCardFormatting(cardInput) {
    if (!cardInput) return;

    cardInput.addEventListener("input", (e) => {
        let cursorPosition = cardInput.selectionStart;
        let originalLength = cardInput.value.length;

        // 1. Strip everything that isn't a digit
        let clearValue = cardInput.value.replace(/\D/g, "");

        // 2. Group into blocks of 4 digits using a regex match mapping loop
        let matchBlocks = clearValue.match(/\d{1,4}/g);
        let formattedResult = matchBlocks ? matchBlocks.join(" ") : "";

        cardInput.value = formattedResult;

        // 3. Recalculate and restore caret focus positioning dynamically
        let structuralLengthDifference = formattedResult.length - originalLength;
        cardInput.setSelectionRange(cursorPosition + structuralLengthDifference, cursorPosition + structuralLengthDifference);
    });
}

// ==========================================================
// Expiry Date Auto-Slash Utility (MM/YY)
// ==========================================================
function setupExpiryFormatting(expiryInput) {
    if (!expiryInput) return;

    expiryInput.addEventListener("input", (e) => {
        let cursorPosition = expiryInput.selectionStart;
        let originalLength = expiryInput.value.length;

        // 1. Strip all non-digits
        let clearValue = expiryInput.value.replace(/\D/g, "");

        // 2. Inject slash smoothly after the second character digit is added
        let formattedResult = "";
        if (clearValue.length >= 2) {
            formattedResult = `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
        } else {
            formattedResult = clearValue;
        }

        // 3. Handle deletion case: If user hits backspace right on the slash, don't re-append it!
        if (e.inputType === "deleteContentBackward" && originalLength === 3) {
            formattedResult = clearValue.slice(0, 2);
        }

        expiryInput.value = formattedResult;

        // 4. Readjust text caret bounds safely
        let structuralLengthDifference = formattedResult.length - originalLength;
        expiryInput.setSelectionRange(cursorPosition + structuralLengthDifference, cursorPosition + structuralLengthDifference);
    });
}