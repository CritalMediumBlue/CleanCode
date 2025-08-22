import { thomasAlgorithm } from './thomasAlgorithm.js';
import { initADIArrays } from './initArrays.js';

 const WIDTH = 100; // Width of the grid
 const HEIGHT = 60; // Height of the grid
 const DIFFUSION_RATE = 40.0101; // Diffusion rate
 const deltaX = 1; // Spatial step size in micrometers
 const deltaT = 0.28; // Time step size in seconds
    
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

//let maxSource=0;
export const ADI = (
    concentrationData,
    sources, deltaX, deltaT, DIFFUSION_RATE, timeLapse
) => {
   
    for (let idx = 0; idx < WIDTH * HEIGHT; idx++) {  // Fix: remove -1
        scaledSources[idx] = sources[idx] * halfDeltaT;
/*         if (Math.abs(sources[idx])>maxSource){
            maxSource=Math.abs(sources[idx])
            console.log(maxSource)
        } */
    }
   


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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (scaledSources[idx] ) ;
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
                
                d1[i] = alpha*bottom + (oneMinus2Alpha)*center + alpha*top + (scaledSources[idx] ) ;
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
                

                d2[j] = alpha*left + (oneMinus2Alpha)*center + alpha*right + (scaledSources[idx]) ;
            }
            
            thomasAlgorithm(a2, b2, c2, d2, HEIGHT, modifiedUpperDiagonal2, modifiedRightHandSide2, solution2);
            
             for (let j = 0; j < HEIGHT; j++) {
                const pos = j * WIDTH + i
                if(solution2[j]<= 0){
                console.log("negative extracellular concentration ")
            }
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
            thomasAlgorithm(a2, b2, c2, d2, HEIGHT, modifiedUpperDiagonal2, modifiedRightHandSide2, solution2);
            
             for (let j = 0; j < HEIGHT; j++) {
                if(solution2[j]<= 0){
                console.log("negative extracellular concentration ")
            }
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
        thomasAlgorithm(a2, b2, c2, d2, HEIGHT, modifiedUpperDiagonal2, modifiedRightHandSide2, solution2);
         for (let j = 0; j < HEIGHT; j++) {
            if(solution2[j]<= 0){
                console.log("negative extracellular concentration !!")
            }
            currentConcentrationData[j * WIDTH + (WIDTH - 1)] = solution2[j];
       
        } 


    }

    
    return currentConcentrationData;
};


