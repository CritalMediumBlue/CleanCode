
export const createStates = () => {
    const session = {
        /** @type {number | null} */ animationFrameId: null, // ID for requestAnimationFrame
        /** @type {number} */ currentTimeStep: 1, // Current step in the simulation playback
        /** @type {boolean} */ play: false, // Controls whether the animation is running
                /** @type {boolean} */ simulationInProgress: false, // Flag to track if a simulation step is currently in progress

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



// Dynamic history arrays storage
let numberOfSpecies = 0;
let meanHistories = [];
let stdDevHistories = [];

/**
 * Initialize history arrays for a specific number of time series
 * @param {number} speciesCount - Number of time series/species to track
 */
export const createHistories = (speciesCount) => {
    numberOfSpecies = speciesCount;
    meanHistories = Array.from({ length: speciesCount }, () => []);
    stdDevHistories = Array.from({ length: speciesCount }, () => []);
}

/**
 * Reset all history arrays to empty
 */
export const resetHistories = () => {
    if (numberOfSpecies === 0) return;
    
    meanHistories = Array.from({ length: numberOfSpecies }, () => []);
    stdDevHistories = Array.from({ length: numberOfSpecies }, () => []);
}

/**
 * Update history arrays with new data
 * @param {Array<number>} means - Array of mean values for each species
 * @param {Array<number>} standardDevs - Array of standard deviation values for each species
 */
export const updateHistories = (means, standardDevs) => {
    // Ensure arrays match the expected size
    const meansToUpdate = means.slice(0, numberOfSpecies);
    const stdDevsToUpdate = standardDevs.slice(0, numberOfSpecies);
    
    // Update each history array
    meansToUpdate.forEach((mean, index) => {
        meanHistories[index].push(mean);
    });
    
    stdDevsToUpdate.forEach((stdDev, index) => {
        stdDevHistories[index].push(stdDev);
    });
};

/**
 * Get all history arrays
 * @returns {Array} Array containing all history data series
 */
export const getHistories = () => {
    // Use the first history's length to determine data length
    // (all histories should have the same length)
    const dataLength = meanHistories[0]?.length || 0;
    
    // Create time indices (0, 1, 2, ...)
    const timeIndices = Array.from({ length: dataLength }, (_, index) => index);
    
    // Build the means array with time indices as the first element
    const means = [timeIndices, ...meanHistories];
    
    // Build the stdDevs array with time indices as the first element
    const stdDevs = [timeIndices, ...stdDevHistories];
    
    return [means, stdDevs];
};

