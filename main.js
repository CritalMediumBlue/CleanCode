/**
 * @fileoverview Main entry point for the bacteria simulation visualization.
 * Manages the core simulation loop, scene updates, and integrates components.
 */

import {
     setupNewScene, 
     renderScene,
    } from './scene/sceneManager.js';
import {
    createBacteriumSystem,
    diffuse,
} from './simulation/simulationManager.js';
import { addEventListeners } from './GUI/guiManager.js';
import { 
    sceneState, 
    simulationState,
    animationState, 
    dataState, 
    initializeArrays,
    getAdjustedCoordinates,
    HistoryManager,
    cleanupResources, 
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
        simulationState.bacteriumSystem.setSignalValue(value);
    },
    setAlphaValue: (value) => {
        simulationState.bacteriumSystem.setAlphaValue(value);
    }
};


/**
 * Resets all simulation data, cleans up resources, and initializes a new simulation environment.
 * Called when new data is loaded.
 */
const resetAllData = () => {
    console.log("Resetting all data and initializing new simulation...");
    cleanupResources();

    setupNewScene(appConfig);
    simulationState.bacteriumSystem = createBacteriumSystem( appConfig)

    sceneState.historyManager = new HistoryManager();
    
    initializeArrays(appConfig);    
};



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




const updateSimulation = (currentBacteria) => {
  
  
    updateBacteriaPositions(currentBacteria);

    updateSourcesAndSinks(currentBacteria);

  
    [dataState.currentConcentrationData, dataState.nextConcentrationData] = diffuse(
        appConfig,
        dataState,
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

    
    animationState.currentTimeStep++;

    // 9. Check if the simulation reached the end
    if (animationState.currentTimeStep > animationState.numberOfTimeSteps) {
        console.log('Simulation finished.');
        animationState.currentTimeStep = 1;
        animationState.play = false;
    }
};




/**
 * Updates the positions, visibility, and properties of bacteria for the current time step.
 * This function handles both the simulation logic via updateBacteria and the visualization
 * 
 * @param {Array<object>} currentBacteria - Array of bacteria objects for the current time step
 */
const updateBacteriaPositions = (currentBacteria) => {
  
    
   

    // Get metric values from bacterium system
    const magentaCount = simulationState.bacteriumSystem.getMagentaCount();
    const cyanCount = simulationState.bacteriumSystem.getCyanCount();
    const averageSimilarity = simulationState.bacteriumSystem.getAverageSimilarityWithNeighbors()
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
    const [magentaIDsRaw, cyanIDsRaw] = simulationState.bacteriumSystem.getPositions();
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
let bacteriaData = null;

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
    // Update simulation logic only if in 'play' state
    if (animationState.play) {
          // 1. Get bacteria data for the current time step
        const currentBacteria = dataState.bacteriaData.get(animationState.currentTimeStep);

        updateSimulation(currentBacteria); // Advance the simulation by one step
        bacteriaData = simulationState.bacteriumSystem.updateBacteria(
            animationState.currentTimeStep,
            dataState.bacteriaData,
            dataState.currentConcentrationData
        );
    }
    const histories = Object.values(sceneState.historyManager.getHistories());

    renderScene(histories,bacteriaData, dataState, appConfig.BACTERIUM, animationState);
};


// --- Initial Setup ---

// Set up initial event listeners when the script loads
// Pass required functions as parameters for proper GUI-Simulation integration
// Get configuration object via dependency injection
appConfig = addEventListeners(
    animate, 
    resetAllData, 
    setBacteriaData,
    stateActions,  // Pass state actions for GUI to use
    simulationActions  // Pass simulation actions for GUI to use
);


console.log("Initial setup complete. Waiting for data file...");
