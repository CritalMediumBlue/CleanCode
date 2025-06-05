import {ADI, FTCS} from './diffusion.js';
        const WIDTH = 100;
        const HEIGHT = 60;
        const totalCells = WIDTH * HEIGHT;

        // Pick parameters so that both methods cover the same physical time.
        const DIFFUSION_RATE = 100; // choose a moderate value
        const deltaX = 1; // micrometers
        const deltaT = 0.1;  // seconds
        const tolerance = 1e-5; 

        const timeLapses = [];

        for (let i = 1; i <= 15; i ++) {
            timeLapses.push(1.5 + i * deltaT * 5); 
        }
        
        const sources = new Float64Array(100*60).fill(0);
        const sinks = new Float64Array(100*60).fill(0);
        let numberOfSources = 100;
        let numberOfSinks = 100;

        while (numberOfSources > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sources[randomIndex] < 8) {
                sources[randomIndex] += 4;
                numberOfSources--;
            }
        }
        while (numberOfSinks > 0) {
            const randomIndex = Math.floor(Math.random() * (100*60));
            if (sinks[randomIndex] < 8) {
                sinks[randomIndex] += 4;
                numberOfSinks--;
            }
        }

describe('Compare Diffusion methods', () => {   
        test.each(timeLapses)('%s sec', (timeLapse) => {
            const initialForADI = new Float64Array(totalCells).fill(1);
            const initialForFTCS = new Float64Array(totalCells).fill(1);
            
            const resultADI = ADI(initialForADI, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);
            const resultFTCS = FTCS(initialForFTCS, sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse);

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
            console.log(range);
            
            for (let i = 0; i < totalCells; i++) {
                const diff = Math.abs(resultADI[i] - resultFTCS[i]);
                const relativeDiff = diff / range;
                expect(relativeDiff).toBeLessThan(tolerance);
            }
        });
});

const SteadyStateTolerance = 0.05; // 5% tolerance

// Refactored test using the updated function
describe('Compare SteadyState time', () => {
    test('ADI should require half as many iterations as FTCS', () => {
        const counterADI = 2*countIterationsToSteadyState(ADI, 1);
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

describe('Compare SteadyState time', () => {
    test('ADI should require twice as many iterations as FTCS', () => {
        const counterADI = countIterationsToSteadyState(ADI, 1);
        const counterFTCS = 2*countIterationsToSteadyState(FTCS, 2);

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
            sinks, 
            deltaX,
            deltaT,
            DIFFUSION_RATE,
            timeStep
        );
        // Check for steady state
        for (let i = 0; i < totalCells; i++) {
            if (Math.abs(nextConcentration[i] - original[i]) > tolerance) {
                steadyState = false;
                break;
            }
        }
        // Update for next iteration
        initial.set(nextConcentration);
    }
    return counter;
}