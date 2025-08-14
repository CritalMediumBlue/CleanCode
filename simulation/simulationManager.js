 import { updateSignallingCircuit, setModel,setParameter } from './signallingNetwork/signallingNetwork.js';


let WIDTH;
let HEIGHT;
let nameOfSpecies = [];
let meanConcentrations ;
let stdDeviations;
    
export function createBacteriumSystem(config, vars, params, bacteriaData,lineageMap) {
    
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
    nameOfSpecies = Object.keys(vars.int);
     meanConcentrations = new Array(nameOfSpecies.length).fill(0);
     stdDeviations = new Array(nameOfSpecies.length).fill(0);
    setModel(params, vars,config, bacteriaData, lineageMap);

    

}

export const setParamFromGUI = (paramName, newValue) => {setParameter(paramName, newValue);}


export function updateSimulation(currentBacteria, minutes) {


    const totalTimeLapse = minutes*60; // seconds  30.99 sec
    const timeLapse = 4.5; // seconds
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

    // Calculate mean (average) concentrations
    nameOfSpecies.forEach((speciesName, index) => {
        bacteriaData.forEach((bacterium) => {
            const conc = bacterium.cytoplasmConcentrations[speciesName];
            meanConcentrations[index] += conc;
        });
    });

    // Divide by count to get mean
    for (let i = 0; i < meanConcentrations.length; i++) {
        meanConcentrations[i] /= bacteriaData.length;
    }
    
    // Calculate variance (squared differences from mean)
    nameOfSpecies.forEach((speciesName, index) => {
        bacteriaData.forEach((bacterium) => {
            const conc = bacterium.cytoplasmConcentrations[speciesName];
            const diff = conc - meanConcentrations[index];
            stdDeviations[index] += diff * diff;
        });
    });
    
    // Divide by count and take square root to get standard deviation
    for (let i = 0; i < stdDeviations.length; i++) {
        stdDeviations[i] = Math.sqrt(stdDeviations[i] / bacteriaData.length);
    }
    
    return {
        mean: meanConcentrations,
        standardDeviation: stdDeviations
    };
}
