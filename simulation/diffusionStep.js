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
        diffusionRate, // Diffusion coefficient
    );
}
