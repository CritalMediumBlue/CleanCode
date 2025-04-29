/**
 * @fileoverview Main entry point for the bacteria simulation visualization.
 * Manages the core simulation loop, scene updates, and integrates components.
 */

import {setupNewScene, renderScene} from './scene/graphicsManager.js';
import {createBacteriumSystem,diffuse,setValue,
    getGlobalParams,getPositions} from './simulation/simulationManager.js';
import { addEventListeners } from './GUI/guiManager.js';
import { 
    animationState, 
    dataState, 
    initializeArrays,
    getAdjustedCoordinates,
    cleanupResources,
    updateHistory,
    getHistories
} from './state/stateManager.js';

/**
 * Configuration object injected from guiManager
 * @type {Object}
 */
let appConfig;

let bacteriumSystem = null; 


const guiActions = {
    setValue: (value,param) => {setValue(value,param);},
    setPlayState: (isPlaying) => {animationState.play = isPlaying;}
};


/**
 * Resets all simulation data, cleans up resources, and initializes a new simulation environment.
 * Called when new data is loaded.
 */
const resetAllData = () => {
    console.log("Resetting all data and initializing new simulation...");
    cleanupResources();

    setupNewScene(appConfig);
    bacteriumSystem = createBacteriumSystem(appConfig);
    
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
  
    const globalParams = getGlobalParams();

    const positions = getPositions();


    const bacData= bacteriumSystem.updateBacteria(
        animationState.currentTimeStep,
        dataState.bacteriaData,
        dataState.currentConcentrationData
    );


    updateHistory(currentBacteria.length,...globalParams);

    updateSourcesAndSinks(currentBacteria,...positions);

  
    [dataState.currentConcentrationData, dataState.nextConcentrationData] = diffuse(
        appConfig,
        dataState,
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

    
    animationState.currentTimeStep++;
    return bacData;

};


/**
 * Updates the diffusion sources and sinks based on bacteria positions and phenotypes.
 * Magenta bacteria act as signal sources while Cyan bacteria act as signal sinks.
 * The resulting arrays are used in the ADI diffusion simulation.
 * 
 * @param {Array<object>} currentBacteria - Array of bacteria objects for the current time step
 */
const updateSourcesAndSinks = (currentBacteria,magentaIDsRaw,cyanIDsRaw) => {
    // Get the IDs of currently active Magenta and Cyan bacteria
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
        if (!coords) console.warn(`Bacterium ${bacterium.ID} is out of bounds `)

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

        bacteriaData = updateSimulation(currentBacteria); // Advance the simulation by one step
        
     
    }
    const histories = getHistories();
    const concentration = dataState.currentConcentrationData;

    renderScene(histories,bacteriaData, concentration, appConfig.BACTERIUM, animationState);

    if (animationState.currentTimeStep > animationState.numberOfTimeSteps) {
        console.log('Simulation finished.');
        animationState.currentTimeStep = 1;
        animationState.play = false;
    }
};


// --- Initial Setup ---

// Set up initial event listeners when the script loads
// Pass required functions as parameters for proper GUI-Simulation integration
// Get configuration object via dependency injection
appConfig = addEventListeners(
    animate, 
    resetAllData, 
    setBacteriaData,
    guiActions  // Pass simulation actions for GUI to use
);


console.log("Initial setup complete. Waiting for data file...");
