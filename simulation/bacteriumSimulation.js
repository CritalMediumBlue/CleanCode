/**
 * Phenotype determination, tracking, and related operations
 */



/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Set the signal value used in phenotype determination
 * @param {Object} state - Phenotype state object
 * @param {number} value - Signal value to set
 */
export function setSignalValue(state, value) {
    state.signal = clamp(value, state.config.BACTERIUM.SIGNAL.MIN, state.config.BACTERIUM.SIGNAL.MAX) / 100;
}

/**
 * Set the alpha value used in phenotype determination
 * @param {Object} state - Phenotype state object
 * @param {number} value - Alpha value to set
 */
export function setAlphaValue(state, value) {
    state.alpha = clamp(value, state.config.BACTERIUM.ALPHA.MIN, state.config.BACTERIUM.ALPHA.MAX);
}

/**
 * Get phenotype for a bacterium based on inheritance from parent
 * @param {Object} state - Phenotype state object
 * @param {bigint} ID - Bacterium ID
 * @param {bigint} parentID - Parent bacterium ID
 * @returns {string} Phenotype value
 */
export function simplifiedInheritancePhenotype(state, ID, parentID) {
    // Check if phenotype is already determined for this ID
    if (state.phenotypeMemo.has(ID)) {
        return state.phenotypeMemo.get(ID);
    }
    
    // Check if parent phenotype is available
    if (parentID !== undefined && state.phenotypeMemo.has(parentID)) {
        const phenotype = state.phenotypeMemo.get(parentID);
        state.phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }
    
    // Assign random phenotype if no inheritance information
    const phenotype = Math.random() < 0.5 ? state.phenotypes.MAGENTA : state.phenotypes.CYAN;
    state.phenotypeMemo.set(ID, phenotype);
    return phenotype;
}

/**
 * Determine phenotype based on neighbors and local concentration
 * @param {Object} state - Phenotype state object
 * @param {bigint} ID - Bacterium ID
 * @param {Array} neighbors - Count of [total, magenta, cyan] neighbors
 * @param {number} localConcentration - Local concentration value
 * @returns {string} Phenotype value
 */
export function inheritancePhenotype(state, ID, neighbors, localConcentration) {
    // If phenotype already determined, use transition rules
    if (state.phenotypeMemo.has(ID)) {
        return determineTransitionPhenotype(state, ID, neighbors, localConcentration);
    }
    
    // Handle parent inheritance for IDs > 2000
    if (ID > 2000n) {
        const parentID = ID / 2n;
        if (state.phenotypeMemo.has(parentID)) {
            const phenotype = state.phenotypeMemo.get(parentID);
            state.phenotypeMemo.set(ID, phenotype);
            return phenotype;
        }
    }
    
    // Handle initial bacteria (IDs 1000-2000)
    if (ID >= 1000n && ID <= 2000n) {
        const phenotype = Math.random() < 0.5 ? state.phenotypes.MAGENTA : state.phenotypes.CYAN;
        state.phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }
    
    // Default case - should not reach here in normal operation
    return null;
}

/**
 * Determine phenotype transition based on current phenotype and environment
 * @param {Object} state - Phenotype state object
 * @param {bigint} ID - Bacterium ID
 * @param {Array} neighbors - Count of [total, magenta, cyan] neighbors
 * @param {number} localConcentration - Local concentration value
 * @returns {string} Phenotype value after potential transition
 */
export function determineTransitionPhenotype(state, ID, neighbors, localConcentration) {
    const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
    const proportionCyan = cyanNeighbors / totalNeighbors;
    const originalPhenotype = state.phenotypeMemo.get(ID);
    
    // Calculate transition rates based on feedback type
    let K_c2m, K_m2c; // Transition rates: cyan-to-magenta and magenta-to-cyan
    
    if (state.config.BACTERIUM.POSITIVE_FEEDBACK) {
        K_c2m = state.alpha + localConcentration * state.signal;
        K_m2c = state.alpha + proportionCyan * state.signal;
    } else {
        K_c2m = state.alpha + proportionCyan * state.signal;
        K_m2c = state.alpha + localConcentration * state.signal;
    }
    
    // Determine new phenotype based on transition probabilities
    const rand = Math.random();
    let phenotype;
    
    if (originalPhenotype === state.phenotypes.MAGENTA) {
        phenotype = rand < K_m2c ? state.phenotypes.CYAN : state.phenotypes.MAGENTA;
    } else {
        phenotype = rand < K_c2m ? state.phenotypes.MAGENTA : state.phenotypes.CYAN;
    }
    
    state.phenotypeMemo.set(ID, phenotype);
    return phenotype;
}

