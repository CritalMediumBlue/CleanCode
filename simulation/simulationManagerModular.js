 import { updateBacteriaCytoplasm, initEquations } from './ContinuousPhenotypeSimulationModular.js';
import { diffuse } from './diffusionStep.js';;


let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
let equations = null;

let parsedEquations = null;

export const setIntraParameter = (paramName, newValue) => {
  parsedEquations.intracellularConstants[paramName].value = newValue;
  initEquations(equations);
}
export const setExtraParameter = (paramName, newValue) => {
    parsedEquations.extracellularConstants[paramName].value = newValue;
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


export function createBacteriumSystem(config, equationsfile) {
    equations = equationsfile;
    initEquations(equationsfile);
    parsedEquations = JSON.parse(equationsfile);

   
    cytoplasmManager = {};
    
    const speciesNames = Object.keys(JSON.parse(equationsfile).intracellularSpecies);
   
    
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