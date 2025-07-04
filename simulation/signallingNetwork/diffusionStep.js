import { ADI,FTCS } from './diffusion.js';

let newConcentration;
export function diffuse(
    concentration,
    sources,
    timeLapse
) {
    
  
newConcentration = ADI(
        concentration,
        sources,
        timeLapse
    ); 

    return newConcentration;

}
