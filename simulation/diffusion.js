import { thomasAlgorithm, checkForUnexpectedValues } from './thomasAlgorithm.js';

export const ADI = (
    currentConcentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    const WIDTH = 100;
    const HEIGHT = 60;
    
    let intermediateConcentration = new Float32Array(WIDTH * HEIGHT);
    
    const alpha = DIFFUSION_RATE * deltaT / (2 * deltaX * deltaX);  //non-dimensional factor
    const totalNumberOfIterations = Math.round(timeLapse / deltaT); // Number of iterations required to cover the time lapse
    

    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) { //hopefully the concentration will reach steady state after a few iterations
       // First half-step
        for (let j = 0; j < HEIGHT; j++) {
            const a = Float32Array.from({length: WIDTH}, () => -alpha);
            const b = Float32Array.from({length: WIDTH}, () => 1 + 2*alpha);
            const c = Float32Array.from({length: WIDTH}, () => -alpha);
            const d = new Float32Array(WIDTH);

            for (let i = 0; i < WIDTH; i++) {
                const idx = j * WIDTH + i;
                
                // Handle y-direction terms with proper Neumann boundary conditions
                let bottom = j <= 0 ? currentConcentrationData[idx] : currentConcentrationData[(j-1) * WIDTH + i]; 
                let top = j >= HEIGHT-1 ? currentConcentrationData[idx] : currentConcentrationData[(j+1) * WIDTH + i]; 
          
                d[i] = alpha*bottom + (1 - 2*alpha)*currentConcentrationData[idx] + alpha*top + (sources[idx] - sinks[idx]) * deltaT / 2;
            }

            // Boundary conditions for Thomas algorithm
            b[0] = 1 + alpha; // Neumann boundary condition. Ghost cell has the same value as the first cell
            b[WIDTH-1] = 1 + alpha; // Neumann boundary condition. Ghost cell has the same value as the last cell
            a[0] = 0; // We don't need to solve for the ghost cell since we know its value is the same as the first cell
            c[WIDTH-1] = 0; // We don't need to solve for the ghost cell since we know its value is the same as the last cell
            
            
            // Get the solution for this row
            const rowSolution = thomasAlgorithm(a, b, c, d, WIDTH);
            
            for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[j * WIDTH + i] = rowSolution[i];
            }
        }

        
        // Second half-step
        for (let i = 0; i < WIDTH; i++) {
            const a = Float32Array.from({length: HEIGHT}, () => -alpha);
            const b = Float32Array.from({length: HEIGHT}, () => 1 + 2*alpha);
            const c = Float32Array.from({length: HEIGHT}, () => -alpha);
            const d = new Float32Array(HEIGHT);

            for (let j = 0; j < HEIGHT; j++) {
                const idx = j * WIDTH + i;
                
                // Handle x-direction terms with proper Neumann boundary conditions
                let right = i >= WIDTH-1 ? intermediateConcentration[j * WIDTH + i] : intermediateConcentration[j * WIDTH + (i+1)]; 
                let left = i <= 0 ? intermediateConcentration[j * WIDTH + i] : intermediateConcentration[j * WIDTH + (i-1)]; 
              
                d[j] = alpha*left + (1 - 2*alpha)*intermediateConcentration[idx] + alpha*right + (sources[idx] - sinks[idx]) * deltaT / 2;
            }
            
            // Boundary conditions for Thomas algorithm
            b[0] = 1 + alpha; // Neumann boundary condition. Ghost cell has the same value as the first cell
            b[HEIGHT-1] = 1 + alpha; // Neumann boundary condition. Ghost cell has the same value as the last cell
            a[0] = 0; // We don't need to solve for the ghost cell since we know its value is the same as the first cell
            c[HEIGHT-1] = 0; // We don't need to solve for the ghost cell since we know its value is the same as the last cell
            
            const columnSolution = thomasAlgorithm(a, b, c, d, HEIGHT);
            
            for (let j = 0; j < HEIGHT; j++) {
                currentConcentrationData[j * WIDTH + i] = columnSolution[j];
            }
        }

       
    }
    
    // Final validation check
    checkForUnexpectedValues(currentConcentrationData, 'currentConcentrationData');
    
    return currentConcentrationData;
};