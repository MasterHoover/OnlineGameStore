// This is the platform code (in the database) and label (display text) mapping
// value = platform code in the db (Should match the codes in the database or it would cause an error. E.g. if the code in the db is ps4 and the value in the mapping is playstation4, there will be an error)
// label = display text in the web page

// Intentional typo. To use typo, comment "ps4" and uncomment "playstation4"
export const ERA_PLATFORM_MAP = {
    modern: [
        { value: "ps5", label: "PlayStation® 5" },
        { value: "ps4", label: "PlayStation® 4" },
        { value: "playstation4", label: "PlayStation® 4" },
        { value: "switch2", label: "Nintendo Switch 2" },
        { value: "switch", label: "Nintendo Switch" },
        { value: "xbs", label: "Xbox Series X|S" },
        { value: "xb1", label: "Xbox One" }
    ],
    retro: [
        { value: "ps3", label: "PS3" },
        { value: "ps2", label: "PS2" },
        { value: "ps1", label: "PS1" },
        { value: "wiiu", label: "Wii U" },
        { value: "wii", label: "Wii" },
        { value: "3ds", label: "3DS" },
        { value: "nds", label: "Nintendo DS" },
        { value: "gba", label: "Game Boy Advance" },
        { value: "gbc", label: "Game Boy Color" },
        { value: "gb", label: "Game Boy" },
        { value: "ngc", label: "Nintendo GameCube" },
        { value: "n64", label: "N64" },
        { value: "snes", label: "SNES" },
        { value: "nes", label: "NES" },
        { value: "xbox", label: "XBOX" },
        { value: "dreamcast", label: "Sega Dreamcast" },
        { value: "saturn", label: "Sega Saturn" },
        { value: "genesis", label: "Sega Genesis" },
        { value: "mastersystem", label: "Sega Master System" }
    ]
};

export function getGameEra(platform) {
    if (ERA_PLATFORM_MAP.modern.some(p => p.value === platform)) {
        return "modern";
    }
    if (ERA_PLATFORM_MAP.retro.some(p => p.value === platform)) {
        return "retro";
    }
    return "unknown";
}

export function getPlatformLabel(dbValue) {
    const allPlatforms = [...ERA_PLATFORM_MAP.modern, ...ERA_PLATFORM_MAP.retro];

    // 2. Look for the object where the 'value' matches your database string
    const match = allPlatforms.find(platform => platform.value === dbValue);

    // 3. If a match is found, return its label. 
    // Otherwise, safely fall back to the capitalized raw string (e.g., "PC") so the UI doesn't break.
    return match ? match.label : dbValue.toUpperCase();
}