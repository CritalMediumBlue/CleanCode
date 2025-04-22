import * as THREE from 'three';
import { setupScene,initPlotRenderer,renderPlot, updatePlot } from './scene/sceneManager.js';
import {
    createBacteriumSystem,
    updateBacteria,
    getMagentaCount,
    getCyanCount,
    getPositions,
    clearPhenotypeMemo,
    setSignalValue,
    setAlphaValue,
    getAverageSimilarityWithNeighbors,
    updateHistories,
    getHistories,
    clearHistories
} from './simulation/bacteriumSystem.js';
import { CONFIG } from './config.js';
import { handleFileInput } from './dataProcessor.js';
import { ADI } from './utils.js';

// --- Constants ---
/** @const {object} GRID - Defines the dimensions of the simulation grid. */
const GRID = { WIDTH: 100, HEIGHT: 60 };
/** @const {object} SIMULATION - Holds simulation-specific parameters. */
const SIMULATION = { DIFFUSION_RATE: 0.01 };

/** @const {object} CONSTANTS - Holds constants for the simulation. */
export const constants = {
    DIFFUSION_RATE: 100,
    deltaX: 1, // Grid spacing
    deltaT: 0.002,
    GRID: {
        WIDTH: 100,
        HEIGHT: 60
    }
}

// --- State Management ---

/** @type {object} sceneState - Manages Three.js scene components and related states. */
const sceneState = {
    /** @type {THREE.Scene | null} */ scene: null,
    /** @type {THREE.PerspectiveCamera | null} */ camera: null,
    /** @type {THREE.WebGLRenderer | null} */ renderer: null,
    /** @type {THREE.Mesh | null} */ surfaceMesh: null, // The mesh representing the concentration surface
    /** @type {object | null} */ bacteriumSystem: null, // Holds bacteria instances and related methods
    /** @type {boolean} */ visibleBacteria: true, // Toggles visibility of bacteria meshes
};

/** @type {object} animationState - Manages animation loop, timing, and playback state. */
export const animationState = {
    /** @type {number | null} */ animationFrameId: null, // ID for requestAnimationFrame
    /** @type {number} */ currentTimeStep: 1, // Current step in the simulation playback
    /** @type {number} */ numberOfTimeSteps: 0, // Total number of steps in the loaded data
    /** @type {boolean} */ play: false, // Controls whether the animation is running
    /** @type {number} */ AverageLifetime: 0, // Average lifespan of bacteria in steps
    /** @type {number} */ fromStepToMinutes: 0, // Conversion factor from simulation steps to real-time minutes
};

/** @type {object} dataState - Manages simulation data arrays and parameters. */
export const dataState = {
    /** @type {Float32Array | null} */ currentConcentrationData: null, // Concentration values for the current step
    /** @type {Float32Array | null} */ nextConcentrationData: null, // Concentration values for the next step (used in ADI)
    /** @type {Float32Array | null} */ colors: null, // Color data for the surface mesh vertices
    /** @type {Float32Array | null} */ sources: null, // Diffusion sources grid
    /** @type {Float32Array | null} */ sinks: null, // Diffusion sinks grid
    /** @type {Map<number, Array<object>> | null} */ bacteriaData: null, // Stores all bacteria data keyed by time step
    /** @type {Set<number> | null} */ AllUniqueIDs: null, // Set of all unique bacteria IDs across the simulation
    /** @type {number} */ doublingTime: 45, // Assumed doubling time for bacteria in minutes
};

// --- Initialization and Reset Functions ---

/**
 * Resets all simulation data, cleans up resources, and initializes a new simulation environment.
 * Called when new data is loaded.
 */
const resetAllData = () => {
    console.log("Resetting all data and initializing new simulation...");
    cleanupResources();
    initializeParameters();
    setupNewScene();
};

/**
 * Cleans up existing Three.js resources (renderer, scene objects) and cancels
 * the animation frame to prevent memory leaks and prepare for a new simulation setup.
 */