/**
 * Determine phenotype and calculate similarity with neighbors
 * 
 * @param {Object} state - Phenotype state object
 * @param {bigint} ID - Bacterium ID
 * @param {Array} neighbors - Count of [total, magenta, cyan] neighbors
 * @param {bigint} parentID - Parent bacterium ID
 * @param {number} localConcentration - Local concentration value
 * @returns {Object} Object containing phenotype and similarity information
 */
export function determinePhenotypeAndSimilarity(state, ID, neighbors, parentID, localConcentration) {
    // Determine phenotype based on inheritance or neighbors
    const phenotype = parentID === undefined 
        ? inheritancePhenotype(state, ID, neighbors, localConcentration) 
        : simplifiedInheritancePhenotype(state, ID, parentID);
    
    // Calculate similarity with neighbors
    const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
    const magentaProportion = magentaNeighbors / totalNeighbors;
    const cyanProportion = cyanNeighbors / totalNeighbors;
    
    const similarity = phenotype === state.phenotypes.MAGENTA 
        ? magentaProportion 
        : cyanProportion;
    
    return {
        phenotype, 
        similarity, 
        magentaProportion, 
        cyanProportion
    };
}

/**
 * Get count of bacteria with magenta phenotype
 * @param {Object} state - Phenotype state object
 * @param {Set} currentTimestepBacteria - Set of bacteria IDs in the current timestep
 * @returns {number} Count of magenta bacteria
 */
export function getMagentaCount(state, currentTimestepBacteria) {
    return getPhenotypeCount(state, currentTimestepBacteria, state.phenotypes.MAGENTA);
}  //this seems wrong

/**
 * Get count of bacteria with cyan phenotype
 * @param {Object} state - Phenotype state object
 * @param {Set} currentTimestepBacteria - Set of bacteria IDs in the current timestep
 * @returns {number} Count of cyan bacteria
 */
export function getCyanCount(state, currentTimestepBacteria) {
    return getPhenotypeCount(state, currentTimestepBacteria, state.phenotypes.CYAN);
}

/**
 * Get positions of bacteria by phenotype
 * @param {Object} state - Phenotype state object
 * @param {Set} currentTimestepBacteria - Set of bacteria IDs in the current timestep
 * @returns {Array} Array of [magentaPositions, cyanPositions]
 */
export function getPositions(state, currentTimestepBacteria) {
    const magentaPositions = [];
    const cyanPositions = [];

    Array.from(currentTimestepBacteria).forEach((ID) => {
        const phenotype = state.phenotypeMemo.get(ID);
        if (!phenotype) return;
        
        if (phenotype === state.phenotypes.MAGENTA) {
            magentaPositions.push(ID);
        } else if (phenotype === state.phenotypes.CYAN) {
            cyanPositions.push(ID);
        }
    });

    return [magentaPositions, cyanPositions];
}

/**
 * Count bacteria with a specific phenotype
 * @param {Object} state - Phenotype state object
 * @param {Set} currentTimestepBacteria - Set of bacteria IDs in the current timestep
 * @param {string} targetPhenotype - Target phenotype to count
 * @returns {number} Count of bacteria with the specified phenotype
 */
export function getPhenotypeCount(state, currentTimestepBacteria, targetPhenotype) {
    return Array.from(currentTimestepBacteria).reduce((count, ID) => {
        const phenotype = state.phenotypeMemo.get(ID);
        return phenotype && phenotype === targetPhenotype ? count + 1 : count;
    }, 0);
}

/**
 * Clear phenotype memoization cache
 * @param {Object} state - Phenotype state object
 */
export function clearPhenotypeMemo(state) {
    state.phenotypeMemo.clear();
}