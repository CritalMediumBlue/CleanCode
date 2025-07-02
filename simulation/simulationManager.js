 import { updateSignallingCircuit, setModel,setParameter,setCytopManager } from './signallingNetwork/signallingNetwork.js';


let WIDTH;
let HEIGHT;

export function createBacteriumSystem(config, vars, params) {
    
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
    return setModel(params, vars,config);

}

export const setParamFromGUI = (paramName, newValue) => {setParameter(paramName, newValue);}


export function assignInitialConcentrations(bacteriaData) {setCytopManager(bacteriaData);}




export function updateSimulation(currentBacteria, minutes) {


    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 1.5; // seconds
    const numberOfIterations = Math.round(totalTimeLapse / timeLapse);

    let bacteriaDataUpdated
    let concentrations;

    
   // for (let i = 0; i < numberOfIterations; i++) {
        ({ bacteriaDataUpdated, concentrations } = updateSignallingCircuit(currentBacteria, HEIGHT, WIDTH, timeLapse,numberOfIterations));
   // }
    
    const globalParams = getGlobalParamsCont(bacteriaDataUpdated);

    return {
        bacteriaDataUpdated,
        globalParams,
        concentrations
    };

}




function getGlobalParamsCont(bacteriaData) {
    let totalAimP = 0;
    let totalAimR = 0;

    bacteriaData.forEach((bacterium) => {
        const aimP = bacterium.cytoplasmConcentrations.AimP;
        const aimR = bacterium.cytoplasmConcentrations.AimR;
        totalAimP+=aimP;
        totalAimR+=aimR;
    } );

  
    const globalParams = [
        totalAimR,
        totalAimP,
    ];
    return globalParams;
}


