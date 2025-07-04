import { thomasAlgorithm } from './thomasAlgorithm.js';
import { initADIArrays } from './utils.js';

 const WIDTH = 100; // Width of the grid
 const HEIGHT = 60; // Height of the grid
 const DIFFUSION_RATE = 100; // Diffusion rate
 const deltaX = 1; // Spatial step size in micrometers
 const deltaT = 0.1; // Time step size in seconds
    
    const {
        modifiedUpperDiagonal1,
        modifiedRightHandSide1,
        solution1,
        modifiedUpperDiagonal2,
        modifiedRightHandSide2,
        solution2,
        intermediateConcentration,
        a1, b1, c1, d1,
        a2, b2, c2, d2,
        alpha,
        halfDeltaT,
        oneMinus2Alpha,
        
    } = initADIArrays(WIDTH, HEIGHT, DIFFUSION_RATE, deltaX, deltaT); // width, height, diffusion rate, deltaX, deltaT

export const ADI = (
    concentrationData,
    sources, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {


    const totalNumberOfIterations = Math.round(timeLapse / deltaT); 

    const currentConcentrationData = concentrationData;

    for (let iteration = 0; iteration < totalNumberOfIterations; iteration++) { 
       
        /////////////-----  FIRST HALF-STEP  -----/////////////

        // INTERIOR POINTS
        for (let j = 1; j < HEIGHT-1; j++) {
            const rowOffset = j * WIDTH;
            for (let i = 0; i < WIDTH; i++) {
                const idx = rowOffset + i;
                
                const center = currentConcentrationData[idx];
                const bottom =  currentConcentrationData[(j-1) * WIDTH + i]; 
                const top = currentConcentrationData[(j+1) * WIDTH + i]; 
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (sources[idx]) * halfDeltaT;
            }

            thomasAlgorithm(a1, b1, c1, d1, WIDTH, modifiedUpperDiagonal1, modifiedRightHandSide1, solution1);
            
            for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[rowOffset + i] = solution1[i];
            }
        }


        // BOTTOM POINTS j = 0
        const rowOffsetBot = 0 * WIDTH;
        for (let i = 0; i < WIDTH; i++) {
                const idx = rowOffsetBot + i;
                
                const center = currentConcentrationData[idx];
                const bottom = center;
                const top = currentConcentrationData[(1) * WIDTH + i]; 
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (sources[idx] ) * halfDeltaT;
        }
        thomasAlgorithm(a1, b1, c1, d1, WIDTH, modifiedUpperDiagonal1, modifiedRightHandSide1, solution1);
        for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[rowOffsetBot + i] = solution1[i];
        }


        // TOP POINTS j = HEIGHT-1
        const rowOffsetTop = (HEIGHT - 1) * WIDTH;
        for (let i = 0; i < WIDTH; i++) {
                const idx = rowOffsetTop + i;
                
                const center = currentConcentrationData[idx];
                const bottom =  currentConcentrationData[(HEIGHT-2) * WIDTH + i]; 
                const top = center; 
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (sources[idx] ) * halfDeltaT;
        }
        thomasAlgorithm(a1, b1, c1, d1, WIDTH, modifiedUpperDiagonal1, modifiedRightHandSide1, solution1);
        for (let i = 0; i < WIDTH; i++) {
                intermediateConcentration[rowOffsetTop + i] = solution1[i];
        }



        /////////////-----  SECOND HALF-STEP  -----/////////////
        // INTERIOR POINTS
        for (let i = 1; i < WIDTH-1; i++) {
            
            for (let j = 0; j < HEIGHT; j++) {
                const rowOffset = j * WIDTH;
                const idx = rowOffset + i;


                const center = intermediateConcentration[idx];
                const right = i >= WIDTH-1 ? center : intermediateConcentration[j * WIDTH + (i+1)]; 
                const left = i <= 0 ? center : intermediateConcentration[j * WIDTH + (i-1)]; 
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (sources[idx]) * halfDeltaT;
            }
            
            thomasAlgorithm(a2, b2, c2, d2, HEIGHT, modifiedUpperDiagonal2, modifiedRightHandSide2, solution2);
            
             for (let j = 0; j < HEIGHT; j++) {
                currentConcentrationData[j * WIDTH + i] = solution2[j];
                 if (currentConcentrationData[j * WIDTH + i] < 0) {
                    currentConcentrationData[j * WIDTH + i] = 0; 
                    console.warn("Concentration went negative at ADI");
                } 
            } 
        }

        // LEFT POINTS i = 0
           for (let j = 0; j < HEIGHT; j++) {
                const rowOffset = j * WIDTH;
                const idx = rowOffset;


                const center = intermediateConcentration[idx];
                const right = intermediateConcentration[j * WIDTH + (1)]; 
                const left = center; 
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (sources[idx] ) * halfDeltaT;
            }
            thomasAlgorithm(a2, b2, c2, d2, HEIGHT, modifiedUpperDiagonal2, modifiedRightHandSide2, solution2);
            
             for (let j = 0; j < HEIGHT; j++) {
                currentConcentrationData[j * WIDTH] = solution2[j];
                 if (currentConcentrationData[j * WIDTH] < 0) {
                    currentConcentrationData[j * WIDTH] = 0; 
                    console.warn("Concentration went negative at ADI");
                } 
            } 



        // RIGHT POINTS i = WIDTH-1
        for (let j = 0; j < HEIGHT; j++) {
                const rowOffset = j * WIDTH;
                const idx = rowOffset + (WIDTH - 1);

                const center = intermediateConcentration[idx];
                const right = center;
                const left = intermediateConcentration[j * WIDTH + (WIDTH - 2)];

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (sources[idx] ) * halfDeltaT;
        }
        thomasAlgorithm(a2, b2, c2, d2, HEIGHT, modifiedUpperDiagonal2, modifiedRightHandSide2, solution2);
         for (let j = 0; j < HEIGHT; j++) {
            currentConcentrationData[j * WIDTH + (WIDTH - 1)] = solution2[j];
             if (currentConcentrationData[j * WIDTH + (WIDTH - 1)] < 0) {
                currentConcentrationData[j * WIDTH + (WIDTH - 1)] = 0; 
                console.warn("Concentration went negative at ADI");
            } 
        } 


    }

    
    return currentConcentrationData;
};





export const FTCS = (
    concentrationData,
    sources,  deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    
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
            
            newConcentrationData[idx] = currentConcentrationData[idx] + DIFFUSION_RATE * maxDeltaT / (deltaX * deltaX) * (left + right + bottom + top - 4 * currentConcentrationData[idx]) + (sources[idx]) * maxDeltaT;
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

