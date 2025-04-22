
// --- Constants ---
/** @const {object} GRID - Defines the dimensions of the simulation grid. */
export const GRID = { WIDTH: 100, HEIGHT: 60 };
/** @const {object} SIMULATION - Holds simulation-specific parameters. */
export const SIMULATION = { DIFFUSION_RATE: 0.01 };

/** @const {object} CONSTANTS - Holds constants for the simulation. */
export const constants = {
    DIFFUSION_RATE: 100,
    deltaX: 1, // Grid spacing
    deltaT: 0.002,
    GRID: {
        WIDTH: 100,
        HEIGHT: 60
    }
};

// --- State Objects ---

/** @type {object} sceneState - Manages Three.js scene components and related states. */
export const sceneState = {
    /** @type {THREE.Scene | null} */ scene: null,
    /** @type {THREE.PerspectiveCamera | null} */ camera: null,
    /** @type {THREE.WebGLRenderer | null} */ renderer: null,
    /** @type {THREE.Mesh | null} */ surfaceMesh: null, // The mesh representing the concentration surface
    /** @type {object | null} */ bacteriumSystem: null, // Holds bacteria instances and related methods
    /** @type {object | null} */ bacteriumRenderer: null, // New renderer component for bacteria
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

// --- State Initialization Functions ---

/**
 * Initializes all data arrays for the simulation.
 * Creates empty Float32Arrays for concentration data, colors, sources, and sinks.
 */
export const initializeArrays = () => {
    const gridSize = GRID.WIDTH * GRID.HEIGHT;
    console.log(`Initializing arrays for grid size: ${gridSize}`);

    // Initialize data arrays with grid dimensions
    dataState.currentConcentrationData = new Float32Array(gridSize).fill(0);
    dataState.nextConcentrationData = new Float32Array(gridSize).fill(0);
    dataState.colors = new Float32Array(gridSize * 3).fill(0);
    dataState.sources = new Float32Array(gridSize).fill(0);
    dataState.sinks = new Float32Array(gridSize).fill(0);
};

/**
 * Resets animation state to initial values.
 */
export const resetAnimationState = () => {
    animationState.currentTimeStep = 1;
    animationState.numberOfTimeSteps = 0;
    animationState.play = false;
    sceneState.visibleBacteria = true;
};

/**
 * Performs full state reset for a new simulation.
 */
export const resetState = () => {
    resetAnimationState();
    initializeArrays();
};

/**
 * Converts raw simulation coordinates to grid indices.
 * @param {number} x - Raw x-coordinate from bacterium data.
 * @param {number} y - Raw y-coordinate from bacterium data.
 * @returns {{x: number, y: number, idx: number} | null} Object containing adjusted grid coordinates and array index.
 */
export const getAdjustedCoordinates = (x, y) => {
    // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
    let adjustedX = Math.round(x + GRID.WIDTH / 2);
    let adjustedY = Math.round(y + GRID.HEIGHT / 2);

    // Skip bacteria below the grid's bottom edge.
    if (adjustedY <= 0) {
        return null;
    }

    // Clamp coordinates to valid grid boundaries (leaving a 1-cell border).
    adjustedY = Math.min(adjustedY, GRID.HEIGHT - 2); 
    adjustedX = Math.max(1, Math.min(adjustedX, GRID.WIDTH - 2));

    // Calculate the 1D index corresponding to the 2D grid coordinates.
    const idx = adjustedY * GRID.WIDTH + adjustedX;

    return { x: adjustedX, y: adjustedY, idx };
};

/**
 * Calculates an RGB color based on a concentration value.
 * @param {number} concentration - The concentration value at a grid point.
 * @returns {{r: number, g: number, b: number}} An object containing RGB color components.
 */
export const calculateColor = (concentration) => {
    // Normalize concentration value
    const normalizedConcentration = concentration / 10; 

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