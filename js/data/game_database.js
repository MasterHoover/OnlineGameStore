import { GameRecord } from "../models/GameRecord.js";

/* Removed. The logic for category is streamlined and deduced from the platforms themselves.
const Categories = Object.freeze({
    MODERN: "modern",
    RETRO: "retro"
})
*/
/**
     * Creates an instance of a Game product.
     * @param {number} id - Unique identifier for the game.
     * @param {string} title - The display name of the title.
     * @param {Categories} category - The filtering category. Use Categories class.
     * @param {Platforms} platform - The hardware console target. Use Platforms class.
     * @param {number} price - The retail price in CAD.
     * @param {number} stock - The current inventory count.
     * @param {string} image - Text or path representing the card artwork.
     */

export const GAME_DATABASE = [
    new GameRecord(
        "Resident Evil Generation Pack",
        //Categories.MODERN,
        GameRecord.PLATFORMS.SWITCH2,
        119.99,
        5,
        "REGenerationPack.jpg"
    ),
    new GameRecord(
        "Star Fox: Overhauled",
        //Categories.MODERN,
        GameRecord.PLATFORMS.SWITCH2,
        84.99,
        12,
        "StarFoxOverhauled.jpg"
    ),
    new GameRecord(
        "Breath of Fire III (Legacy Edition)",
        //Categories.RETRO,
        GameRecord.PLATFORMS.PS1,
        39.99,
        3,
        "BreathOfFireIII.jpg"
    ),
    new GameRecord(
        "New",
        //Categories.RETRO,
        GameRecord.PLATFORMS.SNES,
        19.99,
        1,
        "badlink"
    ),
    new GameRecord(
        "other",
        //Categories.MODERN,
        GameRecord.PLATFORMS.N64,
        1.99,
        90,
        ""
    )
];