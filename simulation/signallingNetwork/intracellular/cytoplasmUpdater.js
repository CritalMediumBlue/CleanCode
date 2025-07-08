// Cytoplasm Updater Module
// This module handles frequent updates and calculations for cytoplasm concentrations
// This is hot code that gets called very frequently during simulation

import { 
    variables, 
    parameters, 
    interiorManager, 
    exteriorManager, 
    concentrationsState,
    getSpeciesNames,
    getSecretedSpecies
} from './cytoplasmState.js';

export const updateAllCytoplasms = (positionMap, timeLapse, variables, parameters, interiorManager, exteriorManager, concentrationsState) => {
    for (const [id, idx] of positionMap.entries()) {
        simulateConcentrations(id, timeLapse, idx, variables, parameters, interiorManager, exteriorManager, concentrationsState);
    }
};

function simulateConcentrations(ID, timeLapse, idx, variables, parameters, interiorManager, exteriorManager, concentrationsState) {
    const speciesNames = getSpeciesNames();
    const secretedSpecies = getSecretedSpecies();
    
    inheritConcentrations(ID, idx, interiorManager, exteriorManager, variables, concentrationsState);

    for (let i = 0, len = speciesNames.length; i < len; i++) {
        const speciesName = speciesNames[i];
        const manager = interiorManager[speciesName];
        const varInt = variables.int[speciesName];
        const origConc = manager.get(ID);
        const delta = varInt.eq(variables, parameters);
        const newConc = origConc + delta * timeLapse;
        manager.set(ID, newConc > 1e-6 ? newConc : 1e-6);
    }

    secretedSpecies.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = variables.ext[speciesName].eq(variables, parameters);
    });
}

function inheritConcentrations(ID, idx, interiorManager, exteriorManager, variables, concentrationsState) {
    const speciesNames = getSpeciesNames();
    const secretedSpecies = getSecretedSpecies();

    for (let i = 0, len = speciesNames.length; i < len; i++) {
        const speciesName = speciesNames[i];
        const managerInt = interiorManager[speciesName];
        if (!managerInt.has(ID)) {
            const defaultVal = managerInt.get(ID / 2n);
            managerInt.set(ID, defaultVal);
        }
        variables.int[speciesName].val = managerInt.get(ID);
    }

    for (let i = 0, len = secretedSpecies.length; i < len; i++) {
        const speciesName = secretedSpecies[i];
        const extManager = exteriorManager[speciesName];
        const concValue = concentrationsState[speciesName].conc[idx];
        extManager.set(ID, concValue);
        variables.ext[speciesName].val = extManager.get(ID);
    }
}

export const calculateResultArray = (currentBacteria, interiorManager) => {
    const speciesNames = getSpeciesNames();
    
    const resultArray = currentBacteria.map(bacterium => {
        const { id, x, y, longAxis, angle } = bacterium;
        const cytoplasmConcentrations = {};
        speciesNames.forEach((speciesName) => {
            cytoplasmConcentrations[speciesName] = interiorManager[speciesName].get(id);
        });
        return {
            id,
            x,
            y,
            angle,
            longAxis,
            phenotype: "test",
            cytoplasmConcentrations,
        };
    });
    return resultArray;
};
