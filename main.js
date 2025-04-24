/**
 * @fileoverview Main entry point for the bacteria simulation visualization.
 * Manages the core simulation loop, scene updates, and integrates components.
 */

import { initPlotRenderer,
     updatePlot, setupNewScene, 
     updateOverlay, updateSurfaceMesh,
     renderScene
    } from './scene/sceneManager.js';
import {
    createBacteriumSystem,
    diffuse,
} from './simulation/simulationManager.js';
// Remove direct import of setBacteriaData from dataProcessor.js
import { addEventListeners } from './GUI/guiManager.js';
import { 
    sceneState, 
    animationState, 
    dataState, 
    initializeArrays,
    resetAnimationState,
    getAdjustedCoordinates,
    calculateColor,
    HistoryManager,
} from './state/stateManager.js';

/**
 * Configuration object injected from guiManager
 * @type {Object}
 */
let appConfig;

// --- State Action Interfaces ---

/**
 * @typedef {Object} StateActions
 * @property {function(boolean): void} setPlayState - Sets the animation playback state
 * @property {function(): void} toggleBacteriaVisibility - Toggles bacteria visibility
 * @property {function(): void} toggleMeshVisibility - Toggles surface mesh visibility
 * @property {function(): void} renderScene - Renders the scene manually
 */

/**
 * Interface for state-related actions to be used by guiManager.
 * This decouples guiManager.js from direct dependence on stateManager.js
 * @type {StateActions}
 */
const stateActions = {
    setPlayState: (isPlaying) => {
        animationState.play = isPlaying;
    },
    toggleBacteriaVisibility: () => {
        sceneState.visibleBacteria = !sceneState.visibleBacteria;
    },
    toggleMeshVisibility: () => {
        if (sceneState.surfaceMesh) {
            sceneState.surfaceMesh.visible = !sceneState.surfaceMesh.visible;
        }
    },
    renderScene: () => {
        renderScene(sceneState);
    }
};

/**
 * @typedef {Object} SimulationActions
 * @property {function(number): void} setSignalValue - Updates the signal value in the simulation
 * @property {function(number): void} setAlphaValue - Updates the alpha/temperature value in the simulation
 */

/**
 * Interface for simulation-related actions to be used by guiManager.
 * This decouples guiManager.js from direct dependence on simulationManager.js
 * @type {SimulationActions}
 */
