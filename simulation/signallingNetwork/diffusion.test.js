import {ADI } from './extracellular/ADI.js';
import {FTCS } from './FTCS.js';

        const WIDTH = 100;
        const HEIGHT = 60;
        const totalCells = WIDTH * HEIGHT;

        // Pick parameters so that both methods cover the same physical time.
        const DIFFUSION_RATE = 40; // choose a moderate value
        const deltaX = 1; // micrometers
        const deltaT = 0.28;  // seconds
        const tolerance = 5e-3; 

        const timeLapses = [];
        const intervals = Math.round((4)/deltaT)

        for (let i = 0; i <= intervals; i ++) {
            timeLapses.push(2.5 + i * deltaT); 
        }
        
        const sources = new Float64Array(100*60).fill(0);
        let numberOfSources = 100;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (WIDTH*HEIGHT));
            const randomIndex2 = Math.floor(Math.random() * (WIDTH*HEIGHT));
            if (Math.abs(sources[randomIndex]) < 5 && Math.abs(sources[randomIndex2]) < 5) {
                const randomSource = 5 * (Math.random() - 0.5);
                sources[randomIndex] += randomSource;
                sources[randomIndex2] -= randomSource;
                numberOfSources--;
            }
        }
       

describe('Compare Diffusion methods', () => {   
        test.each(timeLapses)('%s sec', (timeLapse) => {
            const initialForADI = new Float64Array(totalCells).fill(1);
            const initialForFTCS = new Float64Array(totalCells).fill(1);
            console.log( timeLapse / deltaT)

             const maxDeltaT =0.1* deltaX * deltaX / (4 * DIFFUSION_RATE); // Time step based on stability condition
    
            console.log(timeLapse / maxDeltaT)
            
            const resultADI = ADI(initialForADI, sources, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
            const resultFTCS = FTCS(initialForFTCS, sources, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
           
            let maxValue = 0;
            let minValue = 1e20;
            for (let i = 0; i < totalCells; i++) {
                if (resultADI[i] > maxValue) {
                    maxValue = resultADI[i];
                }
                if (resultADI[i] < minValue) {
                    minValue = resultADI[i];
                }
            }
            const range = Math.abs(maxValue - minValue);
            let maxdiff = 0;
            for (let i = 0; i < totalCells; i++) {
                const diff = Math.abs(resultADI[i] - resultFTCS[i]);
                const relativeDiff = diff / range;
                maxdiff = relativeDiff > maxdiff ? relativeDiff : maxdiff
            }
            expect(maxdiff).toBeLessThan(tolerance);
        });
});

const SteadyStateTolerance = 0.05; // 25% tolerance

// Refactored test using the updated function
describe('Compare SteadyState time', () => {
    test('ADI should require the same iterations as FTCS', () => {
        const counterADI = countIterationsToSteadyState(ADI, 0.25);
        const counterFTCS = countIterationsToSteadyState(FTCS, 0.25);

        const diff = Math.abs(counterADI - counterFTCS)/2;
        const mean = (counterADI + counterFTCS) / 2;
        const relativeDiff = diff / mean;
        expect(relativeDiff).toBeLessThan(SteadyStateTolerance);
    });
});

describe('Compare SteadyState time', () => {
    test('ADI should require the same iterations as FTCS', () => {
        const counterADI = countIterationsToSteadyState(ADI, 0.5);
        const counterFTCS = countIterationsToSteadyState(FTCS, 0.5);
        
        const diff = Math.abs(counterADI - counterFTCS)/2;
        const mean = (counterADI + counterFTCS) / 2;
        const relativeDiff = diff / mean;
        expect(relativeDiff).toBeLessThan(SteadyStateTolerance);
    });
});

describe('Compare SteadyState time', () => {
    test('ADI should require the same iterations as FTCS', () => {
        const counterADI = countIterationsToSteadyState(ADI, 1);
        const counterFTCS = countIterationsToSteadyState(FTCS, 1);

        const diff = Math.abs(counterADI - counterFTCS)/2;
        const mean = (counterADI + counterFTCS) / 2;
        const relativeDiff = diff / mean;
        expect(relativeDiff).toBeLessThan(SteadyStateTolerance);
    });
});
 

// Update the countIterationsToSteadyState function to accept a timeStep parameter
const countIterationsToSteadyState = (method, timeStep) => {
    const initial = new Float64Array(totalCells).fill(1);
    let steadyState = false;
    let counter = 0;
    while (!steadyState) {
        counter += 1;
        steadyState = true;
        const original = new Float64Array(initial); 
        // Calculate next state
        const nextConcentration = method(
            initial,
            sources,
            deltaX,
            deltaT,
            DIFFUSION_RATE,
            timeStep
        );
        // Check for steady state
        for (let i = 0; i < totalCells; i++) {
            if (Math.abs(nextConcentration[i] - original[i]) > tolerance ) {
                steadyState = false;
                break;
            }
        }
        // Update for next iteration
        initial.set(nextConcentration);
    }
    return counter;
}