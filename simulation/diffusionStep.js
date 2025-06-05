import { ADI,FTCS } from './diffusion.js';
 
export function diffuse(
    concentrationState,
    timeLapse
) {
    const diffusionRate = 100;
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks; 
    const deltaX = 1; //micrometers
    const deltaT = 0.1; //seconds

    let currentConcentration = new Float64Array(concentrationState.concentrationField);
  
concentrationState.concentrationField.set(ADI(
        currentConcentration,
        sources,
        sinks, 
        deltaX,
        deltaT,
        diffusionRate,
        timeLapse
    )); 

}
