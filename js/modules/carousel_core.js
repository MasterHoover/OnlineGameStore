import { getFeaturedGames } from "./catalog_core.js";
import { getPlatformLabel } from "./platform_mapping.js";
import { addItemToCart, updateCartCounter } from "./cart_core.js";

let currentSlideIndex = 0;
let carouselTimer = null;
const SLIDE_DELAY = 5000;

export function initHeroCarousel() {
    const heroBanner = document.getElementById("featured-hero");
    if (!heroBanner) return;

    const featuredGames = getFeaturedGames();

    // 🎯 BOUNDARY CONDITION: If no items are featured, hide the container completely!
    if (featuredGames.length === 0) {
        console.log("No featured releases found. Collapsing hero section layout.");
        heroBanner.classList.add("hidden");
        heroBanner.innerHTML = ""; // Ensure it's completely blank
        return;
    }

    // 🎯 SUCCESS STATE: Ensure the hidden class is removed, and build the scaffolding
    heroBanner.classList.remove("hidden");

    // Inject the structural elements (Arrows, Dynamic Stage, and Indicator Track)
    heroBanner.innerHTML = `
        <button class="carousel-arrow prev-arrow" id="hero-prev-btn" aria-label="Previous Slide" data-testid="carousel-prev">❬</button>
        <div class="hero-content-wrapper" id="hero-dynamic-content"></div>
        <button class="carousel-arrow next-arrow" id="hero-next-btn" aria-label="Next Slide" data-testid="carousel-next">❭</button>
        <div class="carousel-dots" id="hero-dots-container"></div>
    `;

    // Initialize layout rendering views
    renderCarouselSlide(featuredGames[currentSlideIndex]);
    renderCarouselDots(featuredGames.length);

    // Bind event hooks to the newly injected elements
    setupCarouselEventListeners(featuredGames);

    // Kick off automatic slideshow background loop execution
    startAutoRotation(featuredGames);
}

function renderCarouselSlide(game) {
    const contentWrapper = document.getElementById("hero-dynamic-content");
    const heroBanner = document.getElementById("featured-hero");
    if (!contentWrapper || !heroBanner) return;

    const cleanPlatform = getPlatformLabel(game.platform);

    heroBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(18,18,20,0.95)), url('assets/images/${game.image || 'placeholder.jpg'}')`;

    contentWrapper.innerHTML = `
        <div class="hero-content">
            <span class="badge">Featured Release — ${cleanPlatform}</span>
            <h1 data-testid="hero-title">${game.title}</h1>
            <p>${game.description || 'Experience this classic release re-imagined on modern displays.'}</p>
            <div class="hero-buttons">
                <button class="btn-primary btn-hero-buy" data-id="${game.id}" data-testid="hero-add-cart">
                    Add to Cart • $${game.price.toFixed(2)}
                </button>
                <button class="btn-secondary" id="hero-trailer" data-url="${game.trailerUrl}" data-testid="hero-trailer-btn">
                    Watch Trailer
                </button>
            </div>
        </div>
    `;

    // Add to Cart Execution Wire
    contentWrapper.querySelector(".btn-hero-buy").addEventListener("click", () => {
        addItemToCart(game.id);
        updateCartCounter();
    });

    // 🎯 NEW: Trailer Button Interactive Router
    const trailerBtn = contentWrapper.querySelector("#hero-trailer");
    trailerBtn.addEventListener("click", () => {
        const url = trailerBtn.getAttribute("data-url");

        if (url && url !== "#") {
            console.log(`Routing user to trailer link: ${url}`);
            // Opens the video clip cleanly in a secure background tab
            window.open(url, "_blank", "noopener,noreferrer");
        } else {
            alert("No trailer presentation available for this classic entry yet!");
        }
    });
}

function renderCarouselDots(totalSlides) {
    const dotsContainer = document.getElementById("hero-dots-container");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.className = `carousel-dot ${i === currentSlideIndex ? 'active' : ''}`;
        dot.setAttribute("data-slide", i);
        dotsContainer.append(dot);
    }
}

function setupCarouselEventListeners(featuredGames) {
    const prevBtn = document.getElementById("hero-prev-btn");
    const nextBtn = document.getElementById("hero-next-btn");
    const dotsContainer = document.getElementById("hero-dots-container");

    nextBtn?.addEventListener("click", () => navigateCarousel(1, featuredGames));
    prevBtn?.addEventListener("click", () => navigateCarousel(-1, featuredGames));

    dotsContainer?.addEventListener("click", (e) => {
        if (e.target.classList.contains("carousel-dot")) {
            const targetIndex = parseInt(e.target.getAttribute("data-slide"), 10);
            resetAutoRotation(featuredGames);
            currentSlideIndex = targetIndex;
            updateCarouselView(featuredGames);
        }
    });
}

function navigateCarousel(direction, featuredGames) {
    resetAutoRotation(featuredGames);
    currentSlideIndex += direction;
    if (currentSlideIndex >= featuredGames.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = featuredGames.length - 1;
    updateCarouselView(featuredGames);
}

function updateCarouselView(featuredGames) {
    renderCarouselSlide(featuredGames[currentSlideIndex]);
    document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlideIndex);
    });
}

function startAutoRotation(featuredGames) {
    carouselTimer = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % featuredGames.length;
        updateCarouselView(featuredGames);
    }, SLIDE_DELAY);
}

function resetAutoRotation(featuredGames) {
    clearInterval(carouselTimer);
    startAutoRotation(featuredGames);
}