import { getAdjustedCoordinates } from "./grid.js";
import { ADI } from "./extracellular/ADI.js";

const variables = {};
const parameters = {};
const interiorManager = {};
const exteriorManager = {};
const intSpeciesNames = [];
const extSpeciesNames = [];
const concentrationsState = {};

const MIN_CONCENTRATION = 1e-6;


export const setModel = (params, vars, config) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);

    const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT;

    initializeSpecies(variables.int, intSpeciesNames, interiorManager, false, gridSize);
    initializeSpecies(variables.ext, extSpeciesNames, exteriorManager, true, gridSize);

    lockObjects([interiorManager, exteriorManager, concentrationsState, variables, parameters]);

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


export const setCytopManager = (bacteriaData) => {
    intSpeciesNames.forEach((speciesName) => {
        bacteriaData.forEach((bacterium) => {
            const ID = bacterium.ID;
            if (!interiorManager[speciesName].has(ID)) {
                interiorManager[speciesName].set(ID, variables.int[speciesName].val);
            }
        });
    });

    extSpeciesNames.forEach((speciesName) => {
        bacteriaData.forEach((bacterium) => {
            const ID = bacterium.ID;
            if (!exteriorManager[speciesName].has(ID)) {
                exteriorManager[speciesName].set(ID, variables.ext[speciesName].val);
            }
        });
    });
};


function inheritConcentrations(ID, idx) {
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


function simulateConcentrations(ID, timeLapse, idx) {
    const finalConcentrations = {};

    inheritConcentrations(ID, idx);
    
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

function clearConcentrationSources() {
    extSpeciesNames.forEach((speciesName) => {
        concentrationsState[speciesName].sources.fill(0);
    });
}

const positionMap = new Map();

function createPositionMap(currentBacteria, HEIGHT, WIDTH) {
    positionMap.clear();
    currentBacteria.forEach(bacterium => {
        const { x, y, ID } = bacterium;
        const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        positionMap.set(ID, idx);
    });
}

export const updateSignallingCircuit = (currentBacteria, HEIGHT, WIDTH, timeLapse, numberOfIterations) => {
    createPositionMap(currentBacteria, HEIGHT, WIDTH);
    for (let i = 0; i < numberOfIterations; i++) {
        clearConcentrationSources();
        


        //One web Worker can handle this loop
        currentBacteria.forEach(bacterium => {
            const { ID } = bacterium;
            const idx = positionMap.get(ID);
            simulateConcentrations(ID, timeLapse, idx);
        });

        



        // Another web Worker can handle this loop
        extSpeciesNames.forEach((speciesName) => {
          ADI(concentrationsState[speciesName].conc,
            concentrationsState[speciesName].sources,
            1, 
            0.1, 
            100, 
            timeLapse);
        });




    }

    const resultArray = currentBacteria.map(bacterium => {
        const { ID, x, y, longAxis, angle } = bacterium;
        const idx = positionMap.get(ID);
        const cytoplasmConcentrations = simulateConcentrations(ID, timeLapse, idx);
        
        return {
            id: ID,
            x,
            y,
            angle,
            longAxis,
            phenotype: "test",
            cytoplasmConcentrations,
        };
    });

    return {
        bacteriaDataUpdated: resultArray,
        concentrations: concentrationsState
    };
};