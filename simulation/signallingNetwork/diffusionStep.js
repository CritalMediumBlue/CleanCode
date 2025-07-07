import { ADI } from './ADI.js';
import { FTCS } from './FTCS.js'

    const diffusionRate = 100;
    const deltaX = 1; //micrometers
    const deltaT = 0.1; //seconds
    const method = FTCS
    
export function diffuse(
    concentrationState,
    timeLapse
) {
    

    const sources = concentrationState.sources;

  
concentrationState.conc.set(method(
        concentrationState.conc,
        sources,
        deltaX,
        deltaT,
        diffusionRate,
        timeLapse
    )); 

}
