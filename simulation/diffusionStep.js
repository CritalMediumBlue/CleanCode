import { ADI,FTCS } from './diffusion.js';



/* 
    const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources =300;
        let numberOfSinks = 300;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] < 2) {
                sources[randomIndex] += 3;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] < 2) {
                sinks[randomIndex] += 3;
                numberOfSinks--;
            }
        }
 */


export function diffuse(
    appConfig,
    concentrationState
) {
    
    const diffusionRate = appConfig.GRID.DIFFUSION_RATE;
    const currentConcentrationData = concentrationState.concentrationField;
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks; 
    
    const deltaX = 1; //micrometers
    const deltaT = 0.08; //seconds
    const timeLapse = 1; //seconds

  
    
    concentrationState.concentrationField=ADI(
        currentConcentrationData, // Input concentration arrays
        sources,
        sinks, // Input source/sink arrays
        deltaX, 
        deltaT, // Time step
        diffusionRate, // Diffusion coefficient
        timeLapse, // Time step
    );
}
