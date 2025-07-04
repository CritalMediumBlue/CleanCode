 import { updateSignallingCircuit, setModel,setParameter,setCytopManager } from './signallingNetwork/signallingNetwork.js';


let WIDTH;
let HEIGHT;
let nameOfSpecies = [];
export function createBacteriumSystem(config, vars, params) {
    
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
    nameOfSpecies = Object.keys(vars.int);
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

    
    ({ bacteriaDataUpdated, concentrations } = updateSignallingCircuit(currentBacteria, HEIGHT, WIDTH, timeLapse,numberOfIterations));
 
    

    return {
        bacteriaDataUpdated,
        concentrations
    };

}




export function getGlobalSpeciesConcentrations(bacteriaData) {
    // Initialize array with zeros for each species
    const arrayOfConcentrations = new Array(nameOfSpecies.length).fill(0);

    nameOfSpecies.forEach((speciesName, index) => {
        bacteriaData.forEach((bacterium) => {
            const conc = bacterium.cytoplasmConcentrations[speciesName];
            arrayOfConcentrations[index] += conc;
        });
    });

    // Calculate average concentration for each species
    for (let i = 0; i < arrayOfConcentrations.length; i++) {
        arrayOfConcentrations[i] /= bacteriaData.length;
    }
    
    return arrayOfConcentrations;
}
