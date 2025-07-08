// Cytoplasm Initialization Module
// This module handles the one-time setup and configuration of the cytoplasm model

import { 
    variables, 
    parameters, 
    interiorManager, 
    exteriorManager, 
    intSpeciesNames, 
    extSpeciesNames, 
    concentrationsState,
    setSpeciesNames,
    setSecretedSpecies,
    setParameter
} from './cytoplasmState.js';

export { setParameter };

export const setModel = (params, vars, config, bacteriaData) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);
    
    const speciesNames = Object.keys(variables.int);
    const secretedSpecies = Object.keys(variables.ext);
    
    // Set internal state
    setSpeciesNames(speciesNames);
    setSecretedSpecies(secretedSpecies);
    
    const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT;

    initializeSpecies(variables.int, intSpeciesNames, interiorManager, false, gridSize);
    initializeSpecies(variables.ext, extSpeciesNames, exteriorManager, true, gridSize);
    lockObjects([interiorManager, exteriorManager, concentrationsState, variables, parameters]);
    setCytopManager(bacteriaData);

    return concentrationsState;
};

function initializeSpecies(speciesObj, speciesNames, manager, isExternal, gridSize) {
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

function lockObjects(objectArray) {
    objectArray.forEach(obj => {
        Object.seal(obj); 
        Object.preventExtensions(obj);
    });
}

const setCytopManager = (bacteriaData) => { 
    bacteriaData.forEach((bacterium) => { 
        const ID = bacterium.id; 
        intSpeciesNames.forEach((speciesName) => { 
            interiorManager[speciesName].set(ID, variables.int[speciesName].val); 
        }); 
        extSpeciesNames.forEach((speciesName) => { 
            exteriorManager[speciesName].set(ID, variables.ext[speciesName].val); 
        }); 
    }); 
};
