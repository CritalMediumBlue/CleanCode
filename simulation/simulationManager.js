 import { updateBacteriaCytoplasm, setModel,setParameter,setCytopManager } from './signallingNetwork/signallingNetwork.js';


let WIDTH;
let HEIGHT;

export function createBacteriumSystem(config, vars, params) {
    setModel(params, vars);
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}

export const setParamFromGUI = (paramName, newValue) => {setParameter(paramName, newValue);}

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
    const concentration = concentrationState.concentrationField;
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


