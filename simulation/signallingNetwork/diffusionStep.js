import { ADI,FTCS } from './diffusion.js';

    const diffusionRate = 100;
    const deltaX = 1; //micrometers
    const deltaT = 0.1; //seconds
    
export function diffuse(
    concentrationState,
    timeLapse
) {
    

    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks; 

  
concentrationState.concentrationField.set(ADI(
        concentrationState.concentrationField,
        sources,
        sinks, 
        deltaX,
        deltaT,
        diffusionRate,
        timeLapse
    )); 

}
