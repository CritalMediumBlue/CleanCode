import {ADI, FTCS} from './diffusion.js';

describe('Diffusion methods', () => {   
         const WIDTH = 100;
        const HEIGHT = 60;
        const totalCells = WIDTH * HEIGHT;

        // Pick parameters so that both methods cover the same physical time.
        const DIFFUSION_RATE = 100; // choose a moderate value
        const deltaX = 1; // micrometers
        
        const deltaT = 0.01; // seconds
        const tolerance = 1e-5; 


        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources = 200;
        let numberOfSinks = 200;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] <= 10) {
                sources[randomIndex] += 4;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] <= 10) {
                sinks[randomIndex] += 4;
                numberOfSinks--;
            }
        }

       test('short timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(1);
        const initialForFTCS = new Float64Array(totalCells).fill(1);
   
        const timeLapse = 5; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('moderate timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(1);
        const initialForFTCS = new Float64Array(totalCells).fill(1);
   
        const timeLapse = 15; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('Long timelapse', () => {
       const initialForADI = new Float64Array(totalCells);
        const initialForFTCS = new Float64Array(totalCells);
   
        const timeLapse = 30; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     
});