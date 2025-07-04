
export const createStates = () => {
    const session = {
        /** @type {number | null} */ animationFrameId: null, // ID for requestAnimationFrame
        /** @type {number} */ currentTimeStep: 1, // Current step in the simulation playback
        /** @type {boolean} */ play: false, // Controls whether the animation is running
    }; 
    sealObject(session);
 
    return {
        session
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




let firstMeanHistory = [];
let secondMeanHistory = [];
let thirdMeanHistory = [];
let firstStdDevHistory = [];
let secondStdDevHistory = [];
let thirdStdDevHistory = [];

export const resetHistories = () => {
    firstMeanHistory = [];
    secondMeanHistory = [];
    thirdMeanHistory = [];
    firstStdDevHistory = [];
    secondStdDevHistory = [];
    thirdStdDevHistory = [];
}

/**
 * Update history arrays with new data
 * @param {number} totalCount - Total bacteria count
 * @param {number} magentaCount - Magenta bacteria count
 * @param {number} cyanCount - Cyan bacteria count
 * @param {number} averageSimilarity - Average similarity value
 */
export const updateHistories = ( means, standardDevs) => {
        
    firstMeanHistory.push(means[0]);
    secondMeanHistory.push(means[1]);
    thirdMeanHistory.push(means[2]);
    firstStdDevHistory.push(standardDevs[0]);
    secondStdDevHistory.push(standardDevs[1]);
    thirdStdDevHistory.push(standardDevs[2]);
};

/**
 * Get all history arrays
 * @returns {Array} Array containing all history data series
 */
export const getHistories = () => {
    const dataLength = secondMeanHistory.length;
    const means = [
        Array.from({ length: dataLength }, (_, index) => index),
        firstMeanHistory,
        secondMeanHistory,
        thirdMeanHistory
    ];
    const stdDevs = [
        Array.from({ length: dataLength }, (_, index) => index),
        firstStdDevHistory,
        secondStdDevHistory,
        thirdStdDevHistory
    ];
    const data = [means, stdDevs];

    return data;
};

