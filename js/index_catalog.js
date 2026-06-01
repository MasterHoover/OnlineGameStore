// The actual js file embedded in the html docs.
import { GameRecord } from "./GameRecord.js";
import { GAME_DATABASE } from "./game_database.js";
import { generateGameCards } from "./game_cards_generator.js";
import { updateCartCounter } from "./cart.js"
import { loadCart } from "./cart.js";

console.log("Generating Game Cards")
generateGameCards(GAME_DATABASE);
loadCart();
updateCartCounter();
