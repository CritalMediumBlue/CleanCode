
import { thomasAlgorithm } from './thomasAlgorithm.js';

// Constants moved outside for clarity and potential reuse
const WIDTH = 100;
const HEIGHT = 60;
const GRID_SIZE = WIDTH * HEIGHT;

// Pre-allocated arrays for reuse across multiple calls
const preallocatedArrays = {
  modUpperDiag: new Float64Array(Math.max(WIDTH, HEIGHT)),
  modRightSide: new Float64Array(Math.max(WIDTH, HEIGHT)),
  solutionArray: new Float64Array(Math.max(WIDTH, HEIGHT)),
  a_width: new Float64Array(WIDTH),
  b_width: new Float64Array(WIDTH),
  c_width: new Float64Array(WIDTH),
  d_width: new Float64Array(WIDTH),
  a_height: new Float64Array(HEIGHT),
  b_height: new Float64Array(HEIGHT),
  c_height: new Float64Array(HEIGHT),
  d_height: new Float64Array(HEIGHT),
  intermediateConcentration: new Float64Array(GRID_SIZE)
};

// Initialize diagonal arrays (only done once)
const initializeDiagonals = () => {
  // Initialize for WIDTH
  for (let i = 0; i < WIDTH; i++) {
    preallocatedArrays.a_width[i] = -1; // Will be multiplied by alpha later
    preallocatedArrays.b_width[i] = 2;  // Will be adjusted later
    preallocatedArrays.c_width[i] = -1; // Will be multiplied by alpha later
  }
  preallocatedArrays.a_width[0] = 0;
  preallocatedArrays.c_width[WIDTH - 1] = 0;
  
  // Initialize for HEIGHT
  for (let i = 0; i < HEIGHT; i++) {
    preallocatedArrays.a_height[i] = -1; // Will be multiplied by alpha later
    preallocatedArrays.b_height[i] = 2;  // Will be adjusted later
    preallocatedArrays.c_height[i] = -1; // Will be multiplied by alpha later
  }
  preallocatedArrays.a_height[0] = 0;
  preallocatedArrays.c_height[HEIGHT - 1] = 0;
};

// Call this once when your application starts
initializeDiagonals();

export const ADI = (
    concentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    // Create a copy of the input data or reuse the original if appropriate
    const currentConcentrationData = new Float64Array(concentrationData);
    
    // Reuse pre-allocated arrays
    const {
      modUpperDiag, modRightSide, solutionArray,
      a_width, b_width, c_width, d_width,
      a_height, b_height, c_height, d_height,
      intermediateConcentration
    } = preallocatedArrays;
    
    const alpha = DIFFUSION_RATE * deltaT / (2 * deltaX * deltaX);
    const totalNumberOfIterations = Math.round(timeLapse / deltaT);
    
    // Scale the diagonal arrays by alpha (only need to do this once per ADI call)
    for (let i = 0; i < WIDTH; i++) {
      a_width[i] = i === 0 ? 0 : -alpha;
      b_width[i] = i === 0 || i === WIDTH - 1 ? 1 + alpha : 1 + 2 * alpha;
      c_width[i] = i === WIDTH - 1 ? 0 : -alpha;
    }
    
    for (let i = 0; i < HEIGHT; i++) {
      a_height[i] = i === 0 ? 0 : -alpha;
      b_height[i] = i === 0 || i === HEIGHT - 1 ? 1 + alpha : 1 + 2 * alpha;
      c_height[i] = i === HEIGHT - 1 ? 0 : -alpha;
    }

    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) { 
        // First half-step (rows)
        for (let j = 0; j < HEIGHT; j++) {
            const rowOffset = j * WIDTH;
            
            for (let i = 0; i < WIDTH; i++) {
                const idx = rowOffset + i;
                
                // Handle y-direction terms with pre-computed boundary conditions
                const bottom = j <= 0 ? currentConcentrationData[idx] : currentConcentrationData[idx - WIDTH]; 
                const top = j >= HEIGHT-1 ? currentConcentrationData[idx] : currentConcentrationData[idx + WIDTH]; 
          
                d_width[i] = alpha * bottom + (1 - 2 * alpha) * currentConcentrationData[idx] + 
                           alpha * top + (sources[idx] - sinks[idx]) * deltaT / 2;
            }

            thomasAlgorithm(a_width, b_width, c_width, d_width, WIDTH, modUpperDiag, modRightSide, solutionArray);
            
            // Store intermediate results
            for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[rowOffset + i] = solutionArray[i];
            }
        }

        // Second half-step (columns)
        for (let i = 0; i < WIDTH; i++) {
            for (let j = 0; j < HEIGHT; j++) {
                const idx = j * WIDTH + i;
                
                const left = i <= 0 ? intermediateConcentration[idx] : intermediateConcentration[idx - 1]; 
                const right = i >= WIDTH-1 ? intermediateConcentration[idx] : intermediateConcentration[idx + 1]; 
              
                d_height[j] = alpha * left + (1 - 2 * alpha) * intermediateConcentration[idx] + 
                            alpha * right + (sources[idx] - sinks[idx]) * deltaT / 2;
            }
            
            thomasAlgorithm(a_height, b_height, c_height, d_height, HEIGHT, modUpperDiag, modRightSide, solutionArray);
            
            // Update final results
            for (let j = 0; j < HEIGHT; j++) {
                const idx = j * WIDTH + i;
                currentConcentrationData[idx] = Math.max(0, solutionArray[j]); // Avoid negative values
            }
        }
    }
    
    return currentConcentrationData;
};





export const FTCS = (
    concentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    const WIDTH = 100;
    const HEIGHT = 60;
    const n = WIDTH * HEIGHT;

    const maxDeltaT =0.05* deltaX * deltaX / (4 * DIFFUSION_RATE); // Time step based on stability condition
    
    const totalNumberOfIterations = Math.round(timeLapse / maxDeltaT); // Number of iterations required to cover the time lapse
    const currentConcentrationData = new Float64Array(concentrationData);
    const newConcentrationData = new Float64Array(n);


    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) { 
       

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
            if (newConcentrationData[idx] < 0) {
                newConcentrationData[idx] = 0; // Ensure concentration doesn't go negative
                console.warn("Concentration went negative at FTCS");

            }
        }
        }

        for (let idx = 0; idx < n; idx++) {
            currentConcentrationData[idx] = newConcentrationData[idx];
        }
    }
    
    return currentConcentrationData;
};

