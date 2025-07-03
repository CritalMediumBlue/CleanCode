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




export async function updateSimulation(currentBacteria, minutes) {
    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 3; // seconds
    const numberOfIterations = Math.round(totalTimeLapse / timeLapse);

    let bacteriaDataUpdated;
    let concentrations;

    try {
        // Since updateSignallingCircuit is now async, we need to await its result
        const result = await updateSignallingCircuit(currentBacteria, HEIGHT, WIDTH, timeLapse, numberOfIterations);
        bacteriaDataUpdated = result.bacteriaDataUpdated;
        concentrations = result.concentrations;
        
        // Make sure bacteriaDataUpdated exists before calling getGlobalParamsCont
        if (!bacteriaDataUpdated) {
            console.error("bacteriaDataUpdated is undefined after updateSignallingCircuit");
            return null;
        }
        
        const globalParams = getGlobalParamsCont(bacteriaDataUpdated);

        return {
            bacteriaDataUpdated,
            globalParams,
            concentrations
        };
    } catch (error) {
        console.error("Error in updateSimulation:", error);
        // Return a fallback or null to avoid further errors
        return null;
    }

}




function getGlobalParamsCont(bacteriaData) {
    let totalAimP = 0;
    let totalAimR = 0;
    let count = 0;

    bacteriaData.forEach((bacterium) => {
        const aimP = bacterium.cytoplasmConcentrations.AimP;
        const aimR = bacterium.cytoplasmConcentrations.AimR;
        totalAimP+=aimP;
        totalAimR+=aimR;
        count++;
    } );

  
    const globalParams = [
        totalAimR/ count,
        totalAimP/ count,
    ];
    return globalParams;
}


