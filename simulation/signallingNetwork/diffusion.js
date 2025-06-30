
import { thomasAlgorithm } from './thomasAlgorithm.js';

const generateDiagonals = (length, alpha) => {
    const a = new Float64Array(length).fill(-alpha);
    const b = new Float64Array(length).fill(1 + 2 * alpha);
    const c = new Float64Array(length).fill(-alpha);
    const d = new Float64Array(length);
    b[0] = 1 + alpha; 
    b[length - 1] = 1 + alpha; 
    a[0] = 0; 
    c[length - 1] = 0; 
    return { a, b, c, d };
};

export const initADIArrays = (WIDTH, HEIGHT, DIFFUSION_RATE, deltaX, deltaT) => {
   
    const modifiedUpperDiagonal1 = new Float64Array(WIDTH);
    const modifiedRightHandSide1 = new Float64Array(WIDTH);
    const solution1 = new Float64Array(WIDTH);
    const modifiedUpperDiagonal2 = new Float64Array(HEIGHT);
    const modifiedRightHandSide2 = new Float64Array(HEIGHT);
    const solution2 = new Float64Array(HEIGHT);
    
    const intermediateConcentration = new Float64Array(WIDTH * HEIGHT);
    
    
    const alpha = DIFFUSION_RATE * deltaT / (2 * deltaX * deltaX);  

    const {a: a1, b: b1, c: c1, d: d1} = generateDiagonals(WIDTH, alpha);
    const {a: a2, b: b2, c: c2, d: d2} = generateDiagonals(HEIGHT, alpha);
    const halfDeltaT = deltaT / 2;
    const oneMinus2Alpha = 1 - 2 * alpha;
    console.log("ADI arrays initialized");

    return {
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
        oneMinus2Alpha
    };
    
}


let adiArraysCache = null;

export const ADI = (
    concentrationData,
    sources, sinks, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
    const WIDTH = 100;
    const HEIGHT = 60;
    
    // Initialize arrays once and reuse them across function calls
    if (!adiArraysCache ) {
        adiArraysCache = initADIArrays(WIDTH, HEIGHT, DIFFUSION_RATE, deltaX, deltaT);
    }
    
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
        oneMinus2Alpha
    } = adiArraysCache;

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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (sources[idx] - sinks[idx]) * halfDeltaT;
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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (sources[idx] - sinks[idx]) * halfDeltaT;
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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (sources[idx] - sinks[idx]) * halfDeltaT;
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
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (sources[idx] - sinks[idx]) * halfDeltaT;
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
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (sources[idx] - sinks[idx]) * halfDeltaT;
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

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (sources[idx] - sinks[idx]) * halfDeltaT;
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

