 import { updateBacteriaCytoplasm, setModel,setParameter,setCytopManager } from './signallingNetwork/signallingNetwork.js';


let WIDTH;
let HEIGHT;
/**
 * Initializes the bacterium simulation system with configuration, variables, and parameters.
 * @param {Object} config - Simulation configuration object.
 * @param {Object} vars - Model variables.
 * @param {Object} params - Model parameters.
 */
export function createBacteriumSystem(config, vars, params) {
    setModel(params, vars,config);
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
/**
 * Updates a model parameter from the GUI.
 * @param {string} paramName - The name of the parameter to update.
 * @param {*} newValue - The new value to set for the parameter.
 */
export const setParamFromGUI = (paramName, newValue) => {setParameter(paramName, newValue);}


/**
 * Assigns initial cytoplasm and exterior concentrations to each bacterium.
 * @param {Array} bacteriaData - Array of bacterium objects with unique IDs.
 */
export function assignInitialConcentrations(bacteriaData) {setCytopManager(bacteriaData);}




export function updateSimulation(currentBacteria, concentrationState, minutes) {


    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 1.5; // seconds

    const numberOfIterations = Math.round(totalTimeLapse / timeLapse);
    let bacteriaDataUpdated
    
    for (let i = 0; i < numberOfIterations; i++) {
        bacteriaDataUpdated = updateBacteriaCytoplasm(currentBacteria, concentrationState, HEIGHT, WIDTH, timeLapse);
        
    }
    
    
    const globalParams = getGlobalParamsCont(bacteriaDataUpdated,concentrationState);

    return {
        bacteriaDataUpdated,
        globalParams
    };

}




function getGlobalParamsCont(bacteriaData,concentrationState) {
    const concentration = concentrationState.conc;
    let length = concentration.length;
    let totalAimP = 0;
    let totalAimR = 0;
    let extracellulatAimP = 0;
    let totalCount = 0;

    bacteriaData.forEach((bacterium) => {
        const aimP = bacterium.cytoplasmConcentrations.x;
        const aimR = bacterium.cytoplasmConcentrations.r;
        totalAimP+=aimP;
        totalAimR+=aimR;
        totalCount++;
    } );

    for (let i = 0; i < length; i++) {
        extracellulatAimP += concentration[i];
    }
    extracellulatAimP = extracellulatAimP/length;
    

    const globalParams = [
        totalCount,
        totalAimR,
        totalAimP,
        extracellulatAimP,
    ];
    return globalParams;
}