const simulationActions = {
    setSignalValue: (value) => {
        sceneState.bacteriumSystem.setSignalValue(value);
    },
    setAlphaValue: (value) => {
        sceneState.bacteriumSystem.setAlphaValue(value);
    }
};

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
    
    // Create a function that creates a bacterium system with injected config only
    const createConfiguredBacteriumSystem = () => createBacteriumSystem(appConfig);
    
    // Set up new scene and create the bacterium system and renderer, passing injected config
    // Now passing GRID object from appConfig instead of stateManager
    const newSceneState = setupNewScene(createConfiguredBacteriumSystem, appConfig, appConfig.GRID);
    Object.assign(sceneState, newSceneState);
    
    // Initialize history manager
    sceneState.historyManager = new HistoryManager();
    
    // Initialize arrays via stateManager, now passing GRID from appConfig
    initializeArrays(appConfig.GRID);
    
    // Initialize plot renderer with injected config
    initPlotRenderer(appConfig);
    
    // Now pass the GRID object from appConfig to updateSurfaceMesh
    updateSurfaceMesh(sceneState.surfaceMesh, dataState.currentConcentrationData, calculateColor, appConfig.GRID); // Initial update to set heights/colors
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

    // Clear historyManager if it exists
    if (sceneState.historyManager) {
        sceneState.historyManager.clear();
        console.log("History manager cleared.");
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
 * Resets the core data arrays (concentration, colors, sources, sinks)
 * to their initial state (zero-filled Float32Arrays).
 */
const resetArrays = () => {
    const gridSize = appConfig.GRID.WIDTH * appConfig.GRID.HEIGHT;
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


// --- Simulation Update Logic ---

/**
 * Performs all updates required for a single simulation time step.
 * Fetches current bacteria data, updates bacteria visualization,
 * updates sources/sinks, runs the diffusion simulation (ADI),
 * updates the surface mesh, updates UI overlays, and increments the time step.
 * Handles simulation loop reset.
 */
const updateScene = () => {
  
    // 1. Get bacteria data for the current time step
    const currentBacteria = dataState.bacteriaData.get(animationState.currentTimeStep);

    // 2. Update bacteria visualization (positions, colors, etc.)
    updateBacteriaPositions(currentBacteria);

    // 3. Update diffusion sources and sinks based on bacteria locations/types
    updateSourcesAndSinks(currentBacteria);

    // 4. Update the plot with the latest historical data from our local history manager
    updatePlot(...Object.values(sceneState.historyManager.getHistories()));

    // 5. Run the diffusion simulation step (ADI method)
    /**
     * Perform diffusion calculation using Alternating Direction Implicit (ADI) method
     * Returns updated concentration arrays after applying diffusion to current state
     * @see simulation/diffusion.js for implementation details
     */
    [dataState.currentConcentrationData, dataState.nextConcentrationData] = diffuse(
        appConfig.GRID.WIDTH, appConfig.GRID.HEIGHT,
        dataState.currentConcentrationData, dataState.nextConcentrationData, // Input concentration arrays
        dataState.sources, dataState.sinks, // Input source/sink arrays
        appConfig.GRID.DIFFUSION_RATE, // Diffusion coefficient
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

    // 6. Update the surface mesh visualization based on the new concentration data
    // Now passing GRID object from appConfig to updateSurfaceMesh
    updateSurfaceMesh(sceneState.surfaceMesh, dataState.currentConcentrationData, calculateColor, appConfig.GRID);

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
        sceneState.bacteriumSystem.clearPhenotypeMemo();
        resetArrays();
        animationState.currentTimeStep = 1;
        animationState.play = false;
        
    }
};

/**
 * Updates the positions, visibility, and properties of bacteria for the current time step.
 * This function handles both the simulation logic via updateBacteria and the visualization
 * via bacteriumRenderer. It also calculates similarity metrics for plotting.
 * 
 * @param {Array<object>} currentBacteria - Array of bacteria objects for the current time step
 */
const updateBacteriaPositions = (currentBacteria) => {
  
    
   

    // Get metric values from bacterium system
    const magentaCount = sceneState.bacteriumSystem.getMagentaCount();
    const cyanCount = sceneState.bacteriumSystem.getCyanCount();
    const averageSimilarity = sceneState.bacteriumSystem.getAverageSimilarityWithNeighbors()
    const scaledSimilarity = (averageSimilarity - 0.5) * 2800;
    
    // Update our local history manager
    sceneState.historyManager.update(
        currentBacteria.length,
        magentaCount,
        cyanCount,
        scaledSimilarity
    );
};

/**
 * Updates the diffusion sources and sinks based on bacteria positions and phenotypes.
 * Magenta bacteria act as signal sources while Cyan bacteria act as signal sinks.
 * The resulting arrays are used in the ADI diffusion simulation.
 * 
 * @param {Array<object>} currentBacteria - Array of bacteria objects for the current time step
 */
const updateSourcesAndSinks = (currentBacteria) => {
    // Get the IDs of currently active Magenta and Cyan bacteria
    const [magentaIDsRaw, cyanIDsRaw] = sceneState.bacteriumSystem.getPositions();
    const MagentaIDs = new Set(magentaIDsRaw);
    const CyanIDs = new Set(cyanIDsRaw);

    // Reset source and sink arrays for the current step
    dataState.sources.fill(0);
    dataState.sinks.fill(0);

    // Iterate through each bacterium in the current time step
    for (const bacterium of currentBacteria) {
        // Convert bacterium's position to grid coordinates and index using appConfig.GRID
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, appConfig.GRID);

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

// --- Rendering and Animation ---

/**
 * The main animation loop function that drives the simulation.
 * Called recursively via requestAnimationFrame to maintain smooth animation.
 * Updates the simulation state when in play mode and renders both the 3D scene
 * and 2D plot visualization in every frame.
 */
const animate = () => {
    // Schedule the next frame
    animationState.animationFrameId = requestAnimationFrame(animate);
    let bacteriaData = null; // Initialize bacteriaData to null
    // Update simulation logic only if in 'play' state
    if (animationState.play) {
        updateScene(); // Advance the simulation by one step
         // Simulate bacteria - returns array of BacteriumData objects for rendering
        bacteriaData = sceneState.bacteriumSystem.updateBacteria(
            animationState.currentTimeStep,
            dataState.bacteriaData,
            sceneState.visibleBacteria,
            dataState.currentConcentrationData
        );
    }
     

    renderScene(sceneState,bacteriaData); // Render the 3D scene
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
    stateActions,  // Pass state actions for GUI to use
    simulationActions  // Pass simulation actions for GUI to use
);

// Note: The simulation doesn't start automatically.
// It waits for data to be loaded via the file input.
// The `handleFileInput` callback triggers `resetAllData` and then `animate`.
console.log("Initial setup complete. Waiting for data file...");
