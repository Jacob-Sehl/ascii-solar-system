//Main.js - Constants and Setup

// Get wrapper and main container
const wrapper = document.getElementById("wrapper");
const artContainer = document.getElementById("artContainer");

//Basic setup Constants
const charWidth = 5;
const charHeight = 8;
let artWidth = Math.ceil(window.innerWidth / charWidth);
let artHeight = Math.ceil(window.innerHeight / charHeight);
const gameSpeed = 0.025;

// Celestial Body sizes
const sunSize = 15;
const sunSizeSq = (sunSize*0.5)**2;

//Initialize noise
const seed = Math.random();
noise.seed(seed);

// Define Enums at the top of the file
const Enums = {
    Layers: {
        Stars: 0,
        Sun: 1,
        Planets: 2,
        Orbits: 3,
        Effects: 4      // (comets, asteroids, particles, etc.)
    }
};

//Layer storage
const layers = [
    new Map(),      //Stars
    new Map(),      //Sun
    new Map(),      //Planets
    new Map(),      //Orbits
    new Map()       //Effects
]

// Add update layer for tracking changes
const updateLayer = new Map();

//Creates the initial update
function initialUpdate() {
    // Clear existing content
    artContainer.innerHTML = '';
    
    // Recalculate dimensions
    artWidth = Math.ceil(window.innerWidth / charWidth);
    artHeight = Math.ceil(window.innerHeight / charHeight);
    
    // Generates empty space - only for visible area
    for (let i = 0; i < artWidth; i++) {
        const colContainer = document.createElement("div");
        colContainer.classList.add("column");
        for (let j = 0; j < artHeight; j++) {
            const charElement = document.createElement("p");
            charElement.id = `x${i}y${j}`;
            charElement.innerText = " ";
            colContainer.insertAdjacentElement("beforeend", charElement);
        }
        artContainer.insertAdjacentElement("beforeend", colContainer);
    }

    // Clear existing layers
    layers.forEach(layer => layer.clear());
    
    //Star Field Generator - only for visible area
    for (let i = 0; i < artWidth; i++) {
        for (let j = 0; j < artHeight; j++) {
            if (noise.simplex2(i,j) > 0.85) {
                const newStar = {
                    x: i,
                    y: j,
                    char: ".",
                    slowFading: true,
                    animationDelay: Math.random()*20
                };
                const key = `x${i}y${j}`;
                layers[Enums.Layers.Stars].set(key, newStar);
                updateLayer.set(key,newStar);
            }
        }
    }
}

// Render changes
function renderAscii() {
    //DOM update
    for (let key of updateLayer.keys()) {
        // Get the update and the character element
        const update = updateLayer.get(key);
        const domChar = document.getElementById(key);

        // Update character
        domChar.innerText = update.char;
        
        // ANIMATION HANDLER

        // Slow Fade
        if (update.slowFading && !domChar.classList.contains("slowFading")) {
            domChar.classList.add("slowFading");
        } else if (!update.slowFading && domChar.classList.contains("slowFading")) {
            domChar.classList.remove("slowFading");
        }
        // Sparkling
        if (update.sparkling && !domChar.classList.contains('sparkling')) {
            domChar.classList.add("sparkling");
        } else if (!update.sparkling && domChar.classList.contains("sparkling")) {
            domChar.classList.remove("sparkling");
        }
        // Fade Blinking
        if (update.fadeBlinking && !domChar.classList.contains('fadeBlinking')) {
            domChar.classList.add("fadeBlinking");
        } else if (!update.fadeBlinking && domChar.classList.contains("fadeBlinking")) {
            domChar.classList.remove("fadeBlinking");
        }
        // Animation delay
        if (update.animationDelay && domChar.style.animationDelay == "") {
            domChar.style.animationDelay = update.animationDelay+"s";
        } else if (!update.animationDelay && domChar.style.animationDelay != "") {
            domChar.style.animationDelay = "";
        }
    }
}

function updateAscii(dt) {
    // Update time
    time += gameSpeed * dt;

    // Update starfield
    for (let [key,star] of layers[Enums.Layers.Stars].entries()) {
        if (noise.simplex3(star.x, star.y, time) > 0.08) {
            updateLayer.set(key, {
                x: star.x,
                y: star.y,
                char: '*',
                slowFading: true,
                animationDelay: star.animationDelay
            });
        } else {
            updateLayer.set(key, {
                x: star.x,
                y: star.y,
                char: ".",
                slowFading: true,
                animationDelay: star.animationDelay
            });
        }
    }
}

// ANIMATION LOOP
let time = 0;
let last = performance.now() / 1000;

function update(timestamp) {
    // Calculate delta time
    const now = performance.now() /1000;
    const dt = now - last;
    last = now;

    // Clears the layer for a new one
    updateLayer.clear();

    // Updates and renders the ASCII
    updateAscii(dt);
    renderAscii();

    // Request next frame
    requestAnimationFrame(update);
}

// Modify the window load handler to use only requestAnimationFrame
window.addEventListener('DOMContentLoaded', function() {
    // Get wrapper and main container - these are already defined above, so we can remove these lines
    if (!wrapper || !artContainer) {
        console.error('Required DOM elements not found');
        return;
    }
    
    initialUpdate();
    requestAnimationFrame(update);
});

// Add window resize handler
window.addEventListener('resize', function() {
    // Debounce the resize event
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(function() {
        initialUpdate();
    }, 250);
});