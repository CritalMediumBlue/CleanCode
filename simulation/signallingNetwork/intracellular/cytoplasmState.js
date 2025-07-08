
export const variables = {};
export const parameters = {};
export const interiorManager = {};
export const exteriorManager = {};
export const intSpeciesNames = [];
export const extSpeciesNames = [];
export const concentrationsState = {};


let speciesNames = null;
let secretedSpecies = null;

export const getSpeciesNames = () => speciesNames;
export const getSecretedSpecies = () => secretedSpecies;
export const setSpeciesNames = (names) => { speciesNames = names; };
export const setSecretedSpecies = (species) => { secretedSpecies = species; };

export const setModel = (params, vars, config, bacteriaData) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);
    
    const speciesNamesLocal = Object.keys(variables.int);
    const secretedSpeciesLocal = Object.keys(variables.ext);
    
    // Set internal state
    setSpeciesNames(speciesNamesLocal);
    setSecretedSpecies(secretedSpeciesLocal);
    
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
            console.log(variables.int[speciesName].val() + " " +speciesName)
            interiorManager[speciesName].set(ID, variables.int[speciesName].val()); 
        }); 
        extSpeciesNames.forEach((speciesName) => { 
            exteriorManager[speciesName].set(ID, variables.ext[speciesName].val()); 
        }); 
    }); 
};

export const setParameter = (paramName, value) => {
    parameters[paramName] = value;
};
