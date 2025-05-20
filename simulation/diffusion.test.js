import { number } from 'yargs';
import {ADI, FTCS} from './diffusion.js';

        const WIDTH = 100;
        const HEIGHT = 60;
        const totalCells = WIDTH * HEIGHT;

        // Pick parameters so that both methods cover the same physical time.
        const DIFFUSION_RATE = 100; // choose a moderate value
        const deltaX = 1; // micrometers
        
        const deltaT = 0.08; // seconds
        const tolerance = 6e-6; 


        const timeLapses = [60, 100, 140]; // seconds
        const numberOfSinksAndSources = [100, 300, 600]; 

describe('Diffusion methods with low sources', () => {   
        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources = numberOfSinksAndSources[0];
        let numberOfSinks = numberOfSinksAndSources[0];

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] <= 10) {
                sources[randomIndex] += 3;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] <= 10) {
                sinks[randomIndex] += 3;
                numberOfSinks--;
            }
        }

       test('short timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[0]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('moderate timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[1]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('Long timelapse', () => {
       const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[2]; // seconds

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
        let numberOfSources = numberOfSinksAndSources[1];
        let numberOfSinks = numberOfSinksAndSources[1];

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] <= 10) {
                sources[randomIndex] += 5;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] <= 10) {
                sinks[randomIndex] += 5;
                numberOfSinks--;
            }
        }

       test('short timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[0]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('moderate timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[1]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('Long timelapse', () => {
       const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[2]; // seconds

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
        let numberOfSources = numberOfSinksAndSources[2];
        let numberOfSinks =  numberOfSinksAndSources[2];

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] <= 10) {
                sources[randomIndex] += 3;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] <= 10) {
                sinks[randomIndex] += 3;
                numberOfSinks--;
            }
        }

       test('short timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[0]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     test('moderate timelapse', () => {
        const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[1]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
      test('Long timelapse', () => {
       const initialForADI = new Float64Array(totalCells).fill(5);
        const initialForFTCS = new Float64Array(totalCells).fill(5);
   
        const timeLapse = timeLapses[2]; // seconds

        const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
        
        for (let i = 0; i < totalCells; i++) {
            expect(Math.abs(resultADI[i] - resultFTCS[i])).toBeLessThan(tolerance);
        }
    });
     
});