
import { thomasAlgorithm } from './thomasAlgorithm.js';
//this is a 2D Alternating Direction Implicit (ADI) method for simulating diffusion (heat equation) 
export const ADI = (
    currentConcentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    const WIDTH = 100;
    const HEIGHT = 60;
    
    let intermediateConcentration = new Float64Array(WIDTH * HEIGHT);
    
    const alpha = DIFFUSION_RATE * deltaT / (2 * deltaX * deltaX);  //non-dimensional factor
    const totalNumberOfIterations = Math.round(timeLapse / deltaT); // Number of iterations required to cover the time lapse
    

    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) { 
       
        // First half-step
        let { a, b, c, d } = generateDiagonals(WIDTH, alpha);
            
        for (let j = 0; j < HEIGHT; j++) {
            for (let i = 0; i < WIDTH; i++) {
                const idx = j * WIDTH + i;
                
                // Handle y-direction terms with proper Neumann boundary conditions
                let bottom = j <= 0 ? currentConcentrationData[idx] : currentConcentrationData[(j-1) * WIDTH + i]; 
                let top = j >= HEIGHT-1 ? currentConcentrationData[idx] : currentConcentrationData[(j+1) * WIDTH + i]; 
          
                d[i] = alpha*bottom + (1 - 2*alpha)*currentConcentrationData[idx] + alpha*top + (sources[idx] - sinks[idx]) * deltaT / 2;
            }

            
            // Get the solution for this row
            const rowSolution = thomasAlgorithm(a, b, c, d, WIDTH);
            
            for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[j * WIDTH + i] = rowSolution[i];
            }
        }

        

        // Second half-step
        ({ a, b, c, d } = generateDiagonals(HEIGHT, alpha));
        
        for (let i = 0; i < WIDTH; i++) {
            
            for (let j = 0; j < HEIGHT; j++) {
                const idx = j * WIDTH + i;
                
                // Handle x-direction terms with proper Neumann boundary conditions
                let right = i >= WIDTH-1 ? intermediateConcentration[idx] : intermediateConcentration[j * WIDTH + (i+1)]; 
                let left = i <= 0 ? intermediateConcentration[idx] : intermediateConcentration[j * WIDTH + (i-1)]; 
              
                d[j] = alpha*left + (1 - 2*alpha)*intermediateConcentration[idx] + alpha*right + (sources[idx] - sinks[idx]) * deltaT / 2;
            }
            
            const columnSolution = thomasAlgorithm(a, b, c, d, HEIGHT);
            
            for (let j = 0; j < HEIGHT; j++) {
                currentConcentrationData[j * WIDTH + i] = columnSolution[j];
            }
        }
    }
    
    return currentConcentrationData;
};

const generateDiagonals = (length, alpha) => {
    const a = new Float64Array(length).fill(-alpha);
    const b = new Float64Array(length).fill(1 + 2 * alpha);
    const c = new Float64Array(length).fill(-alpha);
    const d = new Float64Array(length);
    b[0] = 1 + alpha; // Neumann boundary condition. Ghost cell has the same value as the first cell
    b[length - 1] = 1 + alpha; // Neumann boundary condition. Ghost cell has the same value as the last cell
    a[0] = 0; // We don't need to solve for the ghost cell since we know its value is the same as the first cell
    c[length - 1] = 0; // We don't need to solve for the ghost cell since we know its value is the same as the last cell
    return { a, b, c, d };
};



export const FTCS = (
    currentConcentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    const WIDTH = 100;
    const HEIGHT = 60;

    const maxDeltaT =0.5* deltaX * deltaX / (4 * DIFFUSION_RATE); // Time step based on stability condition
    
    const totalNumberOfIterations = Math.round(timeLapse / maxDeltaT); // Number of iterations required to cover the time lapse
    

    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) { 
       
      const newConcentrationData = new Float64Array(WIDTH * HEIGHT);

        for (let j = 0; j < HEIGHT; j++) {
            for (let i = 0; i < WIDTH; i++) {
            const idx = j * WIDTH + i;
            
            // Handle x-direction terms with proper Neumann boundary conditions
            let right = i >= WIDTH-1 ? currentConcentrationData[idx] : currentConcentrationData[j * WIDTH + (i+1)]; 
            let left = i <= 0 ? currentConcentrationData[idx] : currentConcentrationData[j * WIDTH + (i-1)]; 
            
            // Handle y-direction terms with proper Neumann boundary conditions
            let bottom = j <= 0 ? currentConcentrationData[idx] : currentConcentrationData[(j-1) * WIDTH + i]; 
            let top = j >= HEIGHT-1 ? currentConcentrationData[idx] : currentConcentrationData[(j+1) * WIDTH + i]; 
            
            newConcentrationData[idx] = currentConcentrationData[idx] + DIFFUSION_RATE * maxDeltaT / (deltaX * deltaX) * (left + right + bottom + top - 4 * currentConcentrationData[idx]) + (sources[idx] - sinks[idx]) * maxDeltaT;
            }
        }

        // Update the concentration data for the next iteration
        currentConcentrationData = newConcentrationData;
    }
    
    return currentConcentrationData;
};

