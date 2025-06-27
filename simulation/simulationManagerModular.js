 import { updateBacteriaCytoplasm, initEquations } from './ContinuousPhenotypeSimulationModular.js';
import { diffuse } from './diffusionStep.js';;


let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
let equations = null;

let parameters = null;

export const setIntraParameter = (paramName, newValue) => {
  parameters.intracellularConstants[paramName].value = newValue;
  initEquations(equations);
}
export const setExtraParameter = (paramName, newValue) => {
    parameters.extracellularConstants[paramName].value = newValue;
    initEquations(equations);
}



export function updateSimulation(currentBacteria, concentrationState, minutes) {


    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 1.5; // seconds

    const numberOfIterations = Math.round(totalTimeLapse / timeLapse);
    let bacteriaDataUpdated
    
    for (let i = 0; i < numberOfIterations; i++) {
        bacteriaDataUpdated = updateBacteriaCytoplasm(currentBacteria, concentrationState, cytoplasmManager, HEIGHT, WIDTH, timeLapse,
            parsedEquations);
        
        diffuse(concentrationState, timeLapse);
    }
    
    
    const globalParams = getGlobalParamsCont(bacteriaDataUpdated,concentrationState);

    return {
        bacteriaDataUpdated,
        globalParams
    };

}


function getGlobalParamsCont(bacteriaData,concentrationState) {
    const concentration = concentrationState.concentrationField;
    let length = concentration.length;
    let totalAimP = 0;
    let totalAimR = 0;
    let extracellulatAimP = 0;
    let totalCount = 0;

    bacteriaData.forEach((bacterium) => {
        const aimP = bacterium.cytoplasmConcentrations.p;
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


export function createBacteriumSystem(config, vars, params, eqs) {
    equations = eqs;
    initEquations(eqs);
    parameters = params;

   
    cytoplasmManager = {};

    console.log("The internal variables are " );
    console.log(vars.int);

    //The log look like this:
/*     
    The internal variables are simulationManagerModular.js:90:13
    Object { x: {…}, v: {…}, y: {…} }
    ​
    v: Object { val: 0, min: -1000, max: 1000 }
    ​
    x: Object { val: 1, min: -1000, max: 1000 }
    ​
    y: Object { val: 0.5, min: -1000, max: 1000 }
    ​
    <prototype>: Object { … }
    simulationManagerModular.js:91:13
 */
        
    const speciesNames = Object.keys(vars.int)
   
    
    // Create a concentration Map for each species
    speciesNames.forEach(speciesName => {
        cytoplasmManager[`${speciesName}`] = new Map();
    });
    
    // Lock the object to prevent modifications
    Object.seal(cytoplasmManager);
    Object.preventExtensions(cytoplasmManager);

    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;

   
}