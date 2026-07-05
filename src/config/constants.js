/**
 * Liberty Sparks • Application Constants & Configuration
 * Encapsulates static datasets, theme palettes, and default physical boundaries.
 */

export const TRIVIA_FACTS = [
    "Americans spend over $1.5 billion on fireworks each 4th of July, lighting up over 16,000 official public firework displays nationwide!",
    "The tradition of setting off fireworks on the 4th of July began in Philadelphia on July 4, 1777, during the very first organized celebration of Independence Day.",
    "In 1776, John Adams famously wrote to his wife Abigail that America's Independence should be celebrated with 'Pomp and Parade, with Shews, Games, Sports, Guns, Bells, Bonfires and Illuminations from one End of this Continent to the other.'",
    "The Declaration of Independence was officially adopted on July 4, 1776, but most delegates didn't actually sign the historic document until August 2, 1776!",
    "The largest fireworks display in the United States is the annual Macy's 4th of July Fireworks show in New York City, using over 60,000 shells launched from barges!",
    "Different metallic elements give fireworks their colors: Strontium produces deep reds, Copper produces vibrant blues, Barium makes greens, and Sodium creates bright yellows and golds!",
    "The 'crackle' sound in fireworks (often called Dragon's Eggs) is produced by micro-capsules of bismuth subcarbonate or lead tetroxide that explode rapidly in sequence as they burn.",
    "Three U.S. Presidents — John Adams, Thomas Jefferson, and James Monroe — all passed away on the 4th of July! Remarkably, Adams and Jefferson died within hours of each other on July 4, 1826, exactly 50 years after the Declaration of Independence."
];

export const COLOR_THEMES = {
    patriot: [
        { hex: '#E63946', r: 230, g: 57,  b: 70 },  // Crimson Red
        { hex: '#FFFFFF', r: 255, g: 255, b: 255 }, // Bright White
        { hex: '#38B6FF', r: 56,  g: 182, b: 255 }, // Electric Blue
        { hex: '#FFD700', r: 255, g: 215, b: 0 },   // Vibrant Gold
        { hex: '#FF3366', r: 255, g: 51,  b: 102 }  // Spark Red
    ],
    rainbow: [
        { hex: '#FF0055', r: 255, g: 0,   b: 85 },
        { hex: '#FF7700', r: 255, g: 119, b: 0 },
        { hex: '#FFDD00', r: 255, g: 221, b: 0 },
        { hex: '#00FF66', r: 0,   g: 255, b: 102 },
        { hex: '#00CCFF', r: 0,   g: 204, b: 255 },
        { hex: '#AA00FF', r: 170, g: 0,   b: 255 }
    ],
    gold: [
        { hex: '#FFD700', r: 255, g: 215, b: 0 },   // Pure Gold
        { hex: '#FFAA00', r: 255, g: 170, b: 0 },   // Amber Gold
        { hex: '#FFFFFF', r: 255, g: 255, b: 255 }, // Silver White
        { hex: '#FFE57F', r: 255, g: 229, b: 127 }, // Champagne
        { hex: '#FFC000', r: 255, g: 192, b: 0 }    // Deep Gold
    ],
    vibrant: [
        { hex: '#FF007F', r: 255, g: 0,   b: 127 }, // Neon Magenta
        { hex: '#00F0FF', r: 0,   g: 240, b: 255 }, // Cyber Cyan
        { hex: '#39FF14', r: 57,  g: 255, b: 20 },  // Electric Lime
        { hex: '#BF00FF', r: 191, g: 0,   b: 255 }, // Electric Purple
        { hex: '#FF3F00', r: 255, g: 63,  b: 0 }    // Neon Orange
    ],
    cool: [
        { hex: '#00E5FF', r: 0,   g: 229, b: 255 }, // Ice Blue
        { hex: '#2979FF', r: 41,  g: 121, b: 255 }, // Royal Blue
        { hex: '#FFFFFF', r: 255, g: 255, b: 255 }, // Snow White
        { hex: '#80D8FF', r: 128, g: 216, b: 255 }, // Pale Cyan
        { hex: '#0040FF', r: 0,   g: 64,  b: 255 }  // Deep Sapphire
    ]
};

export const DEFAULT_CONFIG = {
    rate: 5,            // Auto launch rate (1-10)
    size: 110,          // Explosion scale %
    particles: 150,     // Particle count per burst
    wind: 0,            // -5 to +5 mph simulation
    horizon: 'skyline', // 'skyline', 'water', 'monument', or 'none'
    autoShow: false,
    soundEnabled: true,
    uiVisible: true
};

export const WIND_SPEEDS = [-4, -2, 0, 0, 2, 4];
