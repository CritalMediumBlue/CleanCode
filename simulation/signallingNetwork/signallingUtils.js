// Utility functions for signalling network simulation

const MIN_CONCENTRATION = 1e-6;

/**
 * Initializes species data structures for internal or external species
 */
export function initializeSpecies(speciesObj, speciesNames, manager, isExternal, gridSize, concentrationsState) {
    speciesNames.splice(0, speciesNames.length, ...Object.keys(speciesObj));
    
    speciesNames.forEach((speciesName) => {
        manager[speciesName] = new Map();
        
        if (isExternal) {
            concentrationsState[speciesName] = {
                conc: new Float64Array(gridSize).fill(0),
                sources: new Float64Array(gridSize).fill(0)
            };
        }
    });
}

/**
 * Prevents modifications to objects by sealing and preventing extensions
 */
export function lockObjects(objectArray) {
    objectArray.forEach(obj => {
        Object.seal(obj);
        Object.preventExtensions(obj);
    });
}

function inheritConcentrations(ID, idx, intSpeciesNames, extSpeciesNames, interiorManager, exteriorManager, concentrationsState, variables) {
    intSpeciesNames.forEach((speciesName) => {
        if (!interiorManager[speciesName].has(ID)) {
            interiorManager[speciesName].set(ID, interiorManager[speciesName].get(ID / 2n));
        }
        variables.int[speciesName].val = interiorManager[speciesName].get(ID);
    });

    extSpeciesNames.forEach((speciesName) => {
        exteriorManager[speciesName].set(ID, concentrationsState[speciesName].conc[idx]);
        variables.ext[speciesName].val = exteriorManager[speciesName].get(ID);
    });
}

/**
 * Simulates concentration changes for a specific bacterium
 */
export function simulateConcentrations(ID, timeLapse, idx, intSpeciesNames, extSpeciesNames, interiorManager, exteriorManager, concentrationsState, variables, parameters) {
    const finalConcentrations = {};

    inheritConcentrations(ID, idx, intSpeciesNames, extSpeciesNames, interiorManager, exteriorManager, concentrationsState, variables);
    
    intSpeciesNames.forEach((speciesName) => {
        const originalConcentration = interiorManager[speciesName].get(ID);
        const delta = variables.int[speciesName].eq(variables, parameters);
        finalConcentrations[speciesName] = originalConcentration + delta * timeLapse;

        if (finalConcentrations[speciesName] < MIN_CONCENTRATION) {
            finalConcentrations[speciesName] = MIN_CONCENTRATION; 
        }

        interiorManager[speciesName].set(ID, finalConcentrations[speciesName]);
    });

    extSpeciesNames.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = 
            variables.ext[speciesName].eq(variables, parameters);
    });

    return finalConcentrations;
}

/**
 * Clears concentration sources for the next simulation step
 */
export function clearConcentrationSources(extSpeciesNames, concentrationsState) {
    extSpeciesNames.forEach((speciesName) => {
        concentrationsState[speciesName].sources.fill(0);
    });
}

/**
 * Creates a position mapping for bacteria based on their coordinates
 */
export function createPositionMap(currentBacteria, HEIGHT, WIDTH, getAdjustedCoordinates) {
    const positionMap = new Map();
    currentBacteria.forEach(bacterium => {
        const { x, y, ID } = bacterium;
        const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        positionMap.set(ID, idx);
    });
    return positionMap;
}