const cleanupResources = () => {
    console.log("Cleaning up resources...");
    // Clean up renderer
    if (sceneState.renderer?.domElement?.parentNode) {
        sceneState.renderer.domElement.parentNode.removeChild(sceneState.renderer.domElement);
        sceneState.renderer.dispose();
    }

    // Cancel animation frame
    if (animationState.animationFrameId) {
        cancelAnimationFrame(animationState.animationFrameId);
        animationState.animationFrameId = null;
    }

    // Dispose bacterium system if it exists
    if (sceneState.bacteriumSystem) {
        sceneState.bacteriumSystem.dispose();
        sceneState.bacteriumSystem = null;
        console.log("Bacterium system disposed.");
    }

    // Clean up surface mesh if it exists
    if (sceneState.surfaceMesh && sceneState.scene) {
        sceneState.scene.remove(sceneState.surfaceMesh);
        sceneState.surfaceMesh.geometry.dispose();
        sceneState.surfaceMesh.material.dispose(); // Ensure material is disposed too
        sceneState.surfaceMesh = null; // Nullify the reference
        console.log("Surface mesh removed and disposed.");
    }
};

/**
 * Initializes simulation parameters (time step, play state) and resets data arrays.
 * Also clears history data and re-initializes the plot renderer.
 */
const initializeParameters = () => {
    console.log("Initializing parameters...");
    // Reset animation state
    animationState.currentTimeStep = 1;
    animationState.numberOfTimeSteps = 0;
    animationState.play = false;
    sceneState.visibleBacteria = true;
    resetArrays();
    // Clear history data and initialize plot
    if (sceneState.bacteriumSystem) {
        clearHistories(sceneState.bacteriumSystem);
    }
    initPlotRenderer(); // Re-initialize the plot for the new simulation
};

/**
 * Resets the core data arrays (concentration, colors, sources, sinks)
 * to their initial state (zero-filled Float32Arrays).
 */
const resetArrays = () => {
    const gridSize = GRID.WIDTH * GRID.HEIGHT;
    console.log(`Resetting arrays for grid size: ${gridSize}`);

    // Initialize data arrays with grid dimensions
    dataState.currentConcentrationData = new Float32Array(gridSize).fill(0);
    dataState.nextConcentrationData = new Float32Array(gridSize).fill(0);
    dataState.colors = new Float32Array(gridSize * 3).fill(0);
    dataState.sources = new Float32Array(gridSize).fill(0);
    dataState.sinks = new Float32Array(gridSize).fill(0);
}

/**
 * Stores the processed bacteria data and related statistics into the dataState
 * and animationState. Calculates the time conversion factor.
 * @param {Map<number, Array<object>>} data - Map where keys are time steps and values are arrays of bacteria objects for that step.
 * @param {object} processedData - Object containing statistics like totalUniqueIDs and averageLifetime.
 * @param {number} processedData.totalUniqueIDs - The total count of unique bacteria IDs found in the data.
 * @param {number} processedData.averageLifetime - The average lifespan of bacteria in simulation steps.
 */
const setBacteriaData = (data, processedData) => {
    console.log("Setting bacteria data...");
    dataState.bacteriaData = data;
    animationState.numberOfTimeSteps = data.size;
    dataState.AllUniqueIDs = processedData.totalUniqueIDs;
    animationState.AverageLifetime = processedData.averageLifetime;
    animationState.fromStepToMinutes = dataState.doublingTime / processedData.averageLifetime;

    console.log('Total time (h)', data.size * animationState.fromStepToMinutes / 60);
    console.log('Every time step is ', Math.floor(animationState.fromStepToMinutes), 'minutes',
        'and', Math.round(animationState.fromStepToMinutes % 1 * 60), 'seconds');
};

/**
 * Sets up a new Three.js scene, camera, and renderer using the `setupScene` utility.
 * Appends the renderer's canvas to the document body and creates the bacterium system.
 */
