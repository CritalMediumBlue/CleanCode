let speciesNames = null;
let secretedSpecies = null;


export const updateAllCytoplasms = (currentBacteria, positionMap, timeLapse, variables, parameters, interiorManager, exteriorManager, concentrationsState) => {
    currentBacteria.forEach(bacterium => {
        const { id } = bacterium;
        const idx = positionMap.get(id);
        simulateConcentrations(id, timeLapse, idx, variables, parameters, interiorManager, exteriorManager, concentrationsState);
    });
};

function simulateConcentrations(ID, timeLapse, idx, variables, parameters, interiorManager, exteriorManager, concentrationsState) {
    const finalConcentrations = {};

    inheritConcentrations(ID, idx, interiorManager, exteriorManager, variables, concentrationsState);

    speciesNames.forEach((speciesName) => {
        const originalConcentration = interiorManager[speciesName].get(ID);
        const delta = variables.int[speciesName].eq(variables, parameters);
        finalConcentrations[speciesName] = originalConcentration + delta * timeLapse;

        if (finalConcentrations[speciesName] < 1e-6) {
            finalConcentrations[speciesName] = 1e-6; 
        }

        interiorManager[speciesName].set(ID, finalConcentrations[speciesName]);
    });

    secretedSpecies.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = variables.ext[speciesName].eq(variables, parameters);
    });

}

function inheritConcentrations(ID, idx, interiorManager, exteriorManager, variables, concentrationsState) {
    speciesNames.forEach((speciesName) => {
        if (!interiorManager[speciesName].has(ID)) {
            interiorManager[speciesName].set(ID, interiorManager[speciesName].get(ID / 2n));
        }
        variables.int[speciesName].val = interiorManager[speciesName].get(ID);
    });

    secretedSpecies.forEach((speciesName) => {
        exteriorManager[speciesName].set(ID, concentrationsState[speciesName].conc[idx]);
        variables.ext[speciesName].val = exteriorManager[speciesName].get(ID);
    });
}

export const calculateResultArray = (currentBacteria, interiorManager) => {
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

// Moved functions and constants from signallingNetwork.js

export const variables = {};
export const parameters = {};
export const interiorManager = {};
export const exteriorManager = {};
export const intSpeciesNames = [];
export const extSpeciesNames = [];
export const concentrationsState = {};

export const setModel = (params, vars, config, bacteriaData) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);

    if (speciesNames === null) {
        speciesNames = Object.keys(variables.int);
    }
    if (secretedSpecies === null) {
        secretedSpecies = Object.keys(variables.ext);
    }

    const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT;

    initializeSpecies(variables.int, intSpeciesNames, interiorManager, false, gridSize);
    initializeSpecies(variables.ext, extSpeciesNames, exteriorManager, true, gridSize);

    lockObjects([interiorManager, exteriorManager, concentrationsState, variables, parameters]);

    setCytopManager(bacteriaData)

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

export const setParameter = (paramName, value) => {
    parameters[paramName] = value;
    console.log(`Parameter ${paramName} set to ${value}`);
};

const setCytopManager = (bacteriaData) => {
    intSpeciesNames.forEach((speciesName) => {
        bacteriaData.forEach((bacterium) => {
            const ID = bacterium.id;
            if (!interiorManager[speciesName].has(ID)) {
                interiorManager[speciesName].set(ID, variables.int[speciesName].val);
            }
        });
    });

    extSpeciesNames.forEach((speciesName) => {
        bacteriaData.forEach((bacterium) => {
            const ID = bacterium.id;
            if (!exteriorManager[speciesName].has(ID)) {
                exteriorManager[speciesName].set(ID, variables.ext[speciesName].val);
            }
        });
    });
};
