import { addItemToCart, cart, updateCartCounter } from "./cart_core.js";

const CATALOG_GRID_ID = "catalog-grid";
const CART_COUNT_BADGE_ID = "cart-count";
const IMAGE_PATH = "assets/images/";
const IMAGE_PLACEHOLDER = "placeholder.jpg";

export function renderCatalogGrid(gameDatabase) {
    const catalogGrid = document.getElementById(CATALOG_GRID_ID);
    if (!catalogGrid) return;

    catalogGrid.innerHTML = gameDatabase.length > 0 ? "" : "NO ITEMS AVAILABLE";

    gameDatabase.forEach((game) => {
        const card = generateCardElement(game);
        catalogGrid.append(card);
    });
}

function generateCardElement(game) {
    const cardElement = document.createElement("article");
    cardElement.className = "game-card";
    cardElement.setAttribute("data-testid", `game-card-${game.id}`);

    cardElement.innerHTML = `
        <div class="card-image-container">
            <img 
                src="${IMAGE_PATH + (game.image || IMAGE_PLACEHOLDER)}" 
                alt="${game.title} Cover Art" 
                class="game-cover-img"
                onerror="this.onerror=null; this.src='${IMAGE_PATH}${IMAGE_PLACEHOLDER}';"
                data-testid="game-img-${game.id}"
            />
        </div>
        <div class="card-details">
            <span class="card-platform-tag">${game.platform}</span>
            <h2 class="game-title" data-testid="game-title-${game.id}">${game.title}</h2>
            <p class="game-price" data-testid="game-price-${game.id}">$${game.price.toFixed(2)}</p>
            <button class="btn-add-cart" data-id="${game.id}" data-testid="add-to-cart-${game.id}">Add to Cart</button>
        </div>
    `;

    // Hook up the click event directly to your updated cart core method
    const addBtn = cardElement.querySelector(".btn-add-cart");
    addBtn.addEventListener("click", (event) => {
        addItemToCart(game.id);
        updateCartCounter();
    });

    return cardElement;
}