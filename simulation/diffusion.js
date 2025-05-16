import { thomasAlgorithm, checkForUnexpectedValues } from './thomasAlgorithm.js';

export const ADI = (
    currentConcentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    const WIDTH = 100;
    const HEIGHT = 60;
    
    let intermediateConcentration = new Float32Array(WIDTH * HEIGHT);
    let finalConcentration = new Float32Array(WIDTH * HEIGHT);
    
    const alpha = DIFFUSION_RATE * deltaT / (2 * deltaX * deltaX); 
    const totalNumberOfIterations = Math.round(timeLapse / deltaT);
    

    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) {
        // First half-step: implicit in x-direction, explicit in y-direction
        for (let j = 0; j < HEIGHT; j++) {
            const a = Float32Array.from({length: WIDTH}, () => -alpha);
            const b = Float32Array.from({length: WIDTH}, () => 1 + 2*alpha);
            const c = Float32Array.from({length: WIDTH}, () => -alpha);
            const d = new Float32Array(WIDTH);

            for (let i = 0; i < WIDTH; i++) {
                const idx = j * WIDTH + i;
                
                // Safely handle y-direction terms with proper boundary conditions
                let bottom = j <= 0 ? currentConcentrationData[idx] : currentConcentrationData[(j-1) * WIDTH + i]; 
                let top = j >= HEIGHT-1 ? currentConcentrationData[idx] : currentConcentrationData[(j+1) * WIDTH + i]; 
          
                d[i] = alpha*bottom + (1 - 2*alpha)*currentConcentrationData[idx] + alpha*top + (sources[idx] - sinks[idx]) * deltaT / 2;
            }

            // Boundary conditions for Thomas algorithm
            b[0] = 1 + alpha;
            b[WIDTH-1] = 1 + alpha;
            a[0] = 0;
            c[WIDTH-1] = 0;
            
            
            // Get the solution for this row
            const rowSolution = thomasAlgorithm(a, b, c, d, WIDTH);
            
            // Copy the row solution to the appropriate row in intermediateConcentration
            for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[j * WIDTH + i] = rowSolution[i];
            }
        }

   /*      // Apply Neumann boundary conditions to the intermediate concentration
        for (let i = 0; i < WIDTH; i++) {
            // Copy from first interior row to boundary for zero gradient
            intermediateConcentration[i] = intermediateConcentration[WIDTH + i]; 
            // Copy from last interior row to boundary for zero gradient
            intermediateConcentration[(HEIGHT-1) * WIDTH + i] = intermediateConcentration[(HEIGHT-2) * WIDTH + i]; 
        }
        for (let j = 0; j < HEIGHT; j++) {
            // Copy from first interior column to boundary for zero gradient  
            intermediateConcentration[j * WIDTH] = intermediateConcentration[j * WIDTH + 1];
            // Copy from last interior column to boundary for zero gradient
            intermediateConcentration[j * WIDTH + (WIDTH-1)] = intermediateConcentration[j * WIDTH + (WIDTH-2)];
        } */
        
        // Second half-step: explicit in x-direction, implicit in y-direction
        for (let i = 0; i < WIDTH; i++) {
            const a = Float32Array.from({length: HEIGHT}, () => -alpha);
            const b = Float32Array.from({length: HEIGHT}, () => 1 + 2*alpha);
            const c = Float32Array.from({length: HEIGHT}, () => -alpha);
            const d = new Float32Array(HEIGHT);

            for (let j = 0; j < HEIGHT; j++) {
                const idx = j * WIDTH + i;
                
                // Safely handle x-direction terms with proper boundary conditions
                let right = i >= WIDTH-1 ? intermediateConcentration[j * WIDTH + i] : intermediateConcentration[j * WIDTH + (i+1)]; 
                let left = i <= 0 ? intermediateConcentration[j * WIDTH + i] : intermediateConcentration[j * WIDTH + (i-1)]; 
              
                d[j] = alpha*left + (1 - 2*alpha)*intermediateConcentration[idx] + alpha*right + (sources[idx] - sinks[idx]) * deltaT / 2;
            }
            
            // Boundary conditions for Thomas algorithm
            b[0] = 1 + alpha;
            b[HEIGHT-1] = 1 + alpha;
            a[0] = 0;
            c[HEIGHT-1] = 0;
            
            // Get the solution for this column
            const columnSolution = thomasAlgorithm(a, b, c, d, HEIGHT);
            
            // Copy the column solution to the appropriate column in finalConcentration
            for (let j = 0; j < HEIGHT; j++) {
                finalConcentration[j * WIDTH + i] = columnSolution[j];
            }
        }

   /*      // Apply Neumann boundary conditions to the final concentration
        for (let j = 0; j < HEIGHT; j++) {
            // Copy from first interior column to boundary
            finalConcentration[j * WIDTH] = finalConcentration[j * WIDTH + 1];
            // Copy from last interior column to boundary
            finalConcentration[j * WIDTH + (WIDTH-1)] = finalConcentration[j * WIDTH + (WIDTH-2)];
        }
        for (let i = 0; i < WIDTH; i++) {
            // Copy from first interior row to boundary
            finalConcentration[i] = finalConcentration[WIDTH + i]; 
            // Copy from last interior row to boundary
            finalConcentration[(HEIGHT-1) * WIDTH + i] = finalConcentration[(HEIGHT-2) * WIDTH + i]; 
        } */

        // Update the current concentration data with the final concentration
        currentConcentrationData.set(finalConcentration);
        
        // Check for numerical issues after each iteration (optional but safer)
        // checkForUnexpectedValues(finalConcentration, `finalConcentration-iter${iteration}`);
    }
    
    // Final validation check
    checkForUnexpectedValues(finalConcentration, 'finalConcentration');
    
    return currentConcentrationData;
};