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

// Cache DOM elements to avoid repeated queries
const domCache = new Map();

// Track previous state to avoid unnecessary updates
const previousState = new Map();

//Creates the initial update
function initialUpdate() {
    // Clear existing content
    artContainer.innerHTML = '';
    
    // Recalculate dimensions
    artWidth = Math.ceil(window.innerWidth / charWidth);
    artHeight = Math.ceil(window.innerHeight / charHeight);
    
    // Clear caches when resizing
    domCache.clear();
    previousState.clear();
    
    // Generates empty space - only for visible area
    for (let i = 0; i < artWidth; i++) {
        const colContainer = document.createElement("div");
        colContainer.classList.add("column");
        for (let j = 0; j < artHeight; j++) {
            const charElement = document.createElement("p");
            const key = `x${i}y${j}`;
            charElement.id = key;
            charElement.innerText = " ";
            colContainer.insertAdjacentElement("beforeend", charElement);
            // Cache DOM element reference
            domCache.set(key, charElement);
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
    //DOM update - only update what actually changed
    for (let key of updateLayer.keys()) {
        // Get the update and the character element from cache
        const update = updateLayer.get(key);
        const domChar = domCache.get(key);
        
        if (!domChar) continue; // Skip if element not found

        // Get previous state to compare
        const prev = previousState.get(key);
        
        // Only update character if it changed
        if (!prev || prev.char !== update.char) {
            domChar.innerText = update.char;
        }
        
        // ANIMATION HANDLER - only update classes if they actually changed
        
        // Slow Fade
        const shouldHaveSlowFade = !!update.slowFading;
        const hasSlowFade = domChar.classList.contains("slowFading");
        if (shouldHaveSlowFade !== hasSlowFade) {
            if (shouldHaveSlowFade) {
                domChar.classList.add("slowFading");
            } else {
                domChar.classList.remove("slowFading");
            }
        }
        
        // Sparkling
        const shouldHaveSparkling = !!update.sparkling;
        const hasSparkling = domChar.classList.contains('sparkling');
        if (shouldHaveSparkling !== hasSparkling) {
            if (shouldHaveSparkling) {
                domChar.classList.add("sparkling");
            } else {
                domChar.classList.remove("sparkling");
            }
        }
        
        // Fade Blinking
        const shouldHaveFadeBlinking = !!update.fadeBlinking;
        const hasFadeBlinking = domChar.classList.contains('fadeBlinking');
        if (shouldHaveFadeBlinking !== hasFadeBlinking) {
            if (shouldHaveFadeBlinking) {
                domChar.classList.add("fadeBlinking");
            } else {
                domChar.classList.remove("fadeBlinking");
            }
        }
        
        // Animation delay - only update if changed
        const delayValue = update.animationDelay ? update.animationDelay + "s" : "";
        const currentDelay = domChar.style.animationDelay;
        if (delayValue !== currentDelay) {
            domChar.style.animationDelay = delayValue;
        }
        
        // Store current state for next comparison
        previousState.set(key, {
            char: update.char,
            slowFading: update.slowFading,
            sparkling: update.sparkling,
            fadeBlinking: update.fadeBlinking,
            animationDelay: update.animationDelay
        });
    }
}

function updateAscii(dt) {
    // Update time
    time += gameSpeed * dt;

    // Update starfield - only update stars that actually change
    // Use a slower update rate for noise to reduce CPU usage
    const noiseTime = Math.floor(time * 2) / 2; // Update at 2Hz instead of every frame
    
    for (let [key,star] of layers[Enums.Layers.Stars].entries()) {
        // Get previous state
        const prev = previousState.get(key);
        const prevChar = prev ? prev.char : null;
        
        // Calculate new state
        const noiseValue = noise.simplex3(star.x, star.y, noiseTime);
        const newChar = noiseValue > 0.08 ? '*' : '.';
        
        // Only add to updateLayer if character actually changed
        if (prevChar !== newChar) {
            updateLayer.set(key, {
                x: star.x,
                y: star.y,
                char: newChar,
                slowFading: true,
                animationDelay: star.animationDelay
            });
        }
    }
}

// ANIMATION LOOP
let time = 0;
let last = performance.now() / 1000;
let lastUpdateTime = 0;
const targetFPS = 30; // Limit to 30 FPS to reduce CPU usage
const frameInterval = 1 / targetFPS;

function update(timestamp) {
    // Calculate delta time
    const now = performance.now() / 1000;
    const dt = now - last;
    last = now;

    // Throttle updates to target FPS
    if (now - lastUpdateTime < frameInterval) {
        requestAnimationFrame(update);
        return;
    }
    lastUpdateTime = now;

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