const setupNewScene = () => {
    console.log("Setting up new scene...");
    const setup = setupScene();
    Object.assign(sceneState, setup);

    document.body.appendChild(sceneState.renderer.domElement);
    sceneState.bacteriumSystem = createBacteriumSystem(sceneState.scene); // Initialize the bacterium visualization system

    // Create the surface mesh geometry after the scene is set up
    const geometry = new THREE.PlaneGeometry(GRID.WIDTH, GRID.HEIGHT, GRID.WIDTH - 1, GRID.HEIGHT - 1);

    // Initialize the color attribute buffer before creating the mesh
    // The size is num_vertices * 3 (r, g, b per vertex)
    const numVertices = geometry.attributes.position.count;
    const initialColors = new Float32Array(numVertices * 3); // Initialize with zeros or default color
    geometry.setAttribute('color', new THREE.BufferAttribute(initialColors, 3)); // Add color attribute

    // Create material with wireframe enabled
    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        wireframe: true // Render as wireframe
    });
    sceneState.surfaceMesh = new THREE.Mesh(geometry, material);
    sceneState.surfaceMesh.rotation.x = Math.PI 
    sceneState.scene.add(sceneState.surfaceMesh);
    console.log("Surface mesh created (wireframe) and added to scene with color attribute.");

    // Initialize data arrays and perform initial mesh update
    resetArrays(); // Ensure data arrays like dataState.colors are ready
    updateSurfaceMesh(); // Initial update to set heights/colors
};


// --- Event Handling ---

/**
 * Safely adds an event listener to a DOM element identified by its ID.
 * Logs a warning if the element is not found.
 * @param {string} id - The ID of the DOM element.
 * @param {string} event - The name of the event to listen for (e.g., 'click', 'input').
 * @param {Function} handler - The function to execute when the event occurs.
 */
const addSafeEventListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`Element with id '${id}' not found`);
    }
};

/**
 * Attaches event listeners to various UI controls (buttons, sliders, dropdowns, file input)
 * to manage simulation playback, parameter adjustments, and data loading.
 */
const addEventListeners = () => {
    console.log("Adding event listeners...");
    // Simple toggle buttons with declarative configuration
    const toggleButtons = [
        { id: 'playButton', event: 'click', handler: () => { animationState.play = true; } },
        { id: 'pauseButton', event: 'click', handler: () => { animationState.play = false; } },
        {
            id: 'singleStepButton', event: 'click', handler: () => {
                animationState.play = false;
                updateScene(); // Perform one update
                // Manually render after single step if not playing
                if (sceneState.renderer && sceneState.scene && sceneState.camera) {
                    sceneState.renderer.render(sceneState.scene, sceneState.camera);
                }
                renderPlot();
            }
        },
        { id: 'visible', event: 'click', handler: () => { sceneState.visibleBacteria = !sceneState.visibleBacteria; } },
        { id: 'visibleMesh', event: 'click', handler: () => { if (sceneState.surfaceMesh) sceneState.surfaceMesh.visible = !sceneState.surfaceMesh.visible; } },

        // Select/dropdown controls
        {
            id: 'toggleColorButton', event: 'change', handler: (event) => {
                const selectedValue = event.target.value;
                CONFIG.BACTERIUM.COLOR_BY_INHERITANCE = (selectedValue === 'phenotype');
                CONFIG.BACTERIUM.COLOR_BY_SIMILARITY = (selectedValue === 'similarity');
            }
        },

        {
            id: 'toggleFeedbackButton', event: 'change', handler: (event) => {
                CONFIG.BACTERIUM.POSITIVE_FEEDBACK = (event.target.value === 'positive');
            }
        },

        // Slider controls
        {
            id: 'signalSlider', event: 'input', handler: (event) => {
                const value = parseFloat(event.target.value);
                const valueElement = document.getElementById('signalValue');
                if (valueElement) valueElement.textContent = value.toFixed(2);
                setSignalValue(sceneState.bacteriumSystem, value);
            }
        },

        {
            id: 'alphaSlider', event: 'input', handler: (event) => {
                const value = parseFloat(event.target.value);
                const valueElement = document.getElementById('alphaValue');
                if (valueElement) valueElement.textContent = value.toFixed(5);
                setAlphaValue(sceneState.bacteriumSystem, value);
            }
        },

        // File input
        {
            id: 'fileInput', event: 'change', handler: (event) => {
                // Pass animate function to start loop after data processing
                handleFileInput(event, resetAllData, animate, setBacteriaData);
            }
        }
    ];

    // Register all event listeners
    toggleButtons.forEach(({ id, event, handler }) => {
        addSafeEventListener(id, event, handler);
    });
};


