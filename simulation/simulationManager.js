// import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulation.js';
import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulationSpo.js';
import { diffuse } from './diffusionStep.js';;


let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
let parsedEquations = null;




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


export function createBacteriumSystem(config, equations) {

    parsedEquations = JSON.parse(equations);
   
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
