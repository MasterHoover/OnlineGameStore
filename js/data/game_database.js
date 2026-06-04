import { GameRecord } from "../models/GameRecord.js";

const Categories = Object.freeze({
    MODERN: "modern",
    RETRO: "retro"
})

const Platforms = Object.freeze({
    SWITCH2: "Nintendo Switch 2",
    PS5: "PlayStation®5",
    PS4: "PlayStation®4",
    XBOXONE: "Xbox One",
    XBOXSERIES: "Xbox Series X|S",
    PS3: "PlayStation®3",
    PS2: "PlayStation®2",
    PS1: "PlayStation®",
    N64: "Nintendo 64",
    SNES: "SNES",
    NES: "NES"
})

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

function CreateGameRecord(id, title, category, platform, price, stock, image) {
    return {
        id, title, category, platform, price, stock, image
    }
}

export const GAME_DATABASE = [
    new GameRecord(
        "Resident Evil Generation Pack",
        Categories.MODERN,
        Platforms.SWITCH2,
        119.99,
        5,
        "REGenerationPack.jpg"
    ),
    new GameRecord(
        "Star Fox: Overhauled",
        Categories.MODERN,
        Platforms.SWITCH2,
        84.99,
        12,
        "StarFoxOverhauled.jpg"
    ),
    new GameRecord(
        "Breath of Fire III (Legacy Edition)",
        Categories.RETRO,
        Platforms.PS4,
        39.99,
        3,
        "BreathOfFireIII.jpg"
    ),
    new GameRecord(
        "New",
        Categories.RETRO,
        Platforms.SNES,
        19.99,
        1,
        "badlink"
    ),
    new GameRecord(
        "other",
        Categories.MODERN,
        Platforms.N64,
        1.99,
        90,
        ""
    )
];