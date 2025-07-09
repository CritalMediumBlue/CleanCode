import { initADIArrays } from './initArrays.js';

 const WIDTH = 100; // Width of the grid
 const HEIGHT = 60; // Height of the grid
 const DIFFUSION_RATE = 100; // Diffusion rate
 const deltaX = 1; // Spatial step size in micrometers
 const deltaT = 0.115; // Time step size in seconds
    
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
        scaledSources
        
    } = initADIArrays(WIDTH, HEIGHT, DIFFUSION_RATE, deltaX, deltaT); // width, height, diffusion rate, deltaX, deltaT


export const ADI = (
    concentrationData,
    sources, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
   
    for (let idx = 0; idx < WIDTH * HEIGHT; idx++) {  
        scaledSources[idx] = sources[idx] * halfDeltaT;
    }
   
    // Thomas algorithm constants
    const tolerance = 1e-10;

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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (scaledSources[idx]) ;
            }

            // Inline Thomas Algorithm for WIDTH dimension
            // Forward elimination
            let pivot = b1[0];
            if (Math.abs(pivot) < tolerance) {
                pivot = (pivot >= 0) ? tolerance : -tolerance;
            }
            const invPivot = 1.0 / pivot;
            modifiedUpperDiagonal1[0] = c1[0] * invPivot;
            modifiedRightHandSide1[0] = d1[0] * invPivot;

            for (let k = 1; k < WIDTH; k++) {
                const l_k = a1[k];
                const u_prime_prev = modifiedUpperDiagonal1[k-1];
                const d_prime_prev = modifiedRightHandSide1[k-1];

                let currentDenominator = b1[k] - l_k * u_prime_prev;
                if (Math.abs(currentDenominator) < tolerance) {
                    currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
                }
                const invDenominator = 1.0 / currentDenominator;

                modifiedUpperDiagonal1[k] = c1[k] * invDenominator;
                modifiedRightHandSide1[k] = (d1[k] - l_k * d_prime_prev) * invDenominator;
            }

            // Back substitution
            solution1[WIDTH-1] = modifiedRightHandSide1[WIDTH-1];
            for (let k = WIDTH - 2; k >= 0; k--) {
                solution1[k] = modifiedRightHandSide1[k] - modifiedUpperDiagonal1[k] * solution1[k+1];
            }
            
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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (scaledSources[idx] ) ;
        }
        // Inline Thomas Algorithm for WIDTH dimension (BOTTOM POINTS)
        // Forward elimination
        let pivot1 = b1[0];
        if (Math.abs(pivot1) < tolerance) {
            pivot1 = (pivot1 >= 0) ? tolerance : -tolerance;
        }
        const invPivot1 = 1.0 / pivot1;
        modifiedUpperDiagonal1[0] = c1[0] * invPivot1;
        modifiedRightHandSide1[0] = d1[0] * invPivot1;

        for (let k = 1; k < WIDTH; k++) {
            const l_k = a1[k];
            const u_prime_prev = modifiedUpperDiagonal1[k-1];
            const d_prime_prev = modifiedRightHandSide1[k-1];

            let currentDenominator = b1[k] - l_k * u_prime_prev;
            if (Math.abs(currentDenominator) < tolerance) {
                currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
            }
            const invDenominator = 1.0 / currentDenominator;

            modifiedUpperDiagonal1[k] = c1[k] * invDenominator;
            modifiedRightHandSide1[k] = (d1[k] - l_k * d_prime_prev) * invDenominator;
        }

        // Back substitution
        solution1[WIDTH-1] = modifiedRightHandSide1[WIDTH-1];
        for (let k = WIDTH - 2; k >= 0; k--) {
            solution1[k] = modifiedRightHandSide1[k] - modifiedUpperDiagonal1[k] * solution1[k+1];
        }
        
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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (scaledSources[idx] ) ;
        }
        // Inline Thomas Algorithm for WIDTH dimension (TOP POINTS)
        // Forward elimination
        let pivot2 = b1[0];
        if (Math.abs(pivot2) < tolerance) {
            pivot2 = (pivot2 >= 0) ? tolerance : -tolerance;
        }
        const invPivot2 = 1.0 / pivot2;
        modifiedUpperDiagonal1[0] = c1[0] * invPivot2;
        modifiedRightHandSide1[0] = d1[0] * invPivot2;

        for (let k = 1; k < WIDTH; k++) {
            const l_k = a1[k];
            const u_prime_prev = modifiedUpperDiagonal1[k-1];
            const d_prime_prev = modifiedRightHandSide1[k-1];

            let currentDenominator = b1[k] - l_k * u_prime_prev;
            if (Math.abs(currentDenominator) < tolerance) {
                currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
            }
            const invDenominator = 1.0 / currentDenominator;

            modifiedUpperDiagonal1[k] = c1[k] * invDenominator;
            modifiedRightHandSide1[k] = (d1[k] - l_k * d_prime_prev) * invDenominator;
        }

        // Back substitution
        solution1[WIDTH-1] = modifiedRightHandSide1[WIDTH-1];
        for (let k = WIDTH - 2; k >= 0; k--) {
            solution1[k] = modifiedRightHandSide1[k] - modifiedUpperDiagonal1[k] * solution1[k+1];
        }
        
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
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (scaledSources[idx]) ;
            }
            
            // Inline Thomas Algorithm for HEIGHT dimension (INTERIOR POINTS)
            // Forward elimination
            let pivot3 = b2[0];
            if (Math.abs(pivot3) < tolerance) {
                pivot3 = (pivot3 >= 0) ? tolerance : -tolerance;
            }
            const invPivot3 = 1.0 / pivot3;
            modifiedUpperDiagonal2[0] = c2[0] * invPivot3;
            modifiedRightHandSide2[0] = d2[0] * invPivot3;

            for (let k = 1; k < HEIGHT; k++) {
                const l_k = a2[k];
                const u_prime_prev = modifiedUpperDiagonal2[k-1];
                const d_prime_prev = modifiedRightHandSide2[k-1];

                let currentDenominator = b2[k] - l_k * u_prime_prev;
                if (Math.abs(currentDenominator) < tolerance) {
                    currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
                }
                const invDenominator = 1.0 / currentDenominator;

                modifiedUpperDiagonal2[k] = c2[k] * invDenominator;
                modifiedRightHandSide2[k] = (d2[k] - l_k * d_prime_prev) * invDenominator;
            }

            // Back substitution
            solution2[HEIGHT-1] = modifiedRightHandSide2[HEIGHT-1];
            for (let k = HEIGHT - 2; k >= 0; k--) {
                solution2[k] = modifiedRightHandSide2[k] - modifiedUpperDiagonal2[k] * solution2[k+1];
            }
            
             for (let j = 0; j < HEIGHT; j++) {
                const pos = j * WIDTH + i
                currentConcentrationData[pos] = solution2[j];
       
            }
        }

        // LEFT POINTS i = 0
           for (let j = 0; j < HEIGHT; j++) {
                const rowOffset = j * WIDTH;
                const idx = rowOffset;


                const center = intermediateConcentration[idx];
                const right = intermediateConcentration[j * WIDTH + (1)]; 
                const left = center; 
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (scaledSources[idx] ) ;
            }
            // Inline Thomas Algorithm for HEIGHT dimension (LEFT POINTS)
            // Forward elimination
            let pivot4 = b2[0];
            if (Math.abs(pivot4) < tolerance) {
                pivot4 = (pivot4 >= 0) ? tolerance : -tolerance;
            }
            const invPivot4 = 1.0 / pivot4;
            modifiedUpperDiagonal2[0] = c2[0] * invPivot4;
            modifiedRightHandSide2[0] = d2[0] * invPivot4;

            for (let k = 1; k < HEIGHT; k++) {
                const l_k = a2[k];
                const u_prime_prev = modifiedUpperDiagonal2[k-1];
                const d_prime_prev = modifiedRightHandSide2[k-1];

                let currentDenominator = b2[k] - l_k * u_prime_prev;
                if (Math.abs(currentDenominator) < tolerance) {
                    currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
                }
                const invDenominator = 1.0 / currentDenominator;

                modifiedUpperDiagonal2[k] = c2[k] * invDenominator;
                modifiedRightHandSide2[k] = (d2[k] - l_k * d_prime_prev) * invDenominator;
            }

            // Back substitution
            solution2[HEIGHT-1] = modifiedRightHandSide2[HEIGHT-1];
            for (let k = HEIGHT - 2; k >= 0; k--) {
                solution2[k] = modifiedRightHandSide2[k] - modifiedUpperDiagonal2[k] * solution2[k+1];
            }
            
             for (let j = 0; j < HEIGHT; j++) {
                currentConcentrationData[j * WIDTH] = solution2[j];
            
            }



        // RIGHT POINTS i = WIDTH-1
        for (let j = 0; j < HEIGHT; j++) {
                const rowOffset = j * WIDTH;
                const idx = rowOffset + (WIDTH - 1);

                const center = intermediateConcentration[idx];
                const right = center;
                const left = intermediateConcentration[j * WIDTH + (WIDTH - 2)];

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (scaledSources[idx] ) ;
        }
        // Inline Thomas Algorithm for HEIGHT dimension (RIGHT POINTS)
        // Forward elimination
        let pivot5 = b2[0];
        if (Math.abs(pivot5) < tolerance) {
            pivot5 = (pivot5 >= 0) ? tolerance : -tolerance;
        }
        const invPivot5 = 1.0 / pivot5;
        modifiedUpperDiagonal2[0] = c2[0] * invPivot5;
        modifiedRightHandSide2[0] = d2[0] * invPivot5;

        for (let k = 1; k < HEIGHT; k++) {
            const l_k = a2[k];
            const u_prime_prev = modifiedUpperDiagonal2[k-1];
            const d_prime_prev = modifiedRightHandSide2[k-1];

            let currentDenominator = b2[k] - l_k * u_prime_prev;
            if (Math.abs(currentDenominator) < tolerance) {
                currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
            }
            const invDenominator = 1.0 / currentDenominator;

            modifiedUpperDiagonal2[k] = c2[k] * invDenominator;
            modifiedRightHandSide2[k] = (d2[k] - l_k * d_prime_prev) * invDenominator;
        }

        // Back substitution
        solution2[HEIGHT-1] = modifiedRightHandSide2[HEIGHT-1];
        for (let k = HEIGHT - 2; k >= 0; k--) {
            solution2[k] = modifiedRightHandSide2[k] - modifiedUpperDiagonal2[k] * solution2[k+1];
        }
        
         for (let j = 0; j < HEIGHT; j++) {
            currentConcentrationData[j * WIDTH + (WIDTH - 1)] = solution2[j];
            if (solution2[j] < 0) {
                console.warn("Negative concentrations!!")
            }
       
        }


    }

    
    return currentConcentrationData;
};
