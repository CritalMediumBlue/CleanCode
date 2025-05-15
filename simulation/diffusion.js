import { thomasAlgorithm, checkForUnexpectedValues } from './thomasAlgorithm.js';


export const ADI = ( 
    currentConcentrationData,
    sources, sinks,deltaX, deltaT, DIFFUSION_RATE ) => {

     const WIDTH = 100;
     const HEIGHT = 60;
    
    const a = new Float32Array(Math.max(WIDTH, HEIGHT)); // Lower diagonal
    const b = new Float32Array(Math.max(WIDTH, HEIGHT)); // Main diagonal
    const c = new Float32Array(Math.max(WIDTH, HEIGHT)); // Upper diagonal
    const d = new Float32Array(Math.max(WIDTH, HEIGHT)); // Right-hand side
    const x = new Float32Array(Math.max(WIDTH, HEIGHT)); // Solution vector
    
    const intermediateData = new Float32Array(WIDTH * HEIGHT);
    const finalConcentrationData = new Float32Array(WIDTH * HEIGHT);
    
    checkForUnexpectedValues(currentConcentrationData, 'currentConcentrationData');
    
 

    

    const alpha = DIFFUSION_RATE*deltaT/(2*deltaX*deltaX); 
    
    for (let j = 1; j < HEIGHT - 1; j++) {

        for (let i = 1; i < WIDTH - 1; i++) {
            a[i] = -alpha;
            b[i] = 1 + 2*alpha;
            c[i] = -alpha;
            
            const idx = j * WIDTH + i;
            const term_y = alpha * (
                currentConcentrationData[(j-1) * WIDTH + i] - 
                2 * currentConcentrationData[idx] + 
                currentConcentrationData[(j+1) * WIDTH + i]
            ) + (sources[idx] - sinks[idx])*deltaT/2;
            
            d[i] = currentConcentrationData[idx] + term_y;
            
            // Check for NaN in right-hand side
            checkForUnexpectedValues(d, 'right-hand side');
        }
        
        // Apply boundary conditions for the x-direction
        // Left boundary (reflective)
        b[1] = b[1] + a[1]; // Absorb the coefficient for the ghost point
        a[1] = 0;
        
        // Right boundary (reflective)
        b[WIDTH-2] = b[WIDTH-2] + c[WIDTH-2]; // Absorb the coefficient for the ghost point
        c[WIDTH-2] = 0;
        
        // Solve the tridiagonal system for this row
        thomasAlgorithm(a, b, c, d, x, WIDTH-1);
        
        // Store the results in the intermediate array
        for (let i = 1; i < WIDTH - 1; i++) {
            intermediateData[j * WIDTH + i] = x[i];
        }
    }
    
    // Apply boundary conditions to the intermediate data
    // Top and bottom boundaries (copy from adjacent interior points)
    for (let i = 0; i < WIDTH; i++) {
        intermediateData[i] = intermediateData[WIDTH + i]; // Top boundary
        intermediateData[(HEIGHT-1) * WIDTH + i] = intermediateData[(HEIGHT-2) * WIDTH + i]; // Bottom boundary
    }
    
    // Left and right boundaries (copy from adjacent interior points)
    for (let j = 0; j < HEIGHT; j++) {
        intermediateData[j * WIDTH] = intermediateData[j * WIDTH + 1]; // Left boundary
        intermediateData[j * WIDTH + WIDTH - 1] = intermediateData[j * WIDTH + WIDTH - 2]; // Right boundary
    }
    
    // Check for NaN values in intermediate data and replace with safe values
    checkForUnexpectedValues(intermediateData, 'intermediateData');
    
    // Second half-step: explicit in x-direction, implicit in y-direction
    for (let i = 1; i < WIDTH - 1; i++) {
        // Set up the tridiagonal system for this column
        for (let j = 1; j < HEIGHT - 1; j++) {
            a[j] = -alpha;
            b[j] = 1 + 2*alpha;
            c[j] = -alpha;
            
            // Calculate the right-hand side using explicit method in x-direction
            const idx = j * WIDTH + i;
            const term_x = alpha * (
                intermediateData[j * WIDTH + (i-1)] - 
                2 * intermediateData[idx] + 
                intermediateData[j * WIDTH + (i+1)]
            ) + (sources[idx] - sinks[idx])*deltaT/2;
            
            d[j] = intermediateData[idx] + term_x;
            
            // Check for NaN in right-hand side
            checkForUnexpectedValues(d, 'right-hand side');
        }
        
        // Apply boundary conditions for the y-direction
        // Top boundary (reflective)
        b[1] = b[1] + a[1]; // Absorb the coefficient for the ghost point
        a[1] = 0;
        
        // Bottom boundary (reflective)
        b[HEIGHT-2] = b[HEIGHT-2] + c[HEIGHT-2]; // Absorb the coefficient for the ghost point
        c[HEIGHT-2] = 0;
        
        // Solve the tridiagonal system for this column
        thomasAlgorithm(a, b, c, d, x, HEIGHT-1);
        
        // Store the results in the next concentration data array
        for (let j = 1; j < HEIGHT - 1; j++) {
            finalConcentrationData[j * WIDTH + i] = x[j];
        }
    }
    
    // Apply boundary conditions to the final data
    // Top and bottom boundaries (copy from adjacent interior points)
    for (let i = 0; i < WIDTH; i++) {
        finalConcentrationData[i] = finalConcentrationData[WIDTH + i]; // Top boundary
        finalConcentrationData[(HEIGHT-1) * WIDTH + i] = finalConcentrationData[(HEIGHT-2) * WIDTH + i]; // Bottom boundary
    }
    
    // Left and right boundaries (copy from adjacent interior points)
    for (let j = 0; j < HEIGHT; j++) {
        finalConcentrationData[j * WIDTH] = finalConcentrationData[j * WIDTH + 1]; // Left boundary
        finalConcentrationData[j * WIDTH + WIDTH - 1] = finalConcentrationData[j * WIDTH + WIDTH - 2]; // Right boundary
    }
    
    // Check for NaN values in next concentration data and replace with safe values
    checkForUnexpectedValues(finalConcentrationData, 'finalConcentrationData');
    
    return finalConcentrationData;
};