// --- Simulation Update Logic ---

/**
 * Performs all updates required for a single simulation time step.
 * Fetches current bacteria data, updates bacteria visualization,
 * updates sources/sinks, runs the diffusion simulation (ADI),
 * updates the surface mesh, updates UI overlays, and increments the time step.
 * Handles simulation loop reset.
 */
const updateScene = () => {
    // Ensure bacteria data is loaded and scene is ready
    if (!dataState.bacteriaData || dataState.bacteriaData.size === 0 || !sceneState.surfaceMesh) {
        // console.warn("Attempted to update scene before data/scene is ready.");
        animationState.play = false; // Stop playback if data/scene is missing
        return;
    }

    // 1. Get bacteria data for the current time step
    const currentBacteria = dataState.bacteriaData.get(animationState.currentTimeStep);
    if (!currentBacteria) {
        console.warn(`No bacteria data found for time step ${animationState.currentTimeStep}. Pausing.`);
        animationState.play = false;
        return;
    }

    // 2. Update bacteria visualization (positions, colors, etc.)
    updateBacteriaPositions(currentBacteria);

    // 3. Update diffusion sources and sinks based on bacteria locations/types
    updateSourcesAndSinks(currentBacteria);

    // 4. Update the plot with the latest historical data
    updatePlot(...Object.values(getHistories(sceneState.bacteriumSystem)));

   // [dataState.currentConcentrationData] = diffusion(dataState.currentConcentrationData, "ADI");

     // 5. Run the ADI diffusion simulation step
    [dataState.currentConcentrationData, dataState.nextConcentrationData] = ADI(
        GRID.WIDTH, GRID.HEIGHT,
        dataState.currentConcentrationData, dataState.nextConcentrationData, // Input concentration arrays
        dataState.sources, dataState.sinks, // Input source/sink arrays
        SIMULATION.DIFFUSION_RATE, // Diffusion coefficient
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

    // 6. Update the surface mesh visualization based on the new concentration data
    updateSurfaceMesh();

    // 7. Update UI overlay with current statistics
    updateLoggsOverlay(currentBacteria.length);

    // 8. Increment the time step
    animationState.currentTimeStep++;

    // 9. Check if the simulation reached the end
    if (animationState.currentTimeStep > animationState.numberOfTimeSteps) {
        console.log('Simulation finished.');
        console.log('Total simulated time (hours):', (animationState.numberOfTimeSteps * animationState.fromStepToMinutes / 60).toFixed(2));

        // Reset for potential replay or new data load
        clearPhenotypeMemo(sceneState.bacteriumSystem);
        resetArrays();
        animationState.currentTimeStep = 1;
        animationState.play = false;
        
    }
};

/**
 * Updates the positions, visibility, and potentially other properties (like color based on phenotype/similarity)
 * of the bacteria meshes for the current time step. Also calculates and updates history data for plotting.
 * @param {Array<object>} currentBacteria - Array of bacteria objects for the current time step.
 */
const updateBacteriaPositions = (currentBacteria) => {
    // Update the visual representation of bacteria in the scene
    updateBacteria(
        sceneState.bacteriumSystem,
        animationState.currentTimeStep,
        dataState.bacteriaData,
        sceneState.visibleBacteria,
        dataState.currentConcentrationData
    );

    // Calculate average similarity among neighbors (if applicable for coloring/analysis)
    const averageSimilarity = getAverageSimilarityWithNeighbors(sceneState.bacteriumSystem);
    // Scale similarity for plotting or other uses (adjust scaling factor as needed)
    const scaledSimilarity = (averageSimilarity - 0.5) * 2800; // Example scaling

    // Update historical data arrays for plotting trends over time
    updateHistories(
        sceneState.bacteriumSystem,
        currentBacteria.length,
        getMagentaCount(sceneState.bacteriumSystem),
        getCyanCount(sceneState.bacteriumSystem),
        scaledSimilarity
    );
};

/**
 * Updates the `sources` and `sinks` arrays based on the positions and types (Magenta/Cyan)
 * of bacteria in the current time step. These arrays are used as input for the diffusion simulation.
 * @param {Array<object>} currentBacteria - Array of bacteria objects for the current time step.
 */
const updateSourcesAndSinks = (currentBacteria) => {
    // Get the IDs of currently active Magenta and Cyan bacteria
    const [magentaIDsRaw, cyanIDsRaw] = getPositions(sceneState.bacteriumSystem); // Assumes getPositions returns [magentaIds, cyanIds]
    const MagentaIDs = new Set(magentaIDsRaw);
    const CyanIDs = new Set(cyanIDsRaw);

    // Reset source and sink arrays for the current step
    dataState.sources.fill(0);
    dataState.sinks.fill(0);

    // Iterate through each bacterium in the current time step
    for (const bacterium of currentBacteria) {
        // Convert bacterium's position to grid coordinates and index
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y);

        // Skip if the bacterium is outside the valid grid area
        if (!coords) continue;

        // Increment source count if the bacterium is Magenta
        if (MagentaIDs.has(bacterium.ID)) {
            dataState.sources[coords.idx] += 1; // Simple count for now
        }

        // Increment sink count if the bacterium is Cyan
        if (CyanIDs.has(bacterium.ID)) {
            dataState.sinks[coords.idx] += 1; // Simple count for now
        }
    }
};


