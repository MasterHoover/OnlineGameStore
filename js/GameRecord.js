// A GameRecord is a mock database object
export class GameRecord {
    static Categories = Object.freeze({
        MODERN: "modern",
        RETRO: "retro"
    })

    static Platforms = Object.freeze({
        SWITCH2: "Nintendo Switch 2",
        PS5: "PlayStation® 5",
        PS4: "PlayStation® 4",
        XBOXONE: "Xbox One",
        XBOXSERIES: "Xbox Series X|S",
        PS3: "PlayStation® 3",
        PS2: "PlayStation® 2",
        PS1: "PlayStation®",
        N64: "Nintendo 64",
        SNES: "SNES",
        NES: "NES"
    })

    static auto_incrementing_id = 0;

    /**
     * Creates an instance of a Game product.
     * @param {string} title - The display name of the title.
     * @param {string} category - The filtering category. Use Categories class.
     * @param {string} platform - The hardware console target. Use Platforms class.
     * @param {number} price - The retail price in CAD.
     * @param {number} stock - The current inventory count.
     * @param {string} image - Text or path representing the card artwork.
     */
    constructor(title, category, platform, price, stock, image) {
        this.id = GameRecord.auto_incrementing_id++;
        this.title = title;
        this.category = category;
        this.platform = platform;
        this.price = price;
        this.stock = stock;
        this.image = image;
    }
}
