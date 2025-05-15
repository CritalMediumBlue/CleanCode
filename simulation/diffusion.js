import { thomasAlgorithm } from './thomasAlgorithm.js';
const checkForUnexpectedValues = (array, name) => {
    for (let i = 0; i < array.length; i++) {
        if (isNaN(array[i]) || array[i] === null || array[i] === undefined || 
            array[i] == Infinity || array[i] == -Infinity ||
            array[i] > 1e2 ) {
            console.warn(`Unexpected value detected in ${name} at index ${i}`);
            array[i] = 0.0; // Replace with a safe value
        }
    }
}
const scaleSS = 0.005
const WIDTH = 100;
const HEIGHT = 60;
export const ADI = ( 
    currentConcentrationData,
    sources, sinks,deltaX, deltaT, DIFFUSION_RATE, timeLapse ) => {

    const timeStep = deltaT //seconds
    const alpha = DIFFUSION_RATE*timeStep/(2*deltaX*deltaX); // non-dimensional diffusion coefficient
    const nextConcentrationData = new Float32Array(WIDTH * HEIGHT);
    const originalConcentrationData = new Float32Array(WIDTH * HEIGHT);
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        originalConcentrationData[i] = currentConcentrationData[i];
    }
    const iterations = Math.round(timeLapse / timeStep); // Number of iterations

    for (let i = 0; i < iterations; i++) {
        
   
    // Temporary arrays for the ADI method
    let a = new Float32Array(WIDTH-1); // Lower diagonal
    let b = new Float32Array(WIDTH); // Main diagonal
    let c = new Float32Array(WIDTH-1); // Upper diagonal
    let d = new Float32Array(WIDTH); // Right-hand side
    let x = new Float32Array(WIDTH); // Solution vector


    
    // Intermediate array to store results after the first half-step
    const intermediateData = new Float32Array(WIDTH * HEIGHT);
    
    // Check for NaN values in current concentration data and replace with safe values
    checkForUnexpectedValues(currentConcentrationData, 'currentConcentrationData');
 
    
    // First half-step: implicit in x-direction, explicit in y-direction
    for (let j = 0; j < HEIGHT ; j++) {
        // Set up the tridiagonal system for this row
        //console.log('j', j) //this prints from 0 to 59 inclusive

        const middleRow = currentConcentrationData.slice((j) * WIDTH, (j + 1) * WIDTH);
        let lowerRow, upperRow;

        if (j > 0 && j < HEIGHT - 1) {
         lowerRow = currentConcentrationData.slice((j - 1) * WIDTH, (j) * WIDTH);
         upperRow = currentConcentrationData.slice((j + 1) * WIDTH, (j + 2) * WIDTH);
        } else if (j == 0) {
         lowerRow = middleRow;
         upperRow = currentConcentrationData.slice((j + 1) * WIDTH, (j + 2) * WIDTH);
        } else if (j == HEIGHT-1 ) {
         lowerRow = currentConcentrationData.slice((j - 1) * WIDTH, (j) * WIDTH);
         upperRow = middleRow;
        }
        
        for (let i = 1; i < WIDTH - 1; i++) {

            const idx = j * WIDTH + i;
            a[i] = -alpha;
            b[i] = 1 + 2*alpha;
            c[i] = -alpha;
            
            // Calculate the right-hand side using explicit method in y-direction
            const term_y = alpha * (
                lowerRow[i] - 
                2 * middleRow[i] +
                upperRow[i]
            ) + scaleSS*(sources[idx] - sinks[idx])*timeStep / 2;
            
            d[i] = middleRow[i] + term_y;
            
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
    


    a = new Float32Array(HEIGHT-1); // Lower diagonal
    b = new Float32Array(HEIGHT); // Main diagonal
    c = new Float32Array(HEIGHT-1); // Upper diagonal
    d = new Float32Array(HEIGHT); // Right-hand side
    x = new Float32Array(HEIGHT); // Solution vector


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
            ) + scaleSS*(sources[idx] - sinks[idx])*timeStep / 2;
            
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
            nextConcentrationData[j * WIDTH + i] = x[j];
        }
    }
    
    // Apply boundary conditions to the final data
    // Top and bottom boundaries (copy from adjacent interior points)
    for (let i = 0; i < WIDTH; i++) {
        nextConcentrationData[i] = nextConcentrationData[WIDTH + i]; // Top boundary
        nextConcentrationData[(HEIGHT-1) * WIDTH + i] = nextConcentrationData[(HEIGHT-2) * WIDTH + i]; // Bottom boundary
    }
    
    // Left and right boundaries (copy from adjacent interior points)
    for (let j = 0; j < HEIGHT; j++) {
        nextConcentrationData[j * WIDTH] = nextConcentrationData[j * WIDTH + 1]; // Left boundary
        nextConcentrationData[j * WIDTH + WIDTH - 1] = nextConcentrationData[j * WIDTH + WIDTH - 2]; // Right boundary
    }
    
    // Check for NaN values in next concentration data and replace with safe values
    checkForUnexpectedValues(nextConcentrationData, 'nextConcentrationData');

    //swap the original and next concentration data
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        currentConcentrationData[i] = nextConcentrationData[i];
    }

    }
    
    return nextConcentrationData;
};


const checkError = (nextConcentrationData, originalConcentrationData) => {
    let error = 0;
    for (let i = 0; i < nextConcentrationData.length; i++) {
        error += Math.abs(nextConcentrationData[i] - originalConcentrationData[i]);
    }
    error /= nextConcentrationData.length;
    return error;
}