// --- Helper Functions ---

/**
 * Converts raw simulation coordinates (which might be centered around 0,0)
 * to grid indices used for accessing data arrays (concentration, sources, sinks).
 * Includes boundary checks and clamping.
 * @param {number} x - Raw x-coordinate from bacterium data.
 * @param {number} y - Raw y-coordinate from bacterium data.
 * @returns {{x: number, y: number, idx: number} | null} Object containing adjusted grid coordinates (x, y)
 *          and the corresponding 1D array index (idx), or null if the coordinates are out of bounds (specifically below y=0).
 */
const getAdjustedCoordinates = (x, y) => {
    // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
    let adjustedX = Math.round(x + GRID.WIDTH / 2);
    let adjustedY = Math.round(y + GRID.HEIGHT / 2);

    // Optimization: Skip bacteria below the grid's bottom edge.
    if (adjustedY <= 0) {
        return null; // Indicate that this bacterium is outside the relevant grid area
    }

    // Clamp coordinates to ensure they are within the valid grid boundaries (leaving a 1-cell border).
    adjustedY = Math.min(adjustedY, GRID.HEIGHT - 2); // Clamp to max height - 2
    adjustedX = Math.max(1, Math.min(adjustedX, GRID.WIDTH - 2)); // Clamp between 1 and max width - 2

    // Calculate the 1D index corresponding to the 2D grid coordinates.
    const idx = adjustedY * GRID.WIDTH + adjustedX;

    return { x: adjustedX, y: adjustedY, idx }; // Return adjusted coordinates and index
};

/**
 * Calculates an RGB color based on a concentration value. Uses a sine wave
 * function with phase shifts to create a cyclical color gradient.
 * Normalizes the concentration before calculating color.
 * @param {number} concentration - The concentration value at a grid point.
 * @returns {{r: number, g: number, b: number}} An object containing RGB color components (0-1 range, approximately).
 */
const calculateColor = (concentration) => {
    // Normalize concentration value
    const normalizedConcentration = concentration / 10; // Adjust divisor to control color cycle frequency

    // Calculate the phase for the sine wave
    const phase = normalizedConcentration * 2 * Math.PI;

    // Calculate RGB components using sine waves with phase shifts, scaled to [0, 1]
    const red = (Math.sin(phase) + 1) / 2;
    const green = (Math.sin(phase - (2 * Math.PI / 3)) + 1) / 2;
    const blue = (Math.sin(phase - (4 * Math.PI / 3)) + 1) / 2;

    // Return RGB values, ensuring they are not NaN
    return {
        r: isNaN(red) ? 0 : red,
        g: isNaN(green) ? 0 : green,
        b: isNaN(blue) ? 0 : blue
    };
};


