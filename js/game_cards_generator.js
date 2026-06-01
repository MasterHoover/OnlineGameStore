import { addItemToCart } from "./cart.js";
import { GameRecord } from "./GameRecord.js";

const CATALOG_GRID_ID = "catalog-grid";
const DATABASE_EMPTY_MESSAGE = "NO ITEMS";
const IMAGE_PATH = "assets/images/";
const IMAGE_PLACEHOLDER = "placeholder.jpg";
const CARD_CLASS = "card-tag";

/**
 * @param {Array} game_database - The mock game database
 */
export function generateGameCards(game_database) {
    const GAME_DATABASE = game_database;
    const catalogGrid = document.getElementById(CATALOG_GRID_ID); // The grid container for game cards
    if (!catalogGrid) {
        console.error(`Catalog grid is not found with ID ${CATALOG_GRID_ID}`)
    }
    else {
        catalogGrid.innerHTML = GAME_DATABASE.length > 0 ? "" : DATABASE_EMPTY_MESSAGE;

        if (GAME_DATABASE.length == 0) {
            console.log("The game database is empty");
        }
        else {
            GAME_DATABASE.forEach((game, index) => {
                const card = GenerateCardElement(game);
                console.log(`#${game.id}: ${game.title}`);
                catalogGrid.append(card);
            });
        }
    }

}

/**
 * @param { GameRecord } game_record
 */
function GenerateCardElement(game_record) {

    // 1. Create a new DOM element node container
    const cardElement = document.createElement("article");
    const fullImagePath = IMAGE_PATH + game_record.image
    cardElement.className = "game-card";

    // 2. Populate the inside of the card
    cardElement.innerHTML = `
        <div class="card-image-container">
            <img 
                src="${IMAGE_PATH + (game_record.image || IMAGE_PLACEHOLDER)}" 
                alt="${game_record.title} Cover Art" 
                class="game-cover-img"
                onerror="this.onerror=null; this.src='${IMAGE_PATH}${IMAGE_PLACEHOLDER}';"
                data-testid="game-img-${game_record.id}"
            />
        </div>

        <div class="card-details">
            <span class="card-platform-tag">${game_record.platform}</span>
            <h2 class="game-title" data-testid="game-title-${game_record.id}">${game_record.title}</h2>
            <p class="game-price" data-testid="game-price-${game_record.id}">$${game_record.price.toFixed(2)}</p>
            <button class="btn-add-cart" data-id="${game_record.id}" data-testid="add-to-cart-${game_record.id}">Add to Cart</button>
        </div>
    `;

    const addToCartBtn = cardElement.querySelector(".btn-add-cart");
    addToCartBtn.addEventListener("click", addItemToCart // => {
        // Access your game object properties or the button data-id attribute easily!
        //
        // Call your shopping cart instance logic here, e.g., myCart.addItem(game_record);
        //}
    );

    return cardElement;
}