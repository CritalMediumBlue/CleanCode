import { ADI } from './diffusion.js';

export function diffuse(
    appConfig,
    concentrationState
) {
    
    const diffusionRate = appConfig.GRID.DIFFUSION_RATE;
    const currentConcentrationData = concentrationState.concentrationField;
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks;
    const deltaX = 1;
    const deltaT = 1; 
    const timeLapse = 5; //5 seconds
    const method = "ADI";
    const dataState = null;
    
    concentrationState.concentrationField=ADI(
       
        currentConcentrationData, // Input concentration arrays
        sources,
        sinks, // Input source/sink arrays
        deltaX, 
        deltaT, // Time step
        timeLapse,
        diffusionRate, // Diffusion coefficient
        method, // Diffusion method
        dataState // Data state object
        
    );
}

/* 
const MAX_WORKERS = navigator.hardwareConcurrency || 4;
console.log("Max Workers", MAX_WORKERS);
const diffusionWorker = new Worker('./simulation/diffusionWorker.js', { type: 'module' });
let isWorkerBusy = false; // Flag to track if the worker is busy
let globalDataState = null; // Store a reference to the dataState object
 

export const requestDiffusionCalculation = (
    concentration1,
    sources,
    sinks,
     deltaX,
     deltaT,
     timeLapse,
     diffusionRate,
     method,
     dataState) => {
    if (isWorkerBusy) return; // Skip if the worker is busy

    isWorkerBusy = true;
    globalDataState = dataState; // Store reference to dataState


    
   
    diffusionWorker.postMessage({
        concentration1,
        sources,
        sinks,
        diffusionRate,
        deltaX,
        deltaT,
        method: method,
        timeLapse: timeLapse,
    });
};

// Handle messages from the Web Worker
diffusionWorker.onmessage = function(e) {
    const { currentConcentrationData, steadyState } = e.data;

    if (globalDataState) {
        globalDataState.currentConcentrationData = currentConcentrationData;
        globalDataState.steadyState = steadyState;
        globalDataState.currentTimeStep++;
    }
    isWorkerBusy = false;
};

// Handle errors from the Web Worker
diffusionWorker.onerror = function(error) {
    console.error('Diffusion Worker Error:', error);
    isWorkerBusy = false;
};

 */