import {ADI, FTCS} from './diffusion.js';
        const WIDTH = 100;
        const HEIGHT = 60;
        const totalCells = WIDTH * HEIGHT;

        // Pick parameters so that both methods cover the same physical time.
        const DIFFUSION_RATE = 100; // choose a moderate value
        const deltaX = 1; // micrometers
        const deltaT = 0.1;  // seconds
        const tolerance = 1e-4; // tolerance for floating point comparison

        const timeLapses = [];

        for (let i = 1; i <= 50; i ++) {
            timeLapses.push(i * deltaT*2); 
        }
        
        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources = 100;
        let numberOfSinks = 100;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] < 4) {
                sources[randomIndex] += 2;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] < 4) {
                sinks[randomIndex] += 2;
                numberOfSinks--;
            }
        }

describe('Diffusion methods with low sources', () => {   
        

        test.each(timeLapses)('%s sec', (timeLapse) => {
            const initialForADI = new Float64Array(totalCells).fill(0.2);
            const initialForFTCS = new Float64Array(totalCells).fill(0.2);
            
            const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
            const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
            
            for (let i = 0; i < totalCells; i++) {
                expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
            }
        });
});

describe('Diffusion methods with high sources', () => {   
       
        test.each(timeLapses)('%s sec', (timeLapse) => {
            const initialForADI = new Float64Array(totalCells).fill(0.2);
            const initialForFTCS = new Float64Array(totalCells).fill(0.2);
            
            const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
            const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
            
            for (let i = 0; i < totalCells; i++) {
                expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
            }
        });
});