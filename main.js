import { initPlotRenderer, renderPlot,
     updatePlot, setupNewScene, 
     updateOverlay, updateSurfaceMesh 
    } from './scene/sceneManager.js';
import {
    createBacteriumSystem,
    updateBacteria,
    getMagentaCount,
    getCyanCount,
    getPositions,
    clearPhenotypeMemo,
    getAverageSimilarityWithNeighbors,
    updateHistories,
    getHistories,
    clearHistories,
    diffuse
} from './simulation/simulationManager.js';
// Remove direct import of setBacteriaData from dataProcessor.js
import { addEventListeners } from './GUI/guiManager.js';
import { 
    sceneState, 
    animationState, 
    dataState, 
    GRID, 
    SIMULATION,
    initializeArrays,
    resetAnimationState,
    getAdjustedCoordinates,
    calculateColor
} from './state/stateManager.js';

// Store the configuration object to be injected from guiManager
let appConfig;

// --- Initialization and Reset Functions ---

/**
 * Resets all simulation data, cleans up resources, and initializes a new simulation environment.
 * Called when new data is loaded.
 */
const resetAllData = () => {
    console.log("Resetting all data and initializing new simulation...");
    cleanupResources();
    
    // Reset state via stateManager
    resetAnimationState();
    
    // Create a function that will create a bacterium system with injected config
    const createConfiguredBacteriumSystem = () => createBacteriumSystem(appConfig);
    
    // Set up new scene and create the bacterium system and renderer, passing injected config
    const newSceneState = setupNewScene(createConfiguredBacteriumSystem, appConfig);
    Object.assign(sceneState, newSceneState);
    
    // Initialize arrays via stateManager
    initializeArrays();
    
    // Initialize plot renderer with injected config
    initPlotRenderer(appConfig);
    
    updateSurfaceMesh(sceneState.surfaceMesh, dataState.currentConcentrationData, calculateColor); // Initial update to set heights/colors
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

    // Dispose bacterium renderer if it exists
    if (sceneState.bacteriumRenderer) {
        sceneState.bacteriumRenderer.dispose();
        sceneState.bacteriumRenderer = null;
        console.log("Bacterium renderer disposed.");
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
    
    // Pass injected config to plotRenderer initialization
    initPlotRenderer(appConfig); // Re-initialize the plot for the new simulation
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
 * Callback function that sets bacteria data in the appropriate state objects.
 * This is called by guiManager.js after data processing.
 * @param {Map<number, Array<object>>} data - Map where keys are time steps and values are arrays of bacteria objects for that step.
 * @param {object} processedData - Object containing statistics like totalUniqueIDs and averageLifetime.
 */
const setBacteriaData = (data, processedData) => {
    console.log("Setting bacteria data from main.js...");
    dataState.bacteriaData = data;
    animationState.numberOfTimeSteps = data.size;
    dataState.AllUniqueIDs = processedData.totalUniqueIDs;
    animationState.AverageLifetime = processedData.averageLifetime;
    animationState.fromStepToMinutes = dataState.doublingTime / processedData.averageLifetime;

    console.log('Total time (h)', data.size * animationState.fromStepToMinutes / 60);
    console.log('Every time step is ', Math.floor(animationState.fromStepToMinutes), 'minutes',
        'and', Math.round(animationState.fromStepToMinutes % 1 * 60), 'seconds');
};

// --- Event Handling ---

// The addSafeEventListener and addEventListeners functions have been 
// moved to GUI/guiManager.js

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
        // console.warn("Attempted to update scene before data/scene is missing.");
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



    [dataState.currentConcentrationData, dataState.nextConcentrationData] = diffuse(
        GRID.WIDTH, GRID.HEIGHT,
        dataState.currentConcentrationData, dataState.nextConcentrationData, // Input concentration arrays
        dataState.sources, dataState.sinks, // Input source/sink arrays
        SIMULATION.DIFFUSION_RATE, // Diffusion coefficient
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

    // 6. Update the surface mesh visualization based on the new concentration data
    updateSurfaceMesh(sceneState.surfaceMesh, dataState.currentConcentrationData, calculateColor);

    // 7. Update UI overlay with current statistics
    updateOverlay(
        currentBacteria.length, 
        animationState.currentTimeStep, 
        animationState.numberOfTimeSteps, 
        animationState.fromStepToMinutes, 
        dataState.AllUniqueIDs
    );

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
    // Simulate bacteria - returns array of BacteriumData objects for rendering
    const bacteriaData = updateBacteria(
        sceneState.bacteriumSystem,
        animationState.currentTimeStep,
        dataState.bacteriaData,
        sceneState.visibleBacteria,
        dataState.currentConcentrationData
    );
    
    // Render bacteria using the dedicated renderer
    if (sceneState.bacteriumRenderer) {
        sceneState.bacteriumRenderer.renderBacteria(bacteriaData);
    }

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






// --- Rendering and Animation ---

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
// Pass required functions as parameters for proper GUI-Simulation integration
// Get configuration object via dependency injection
appConfig = addEventListeners(
    updateScene, 
    animate, 
    resetAllData, 
    setBacteriaData,
    renderPlot  // Inject renderPlot function from sceneManager
);

// Note: The simulation doesn't start automatically.
// It waits for data to be loaded via the file input.
// The `handleFileInput` callback triggers `resetAllData` and then `animate`.
console.log("Initial setup complete. Waiting for data file...");
