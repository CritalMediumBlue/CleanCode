// Import and re-export historyManager functions
import * as historyManagerModule from './historyManager.js';

// Re-export the history manager functions
export const updateHistory = historyManagerModule.update;
export const getHistories = historyManagerModule.getHistories;


export const createAnimationState = () => {   
    const animationState = {
        /** @type {number | null} */ animationFrameId: null, // ID for requestAnimationFrame
        /** @type {number} */ currentTimeStep: 1, // Current step in the simulation playback
        /** @type {boolean} */ play: false, // Controls whether the animation is running
    }; 
    return sealObject(animationState);
}

export const createConstants = () => {
    const constants = {
        numberOfTimeSteps: 0, // Total number of time steps in the simulation
        fromStepToMinutes: 0, // Conversion factor from simulation steps to minutes
        doublingTime: 45
    };
    return sealObject(constants);
} 

export const createConcentrationState = () => {
    const concentrationState = {
        concentrationField: null, // Current concentration data
        sources: null, // Sources of diffusion
        sinks: null, // Sinks of diffusion
    }
    return sealObject(concentrationState);
}

const sealObject = (obj) => {
    Object.seal(obj);
    Object.preventExtensions(obj);
    return obj;
}


export const cleanupResources = (animationState) => {
    console.log("Cleaning up resources...");
    if (animationState === null) return;
    if (animationState.animationFrameId) {
        cancelAnimationFrame(animationState.animationFrameId);
        animationState.animationFrameId = null;
    }

    // Clear history data
    historyManagerModule.clear();
    console.log("History manager cleared.");



    animationState.currentTimeStep = 1;
    animationState.play = false;
};

// --- State Initialization Functions ---

/**
 * Initializes all data arrays for the simulation.
 * Creates empty Float32Arrays for concentration data, colors, sources, and sinks.
 * @param {Object} grid - Grid dimensions object with WIDTH and HEIGHT properties (optional, uses default GRID if not provided)
 */
export const initializeArrays = (appConfig,concentrationState) => {
    const gridSize = appConfig.GRID.WIDTH * appConfig.GRID.HEIGHT;
    console.log(`Initializing arrays for grid size: ${gridSize}`);

    // Initialize data arrays with grid dimensions
    concentrationState.concentrationField = new Float32Array(gridSize).fill(0);
    concentrationState.sources = new Float32Array(gridSize).fill(0);
    concentrationState.sinks = new Float32Array(gridSize).fill(0);
};


/**
 * Converts raw simulation coordinates to grid indices.
 * @param {number} x - Raw x-coordinate from bacterium data.
 * @param {number} y - Raw y-coordinate from bacterium data.
 * @param {Object} grid - Grid dimensions object with WIDTH and HEIGHT properties (optional, uses default GRID if not provided)
 * @returns {{x: number, y: number, idx: number} | null} Object containing adjusted grid coordinates and array index.
 */
export const getAdjustedCoordinates = (x, y, grid) => {
    // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
    let adjustedX = Math.round(x + grid.WIDTH / 2);
    let adjustedY = Math.round(y + grid.HEIGHT / 2);

    // Skip bacteria below the grid's bottom edge.
    if (adjustedY <= 0) {
        return null;
    }

    // Clamp coordinates to valid grid boundaries (leaving a 1-cell border).
    adjustedY = Math.min(adjustedY, grid.HEIGHT - 2); 
    adjustedX = Math.max(1, Math.min(adjustedX, grid.WIDTH - 2));

    // Calculate the 1D index corresponding to the 2D grid coordinates.
    const idx = adjustedY * grid.WIDTH + adjustedX;

    return { x: adjustedX, y: adjustedY, idx };
};
