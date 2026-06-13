// A GameRecord is a mock database object
export class GameRecord {

    // The category field has been streamlined. It is deduced from the platforms themselves
    /*static Categories = Object.freeze({
        MODERN: "modern",
        RETRO: "retro"
    })*/

    static PLATFORMS = Object.freeze({
        SWITCH2: "switch2",
        PS5: "ps5",
        PS4: "ps4",
        XBOXONE: "xbone",
        XBOXSERIES: "xbseries",
        PS3: "ps3",
        PS2: "ps2",
        PS1: "ps1",
        N64: "n64",
        SNES: "snes",
        NES: "nes"
    });

    static auto_incrementing_id = 1;

    /**
     * Creates an instance of a Game product.
     * @param {string} title - The display name of the title.
     * @param {string} category - The filtering category. Use Categories class.
     * @param {string} platform - The hardware console target. Use Platforms class.
     * @param {number} price - The retail price in CAD.
     * @param {number} stock - The current inventory count.
     * @param {string} image - Text or path representing the card artwork.
     */
    constructor(title, /*category,*/ platform, price, stock, image) {
        this.id = GameRecord.auto_incrementing_id++;
        this.title = title;
        //this.category = category;
        this.platform = platform;
        this.price = price;
        this.stock = stock;
        this.image = image;
    }
}
