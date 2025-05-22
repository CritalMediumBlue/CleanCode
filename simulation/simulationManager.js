import { prepareDiffusionStep} from './diffusionManager.js';
import { updateBacteriaCytoplasm } from './ContinuousPhenotypeSimulation.js';


let cytoplasmManager = null;
let WIDTH;
let HEIGHT;

export function updateSimulation(currentBacteria, concentrationState, appConfig, minutes) {

    const timeLapse = minutes*60; // seconds  30.99 sec

    const concentration = concentrationState.concentrationField;
  
    
 
    const bacteriaDataUpdated = updateBacteriaCytoplasm(currentBacteria, concentration,cytoplasmManager,HEIGHT,WIDTH);
    prepareDiffusionStep(currentBacteria, concentrationState, appConfig,cytoplasmManager);
     
    
    
    
    const globalParams = getGlobalParamsCont(bacteriaDataUpdated,concentration);

    return {
        bacteriaDataUpdated,
        globalParams
    };

}


function getGlobalParamsCont(bacteriaData,concentration) {
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
    cytoplasmManager = {
        signal: config.BACTERIUM.SIGNAL.DEFAULT ,
        pConcentrationMemo: new Map(),
        rConcentrationMemo: new Map()
    };
    Object.seal(cytoplasmManager);
    Object.preventExtensions(cytoplasmManager);

    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