// --- Rendering and Animation ---

/**
 * Updates the geometry (vertex heights) and color attributes of the surface mesh
 * based on the current concentration data. Requires `sceneState.surfaceMesh` to be initialized.
 */
const updateSurfaceMesh = () => {
    if (!sceneState.surfaceMesh) {
        console.warn("updateSurfaceMesh called before surfaceMesh is initialized.");
        return;
    }
    // Get direct access to the position and color buffer arrays
    const positions = sceneState.surfaceMesh.geometry.attributes.position.array; // x, y, z for each vertex
    const colorsAttribute = sceneState.surfaceMesh.geometry.attributes.color; // r, g, b for each vertex

    // Iterate through each point in the grid
    for (let y = 0; y < GRID.HEIGHT; y++) {
        for (let x = 0; x < GRID.WIDTH; x++) {
            const idx = y * GRID.WIDTH + x; // Calculate 1D index
            const bufferIndex = 3 * idx; // Base index for position and color arrays

            // --- Update Height (Z-position) ---
            let concentration = dataState.currentConcentrationData[idx];
            if (isNaN(concentration)) {
                // console.warn(`NaN concentration at (${x}, ${y}), index ${idx}. Setting to 0.`);
                concentration = 0.0;
                dataState.currentConcentrationData[idx] = 0.0; // Correct in data
            }
            const height = concentration; // Direct mapping
            positions[bufferIndex + 2] = isNaN(height) ? 0 : height*5; // Set Z value

            // --- Update Color ---
            const color = calculateColor(concentration);
            colorsAttribute.array[bufferIndex] = color.r;
            colorsAttribute.array[bufferIndex + 1] = color.g;
            colorsAttribute.array[bufferIndex + 2] = color.b;
        }
    }

    // Mark attributes as needing update for Three.js
    sceneState.surfaceMesh.geometry.attributes.position.needsUpdate = true;
    sceneState.surfaceMesh.geometry.attributes.color.needsUpdate = true;
};

/**
 * Updates the text overlay element with current simulation statistics
 * like time step, simulated time, and bacteria counts.
 * @param {number} bacteriaCount - The number of bacteria in the current time step.
 */
const updateLoggsOverlay = (bacteriaCount) => {
    const overlay = document.getElementById("text-overlay");
    if (!overlay) return; // Exit if overlay element not found

    // Calculate simulated time
    const timeInMinutes = animationState.currentTimeStep * animationState.fromStepToMinutes;
    const totalSeconds = Math.floor(timeInMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format time string
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update overlay text content
    overlay.innerText = `Step: ${animationState.currentTimeStep} / ${animationState.numberOfTimeSteps}
Time: ${timeString}
Bacteria Count: ${bacteriaCount}
Total Unique Bacteria: ${dataState.AllUniqueIDs ? dataState.AllUniqueIDs.size : 'N/A'}`;
};

/**
 * The main animation loop function, called recursively via requestAnimationFrame.
 * Updates the simulation state if `animationState.play` is true, and renders
 * the scene and plot in every frame.
 */
const animate = () => {
    // Schedule the next frame
    animationState.animationFrameId = requestAnimationFrame(animate);

    // Update simulation logic only if in 'play' state
    if (animationState.play) {
        updateScene(); // Advance the simulation by one step
    }

    // Render the 3D scene and the 2D plot regardless of play state
    if (sceneState.renderer && sceneState.scene && sceneState.camera) {
        sceneState.renderer.render(sceneState.scene, sceneState.camera);
    }
    renderPlot(); // Render the plot
};


// --- Initial Setup ---

// Set up initial event listeners when the script loads
addEventListeners();

// Note: The simulation doesn't start automatically.
// It waits for data to be loaded via the file input.
// The `handleFileInput` callback triggers `resetAllData` and then `animate`.
console.log("Initial setup complete. Waiting for data file...");
