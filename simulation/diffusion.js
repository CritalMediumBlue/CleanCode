import { thomasAlgorithm, checkForUnexpectedValues } from './thomasAlgorithm.js';


export const ADI = ( 
    currentConcentrationData,
    sources, sinks,deltaX, deltaT, DIFFUSION_RATE ) => {

     const WIDTH = 100;
     const HEIGHT = 60;
    

    
    const intermediateConcentration = new Float32Array(WIDTH * HEIGHT);
    const finalConcentration = new Float32Array(WIDTH * HEIGHT);
    
    const alpha = DIFFUSION_RATE*deltaT/(2*deltaX*deltaX); 
    
    for (let j = 1; j < HEIGHT - 1; j++) {

    const a = new Float32Array(WIDTH-1); // Lower diagonal
    const b = new Float32Array(WIDTH-1); // Main diagonal
    const c = new Float32Array(WIDTH-1); // Upper diagonal
    const d = new Float32Array(WIDTH-1); // Right-hand side
    const x = new Float32Array(WIDTH-1); // Solution vector

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
            
        }
        
        
        b[1] = b[1] + a[1]; 
        a[1] = 0;
        
        b[WIDTH-2] = b[WIDTH-2] + c[WIDTH-2]; 
        c[WIDTH-2] = 0;
        
        thomasAlgorithm(a, b, c, d, x, WIDTH-1);
        
        for (let i = 1; i < WIDTH - 1; i++) {
            intermediateConcentration[j * WIDTH + i] = x[i];
        }
    }
    
    
    for (let i = 0; i < WIDTH; i++) {
        intermediateConcentration[i] = intermediateConcentration[WIDTH + i]; // Top boundary
        intermediateConcentration[(HEIGHT-1) * WIDTH + i] = intermediateConcentration[(HEIGHT-2) * WIDTH + i]; // Bottom boundary
    }
    
    for (let j = 0; j < HEIGHT; j++) {
        intermediateConcentration[j * WIDTH] = intermediateConcentration[j * WIDTH + 1]; // Left boundary
        intermediateConcentration[j * WIDTH + WIDTH - 1] = intermediateConcentration[j * WIDTH + WIDTH - 2]; // Right boundary
    }
    
    checkForUnexpectedValues(intermediateConcentration, 'intermediateConcentration');
    


    // Second half-step: explicit in x-direction, implicit in y-direction
    for (let i = 1; i < WIDTH - 1; i++) {
        const a = new Float32Array(HEIGHT-1); // Lower diagonal
        const b = new Float32Array(HEIGHT-1); // Main diagonal
        const c = new Float32Array(HEIGHT-1); // Upper diagonal
        const d = new Float32Array(HEIGHT-1); // Right-hand side
        const x = new Float32Array(HEIGHT-1); // Solution vector


        for (let j = 1; j < HEIGHT - 1; j++) {
            a[j] = -alpha;
            b[j] = 1 + 2*alpha;
            c[j] = -alpha;
            
            const idx = j * WIDTH + i;
            const term_x = alpha * (
                intermediateConcentration[j * WIDTH + (i-1)] - 
                2 * intermediateConcentration[idx] + 
                intermediateConcentration[j * WIDTH + (i+1)]
            ) + (sources[idx] - sinks[idx])*deltaT/2;
            
            d[j] = intermediateConcentration[idx] + term_x;
            
        }
        
       
        b[1] = b[1] + a[1]; 
        a[1] = 0;
        
        // Bottom boundary (reflective)
        b[HEIGHT-2] = b[HEIGHT-2] + c[HEIGHT-2]; 
        c[HEIGHT-2] = 0;
        
        thomasAlgorithm(a, b, c, d, x, HEIGHT-1);
        
        for (let j = 1; j < HEIGHT - 1; j++) {
            finalConcentration[j * WIDTH + i] = x[j];
        }
    }
    
   
    for (let i = 0; i < WIDTH; i++) {
        finalConcentration[i] = finalConcentration[WIDTH + i]; // Top boundary
        finalConcentration[(HEIGHT-1) * WIDTH + i] = finalConcentration[(HEIGHT-2) * WIDTH + i]; // Bottom boundary
    }
    
    // Left and right boundaries (copy from adjacent interior points)
    for (let j = 0; j < HEIGHT; j++) {
        finalConcentration[j * WIDTH] = finalConcentration[j * WIDTH + 1]; // Left boundary
        finalConcentration[j * WIDTH + WIDTH - 1] = finalConcentration[j * WIDTH + WIDTH - 2]; // Right boundary
    }
    
    checkForUnexpectedValues(finalConcentration, 'finalConcentration');
    
    return finalConcentration;
};

