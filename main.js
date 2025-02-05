//Main.js - Constants and Setup

//Basic setup Constants
const charWidth = 7;
const charHeight = 15;
const artWidth = Math.ceil(window.innerWidth / charWidth);
const artHeight = Math.ceil(window.innerHeight / charHeight);
const gameSpeed = 0.025;

// Celestial Body sizes
const sunSize = 15;
const sunSizeSq = (sunSize*0.5)**2;

//Initialize noise
const seed = Math.random();
noise.seed(seed);

// Layer Management
const Enums = {
    Layers: {
        Stars: 0,
        Sun: 1,
        Planets: 2,
        Effects: 3      // (comets, asteroids, particles, etc.)
    }
};

//Layer storage
const layers = [
    new Map(),      //Stars
    new Map(),      //Sun
    new Map(),      //Planets
    new Map()       //Effects
]

let time = 0;


