// --- State Objects ---

/** @type {object} sceneState - Manages Three.js scene components and related states. */
export const sceneState = {
    /** @type {THREE.Scene | null} */ scene: null,
    /** @type {THREE.PerspectiveCamera | null} */ camera: null,
    /** @type {THREE.WebGLRenderer | null} */ renderer: null,
    /** @type {THREE.Mesh | null} */ surfaceMesh: null, // The mesh representing the concentration surface
    /** @type {object | null} */ bacteriumRenderer: null, // New renderer component for bacteria
};

/** @type {object} animationState - Manages animation loop, timing, and playback state. */
export const simulationState = {
    bacteriumSystem: null,
};
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


export const cleanupResources = () => {
    console.log("Cleaning up resources...");
 

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
    if (simulationState.bacteriumSystem) {
        simulationState.bacteriumSystem.dispose();
        simulationState.bacteriumSystem = null;
        console.log("Bacterium system disposed.");
    }


    animationState.currentTimeStep = 1;
    animationState.numberOfTimeSteps = 0;
    animationState.play = false;
    sceneState.visibleBacteria = true;
};

// --- State Initialization Functions ---

/**
 * Initializes all data arrays for the simulation.
 * Creates empty Float32Arrays for concentration data, colors, sources, and sinks.
 * @param {Object} grid - Grid dimensions object with WIDTH and HEIGHT properties (optional, uses default GRID if not provided)
 */
export const initializeArrays = (appConfig) => {
    const gridSize = appConfig.GRID.WIDTH * appConfig.GRID.HEIGHT;
    console.log(`Initializing arrays for grid size: ${gridSize}`);

    // Initialize data arrays with grid dimensions
    dataState.currentConcentrationData = new Float32Array(gridSize).fill(0);
    dataState.nextConcentrationData = new Float32Array(gridSize).fill(0);
    dataState.colors = new Float32Array(gridSize * 3).fill(0);
    dataState.sources = new Float32Array(gridSize).fill(0);
    dataState.sinks = new Float32Array(gridSize).fill(0);
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



/**
 * Manages history tracking for bacteria simulation
 * @class
 * @classdesc Tracks and stores historical data for the bacteria simulation
 */
export class HistoryManager {
    constructor() {
        this.totalBacteriaCountHistory = [];
        this.magentaBacteriaCountHistory = [];
        this.cyanBacteriaCountHistory = [];
        this.averageSimilarityHistory = [];
    }

    /**
     * Update history arrays with new data
     * @param {number} totalCount - Total bacteria count
     * @param {number} magentaCount - Magenta bacteria count
     * @param {number} cyanCount - Cyan bacteria count
     * @param {number} averageSimilarity - Average similarity value
     */
    update(totalCount, magentaCount, cyanCount, averageSimilarity) {
        this.totalBacteriaCountHistory.push(totalCount);
        this.magentaBacteriaCountHistory.push(magentaCount);
        this.cyanBacteriaCountHistory.push(cyanCount);
        this.averageSimilarityHistory.push(averageSimilarity);
    }

    /**
     * Get all history arrays
     * @returns {Object} Object containing all history arrays
     */
    getHistories() {
        return {
            totalBacteriaCountHistory: this.totalBacteriaCountHistory,
            magentaBacteriaCountHistory: this.magentaBacteriaCountHistory,
            cyanBacteriaCountHistory: this.cyanBacteriaCountHistory,
            averageSimilarityHistory: this.averageSimilarityHistory
        };
    }

    /**
     * Clear all history arrays
     */
    clear() {
        this.totalBacteriaCountHistory = [];
        this.magentaBacteriaCountHistory = [];
        this.cyanBacteriaCountHistory = [];
        this.averageSimilarityHistory = [];
    }
}
