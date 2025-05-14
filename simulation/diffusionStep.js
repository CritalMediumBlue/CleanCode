import { ADI } from './diffusion.js';

export function diffuse(
    appConfig,
    concentrationState
) {
    
    const diffusionRate = appConfig.GRID.DIFFUSION_RATE;
    const currentConcentrationData = concentrationState.concentrationField;
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks;
    const deltaX = 1; //micrometers
    const deltaT = 0.1; // seconds
    const timeLapse = 5; // seconds 
 
    
    concentrationState.concentrationField=ADI(
       
        currentConcentrationData, // Input concentration arrays
        sources,
        sinks, // Input source/sink arrays
        deltaX, 
        deltaT, // Time step
        diffusionRate, // Diffusion coefficient
        timeLapse // total simulation time
    );
}

