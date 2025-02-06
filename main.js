//Main.js - Constants and Setup

// Get wrapper and main container
const wrapper = document.getElementById("wrapper");
const artContainer = document.getElementById("artContainer");

//Basic setup Constants
const charWidth = 7;
const charHeight = 15;
const artWidth = Math.ceil(window.innerWidth / charWidth);
const artHeight = Math.ceil(window.innerHeight / charHeight);
const gameSpeed = 0.025;

// Celestial Body sizes
const sunSize = 19;
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
    const updateLayer = new Map();
    
    // Generates empty space
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
    
    // Star Field Generator
    for (let i = 0; i < artWidth; i++) {
        for (let j = 0; j < artHeight; j++) {
            if (noise.simplex2(i, j) > 0.85) {
                const newStar = {
                    x: i,
                    y: j,
                    char: ".",
                    slowFading: true,
                    animationDelay: Math.random() * 20
                };
                const key = `x${i}y${j}`;
                layers[Enums.Layers.Stars].set(key, newStar);
                updateLayer.set(key, newStar);
            }
        }
    }
}

function getLowerCharacter(x,y, layerIndex) {
    for (let i = layerIndex-1; i >= 0; i--) {
        const key = `x${x}y${y}`;
        if (layers[i].has(key)) {
            return layers[i].get(key).char;
        }
    }
    return " ";
}

function hasHigherChar(x,y, layerIndex) {
    for (let i = layerIndex+1; i < layers.length; i++) {
        const key = `x${x}y${y}`;
        if (layers[i].has(key)) {
            return true;
        }
    }

    return false;
}



// Render changes
function renderAscii() {
    const updatedLayers = [
        Enums.Layers.Stars,
        Enums.Layers.Sun,
        Enums.Layers.Planets,
        Enums.Layers.Orbits,
        Enums.Layers.Effects
    ];

    // Flatten layers
    for (let i = 0; i < updatedLayers.length; i++) {
        for (let key of layers[updatedLayers[i]].keys()) {
            const e = layers[updatedLayers[i]].get(key);
            if (!hasHigherChar(e.x, e.y, updatedLayers[i])) {
                if (e.char == "remove") {
                    updateLayer.set(key, {
                        x: e.x,
                        y: e.y,
                        char: getLowerCharacter(e.x, e.y, updatedLayers[i])
                    });
                    layers[updatedLayers[i]].delete(key);
                } else {
                    updateLayer.set(key, e);
                }
            }
        }
    }

    // DOM update
    for (let key of updateLayer.keys()) {
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

    // Clear old sun positions
    layers[Enums.Layers.Sun].clear();

    // Set the center of the sun
    const sunCenterx = Math.floor(artWidth / 2);
    const sunCentery = Math.floor(artHeight / 2);

    // Create the sun over a specified grid
    for (let i = 0; i < sunSize; i++) {
        for (let j = 0; j < sunSize*0.5; j++) {
            const distance = (i - sunSize*0.5) ** 2 + (j*2 + 0.5 - sunSize*0.5) ** 2;

            let curChar = "?";
            if (i == 1 || i == sunSize-1) {
                (Math.abs(j - sunSize*0.25) > 1)
                    ? curChar = "|"
                    : curChar = "H";
            } else if (j == 0 || j == sunSize*0.5-0.5)
                (Math.abs(i - sunSize*0.5) > 1)
                    ? curChar = "-"
                    : curChar = "=";
            else {
                const isTopHalf = j < sunSize*0.25;
                ((isTopHalf && i < sunSize*0.5) || (!isTopHalf && i > sunSize*0.5))
                ? curChar = "/"
                : curChar = "\\";
            }

            const x = Math.ceil(sunCenterx + i-sunSize*0.5);
            const y = Math.ceil(sunCentery + j-sunSize*0.25);
            if (x >= 0 && x < artWidth && y >= 0 && y < artHeight && distance <= sunSizeSq) {
                if (distance <= sunSizeSq - sunSize)
                    curChar = " ";

                layers[Enums.Layers.Sun].set(`x${x}y${y}`, {
                    x: x,
                    y: y,
                    char: curChar,
                    glow: true
                });
            }
        }
    }

    // Ensure the sun is rendered consistently
    for (let [key, sunPixel] of layers[Enums.Layers.Sun].entries()) {
        updateLayer.set(key, sunPixel);
    }

    // Animate stars
    for (let [key,star] of layers[Enums.Layers.Stars].entries()) {
        if (noise.simplex3(star.x, star.y, time) > 0.08) {
            layers[Enums.Layers.Stars].set(key, {
                x: star.x,
                y: star.y,
                char: '*',
                slowFading: true,
                animationDelay: star.animationDelay
            })
            updateLayer.set(key, {
                x: star.x,
                y: star.y,
                char: '*',
                slowFading: true,
                animationDelay: star.animationDelay
            });
        } else {
            layers[Enums.Layers.Stars].set(key, {
                x: star.x,
                y: star.y,
                char: ".",
                slowFading: true,
                animationDelay: star.animationDelay 
            })
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
let time = Math.random()*(artWidth+sunSize*2);
let last = performance.now() / 1000;

function update(timestamp) {
    
     // Request next frame
     requestAnimationFrame(update);

    // Calculate delta time
    const now = performance.now() /1000;
    const dt = now - last;
    last = now;



    // Updates and renders the ASCII
    updateAscii(dt);
    renderAscii();
}

// Modify the window load handler to use only requestAnimationFrame
 //   window.addEventListener('DOMContentLoaded', function() {
   //     // Get wrapper and main container - these are already defined above, so we can remove these lines
     //   if (!wrapper || !artContainer) {
     //       console.error('Required DOM elements not found');
       //     return;
    //    }
        
    //    initialUpdate();
    //    requestAnimationFrame(update);
 //   });

 window.onload = () => {
    initialUpdate();
    window.requestAnimationFrame(update);
 }