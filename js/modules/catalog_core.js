import { addItemToCart, cart, updateCartCounter } from "./cart_core.js";
// 📦 Import your source database array for the filtering calculations
import { GAME_DATABASE } from "../data/game_database.js";

import { ERA_PLATFORM_MAP } from "./platform_mapping.js";
import { getGameEra } from "./platform_mapping.js";
import { getPlatformLabel } from "./platform_mapping.js";

import { FEATURED_RELEASES } from "../data/featured_data.js";

/**
 * 🔄 Mock SQL Inner Join
 * Simulates: SELECT * FROM game_database INNER JOIN featured_releases ON game_database.id = featured_releases.gameId
 */
export function getFeaturedGames() {
    return FEATURED_RELEASES.map(featured => {
        const game = GAME_DATABASE.find(g => g.id === featured.gameId);
        if (!game) return null;

        // 🎯 Stitch the trailerUrl onto the game data object dynamically
        return {
            ...game,
            trailerUrl: featured.trailerUrl || "#"
        };
    }).filter(Boolean);
}

const CATALOG_GRID_ID = "catalog-grid";
const CART_COUNT_BADGE_ID = "cart-count";
const IMAGE_PATH = "assets/images/";
const IMAGE_PLACEHOLDER = "placeholder.jpg";

/**
 * Renders the product grid. 
 * Accepts a database array parameter, falling back to GAME_DATABASE if omitted.
 */
export function renderCatalogGrid(gameDatabase = GAME_DATABASE) {
    const catalogGrid = document.getElementById(CATALOG_GRID_ID);
    if (!catalogGrid) return;

    if (gameDatabase.length === 0) {
        catalogGrid.innerHTML = `<p class="catalog-empty-message">No games match your filtering criteria.</p>`;
        return;
    }

    catalogGrid.innerHTML = "";
    gameDatabase.forEach((game) => {
        const card = generateCardElement(game);
        catalogGrid.append(card);
    });
}

function generateCardElement(game) {
    const cardElement = document.createElement("article");
    cardElement.className = "game-card";
    cardElement.setAttribute("data-testid", `game-card-${game.id}`);

    const cleanLabel = getPlatformLabel(game.platform);

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
            <span class="card-platform-tag">${cleanLabel}</span>
            <h2 class="game-title" data-testid="game-title-${game.id}">${game.title}</h2>
            <p class="game-price" data-testid="game-price-${game.id}">$${game.price.toFixed(2)}</p>
            <button class="btn-add-cart" data-id="${game.id}" data-testid="add-to-cart-${game.id}">Add to Cart</button>
        </div>
    `;

    const addBtn = cardElement.querySelector(".btn-add-cart");
    addBtn.addEventListener("click", (event) => {
        addItemToCart(game.id);
        updateCartCounter();
    });

    return cardElement;
}

/**
 * 🔍 Centralized Filter Pipeline Engine
 * Reads text input and dropdown selections simultaneously to slice the database
 */
export function filterCatalog() {
    const searchInput = document.getElementById("search-input");
    const eraSelect = document.getElementById("era-select");
    const platformSelect = document.getElementById("platform-select");

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedEra = eraSelect ? eraSelect.value : "all";
    const selectedPlatform = platformSelect ? platformSelect.value : "all";

    const filteredGames = GAME_DATABASE.filter((game) => {
        // A. Match text search
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);

        // B. Match dynamic runtime Era grouping helper
        const gameEra = getGameEra(game.platform);
        const matchesEra = (selectedEra === "all" || gameEra === selectedEra);

        // C. Match specific platform tag
        const matchesPlatform = (selectedPlatform === "all" || game.platform === selectedPlatform);

        return matchesSearch && matchesEra && matchesPlatform;
    });

    renderCatalogGrid(filteredGames);
}

/**
 * ⚙️ Updated Setup Listeners Hook
 */
export function setupCatalogFilterListeners() {
    const searchInput = document.getElementById("search-input");
    const eraSelect = document.getElementById("era-select");
    const platformSelect = document.getElementById("platform-select");

    // Initialize the platform options correctly immediately on boot
    updatePlatformDropdownOptions();

    if (searchInput) searchInput.addEventListener("input", filterCatalog);
    if (platformSelect) platformSelect.addEventListener("change", filterCatalog);

    if (eraSelect) {
        eraSelect.addEventListener("change", () => {
            // 1. Rebuild the options list matching the newly chosen era context
            updatePlatformDropdownOptions();
            // 2. Fire the filter calculation to recalculate grid display matching the update
            filterCatalog();
        });
    }
}

export function updatePlatformDropdownOptions() {
    const eraSelect = document.getElementById("era-select");
    const platformSelect = document.getElementById("platform-select");
    if (!eraSelect || !platformSelect) return;

    const selectedEra = eraSelect.value;

    // Always start with a fresh "All Platforms" option
    //platformSelect.innerHTML = `<option value="all">All Platforms</option>`;

    if (selectedEra === "all") {
        // Combine all platforms from both eras into the list
        platformSelect.innerHTML = `<option value="all">All Platforms</option>`;
        const allPlatforms = [...ERA_PLATFORM_MAP.modern, ...ERA_PLATFORM_MAP.retro];
        allPlatforms.forEach(p => {
            platformSelect.innerHTML += `<option value="${p.value}">${p.label}</option>`;
        });
    } else if (ERA_PLATFORM_MAP[selectedEra]) {
        // Inject only the platforms linked specifically to this chosen era
        platformSelect.innerHTML = `<option value="all">All ${selectedEra[0].toUpperCase()}${selectedEra.slice(1)} Platforms</option>`
        ERA_PLATFORM_MAP[selectedEra].forEach(p => {
            platformSelect.innerHTML += `<option value="${p.value}">${p.label}</option>`;
        });
    }
}