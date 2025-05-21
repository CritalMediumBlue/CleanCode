import {ADI, FTCS} from './diffusion.js';

        const WIDTH = 100;
        const HEIGHT = 60;
        const totalCells = WIDTH * HEIGHT;

        // Pick parameters so that both methods cover the same physical time.
        const DIFFUSION_RATE = 100; // choose a moderate value
        const deltaX = 1; // micrometers
        
        const deltaT = 0.25;  // seconds
        const tolerance = 1e-6; 


        const timeLapses = [10, 20, 30, 40, 50]; // seconds

describe('Diffusion methods with low sources', () => {   
        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources =500;
        let numberOfSinks = 500;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] < 2) {
                sources[randomIndex] += 2;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] < 2) {
                sinks[randomIndex] += 2;
                numberOfSinks--;
            }
        }

       test('10 sec', () => {
        const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[0]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('20 sec', () => {
        const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[1]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('30 sec', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[2]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
    test('40 sec', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[3]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
    test('50 sec', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[4]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     
});

describe('Diffusion methods with medium sources', () => {   
        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources = 500;
        let numberOfSinks = 500;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] < 4) {
                sources[randomIndex] += 4;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] < 4) {
                sinks[randomIndex] += 4;
                numberOfSinks--;
            }
        }

       test('10 sec ', () => {
        const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[0]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('20 sec ', () => {
        const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[1]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('30 sec ', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[2]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
    test('40 sec ', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[3]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
        test('50 sec ', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[4]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     
});

describe('Diffusion methods with High sources', () => {   
        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources = 500;
        let numberOfSinks =  500;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] < 6) {
                sources[randomIndex] += 6;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] < 6) {
                sinks[randomIndex] += 6;
                numberOfSinks--;
            }
        }

       test('10 sec', () => {
        const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[0]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('20 sec', () => {
        const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[1]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('30 sec', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[2]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
    test('40 sec', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[3]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('50 sec', () => {
       const initialForADI = new Float64Array(totalCells).fill(2);
        const initialForFTCS = new Float64Array(totalCells).fill(2);
   
        const timeLapse = timeLapses[4]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     
}); 