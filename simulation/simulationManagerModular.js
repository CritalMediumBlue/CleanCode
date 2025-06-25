 import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulationModular.js';
//import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulationSpo.js';
import { diffuse } from './diffusionStep.js';;


let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
let parsedEquations = null;


const width = 100; // Assuming a grid width of 100
const height = 60; // Assuming a grid height of 60


export function updateSimulation(currentBacteria, concentrationState, minutes) {


    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 1.5; // seconds

    const numberOfIterations = Math.round(totalTimeLapse / timeLapse);
    let bacteriaDataUpdated
    
    for (let i = 0; i < numberOfIterations; i++) {
        bacteriaDataUpdated = updateBacteriaCytoplasm(currentBacteria, concentrationState,cytoplasmManager,HEIGHT,WIDTH,timeLapse, 
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


export function createBacteriumSystem(config, equations) {
    parsedEquations = JSON.parse(equations);
   
    // Initialize cytoplasmManager dynamically based on species in the JSON
    cytoplasmManager = {};
    
    // Get all species names from the parsed equations
    const speciesNames = Object.keys(parsedEquations.intracellularSpecies);
    
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