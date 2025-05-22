import { ADI,FTCS } from './diffusion.js';
 
export function diffuse(
    concentrationState
) {
    
    const diffusionRate = 100;
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks; 
    
    const deltaX = 1; //micrometers
    const deltaT = 0.1; //seconds
    const timeLapse = 1; //seconds

    let steadyState = false;
    let counter = 0;
    const iterations = 1; // Add safety limit


    let currentConcentration = new Float64Array(concentrationState.concentrationField);
    let nextConcentration;

   // const beforeSum = currentConcentration.reduce((sum, val) => sum + val, 0);


for (let i = 0; i < iterations; i++) {
    counter += 1;
    steadyState = true;
    
    // Calculate next state
    nextConcentration = ADI(
        currentConcentration,
        sources,
        sinks, 
        deltaX,
        deltaT,
        diffusionRate,
        timeLapse
    );
    
    
    
    // Update for next iteration
    currentConcentration.set(nextConcentration);
}

//const afterSum = nextConcentration.reduce((sum, val) => sum + val, 0);
//console.log("Difference", Math.abs(afterSum - beforeSum));

concentrationState.concentrationField.set(currentConcentration); 

}
