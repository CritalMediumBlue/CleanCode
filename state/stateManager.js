
export const createStates = (gridSize) => {
    const session = {
        /** @type {number | null} */ animationFrameId: null, // ID for requestAnimationFrame
        /** @type {number} */ currentTimeStep: 1, // Current step in the simulation playback
        /** @type {boolean} */ play: false, // Controls whether the animation is running
    }; 
    sealObject(session);
    const concentrationState = {
        conc: new Float64Array(gridSize).fill(0.21),
        sources: new Float64Array(gridSize).fill(0),
        visible:null,
    }
    sealObject(concentrationState);
    return {
        session,
        concentrationState
    }
}

export const createConstants = () => {
    const constants = {
        numberOfTimeSteps: 0, // Total number of time steps in the simulation
        fromStepToMinutes: 0, // Conversion factor from simulation steps to minutes
        doublingTime: 45
    };
    return sealObject(constants);
} 

const sealObject = (obj) => {
    Object.seal(obj);
    Object.preventExtensions(obj);
    return obj;
}




let magentaBacteriaCountHistory = [];
let cyanBacteriaCountHistory = [];

export const resetHistories = () => {
    magentaBacteriaCountHistory = [];
    cyanBacteriaCountHistory = [];
}

/**
 * Update history arrays with new data
 * @param {number} totalCount - Total bacteria count
 * @param {number} magentaCount - Magenta bacteria count
 * @param {number} cyanCount - Cyan bacteria count
 * @param {number} averageSimilarity - Average similarity value
 */
export const updateHistories = ( magentaCount, cyanCount) => {
    magentaBacteriaCountHistory.push(magentaCount);
    cyanBacteriaCountHistory.push(cyanCount);
};

/**
 * Get all history arrays
 * @returns {Array} Array containing all history data series
 */
export const getHistories = () => {
    const dataLength = cyanBacteriaCountHistory.length;
    const data = [
        Array.from({ length: dataLength }, (_, index) => index),
        magentaBacteriaCountHistory,
        cyanBacteriaCountHistory,
    ];

    return data;
};

