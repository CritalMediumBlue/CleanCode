 //import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulation.js';
import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulationSpo.js';
import { diffuse } from './diffusionStep.js';;


let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
let parsedEquations = null;


const width = 100; // Assuming a grid width of 100
const height = 60; // Assuming a grid height of 60
const surfactinXField = new Float64Array(width * height); // Initialize surfactinXField with the grid size

for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
        const index = i + j * width;
        surfactinXField[index] =(height- j)* 0.03; 
    }
}


export function updateSimulation(currentBacteria, concentrationState, minutes) {

    concentrationState.concentrationField = surfactinXField; // This is only for the Spo simulation, comment out for the original simulation

    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 1.5; // seconds

    const numberOfIterations = Math.round(totalTimeLapse / timeLapse);
    let bacteriaDataUpdated
    
    for (let i = 0; i < numberOfIterations; i++) {
        bacteriaDataUpdated = updateBacteriaCytoplasm(currentBacteria, concentrationState,cytoplasmManager,HEIGHT,WIDTH,timeLapse, 
            parsedEquations);
        
        //diffuse(concentrationState, timeLapse);
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
        const aimP = bacterium.cytoplasmConcentrations.p
        const aimR = bacterium.cytoplasmConcentrations.r
        totalAimP+=aimP
        totalAimR+=aimR
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


export function createBacteriumSystem(config) {

    parsedEquations = null

   
    cytoplasmManager = {
        rConcentrationMemo: new Map(),
        iConcentrationMemo: new Map(),
        lConcentrationMemo: new Map(),
        aConcentrationMemo: new Map(),
        pConcentrationMemo: new Map()
    };
    Object.seal(cytoplasmManager);
    Object.preventExtensions(cytoplasmManager);

    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
