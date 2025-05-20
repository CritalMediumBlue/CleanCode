
export const createStates = (gridSize) => {
    const animationState = {
        /** @type {number | null} */ animationFrameId: null, // ID for requestAnimationFrame
        /** @type {number} */ currentTimeStep: 1, // Current step in the simulation playback
        /** @type {boolean} */ play: false, // Controls whether the animation is running
    }; 
    sealObject(animationState);
    const concentrationState = {
        concentrationField: new Float64Array(gridSize).fill(0.001),
        sources: new Float64Array(gridSize).fill(0),
        sinks:new Float64Array(gridSize).fill(0),
        visible:null,
    }
    sealObject(concentrationState);
    return {
        animationState,
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




let totalBacteriaCountHistory = [];
let magentaBacteriaCountHistory = [];
let cyanBacteriaCountHistory = [];
let averageSimilarityHistory = [];

export const resetHistories = () => {
    totalBacteriaCountHistory = [];
    magentaBacteriaCountHistory = [];
    cyanBacteriaCountHistory = [];
    averageSimilarityHistory = [];
}

/**
 * Update history arrays with new data
 * @param {number} totalCount - Total bacteria count
 * @param {number} magentaCount - Magenta bacteria count
 * @param {number} cyanCount - Cyan bacteria count
 * @param {number} averageSimilarity - Average similarity value
 */
export const updateHistories = (totalCount, magentaCount, cyanCount, averageSimilarity) => {
    totalBacteriaCountHistory.push(totalCount);
    magentaBacteriaCountHistory.push(magentaCount/totalCount);
    cyanBacteriaCountHistory.push(cyanCount/totalCount);
    averageSimilarityHistory.push(averageSimilarity);
};

/**
 * Get all history arrays
 * @returns {Array} Array containing all history data series
 */
export const getHistories = () => {
    const dataLength = totalBacteriaCountHistory.length;
    const data = [
        Array.from({ length: dataLength }, (_, index) => index),
        totalBacteriaCountHistory,
        magentaBacteriaCountHistory,
        cyanBacteriaCountHistory,
        averageSimilarityHistory
    ];

    return data;
};

