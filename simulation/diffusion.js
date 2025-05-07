/**
 * utils.js
 * 
 * Utility functions for numerical computations and algorithms.
 */

/**
 * Solves a tridiagonal system of linear equations using the Thomas algorithm.
 * 
 * The Thomas algorithm (also known as the tridiagonal matrix algorithm) is an
 * efficient form of Gaussian elimination specialized for tridiagonal systems.
 * It solves systems of the form:
 * 
 * b₀x₀ + c₀x₁             = d₀
 * a₁x₀ + b₁x₁ + c₁x₂      = d₁
 * a₂x₁ + b₂x₂ + c₂x₃      = d₂
 * ...
 * aₙ₋₁xₙ₋₂ + bₙ₋₁xₙ₋₁     = dₙ₋₁
 * 
 * The algorithm has two phases:
 * 1. Forward elimination: Transforms the system into an upper triangular form
 * 2. Back substitution: Solves the transformed system from bottom to top
 * 
 * Time complexity: O(n) where n is the system size
 * Space complexity: O(n) for the temporary arrays
 * 
 * @param {Float32Array} lowerDiagonal - The lower diagonal elements (a)
 * @param {Float32Array} mainDiagonal - The main diagonal elements (b)
 * @param {Float32Array} upperDiagonal - The upper diagonal elements (c)
 * @param {Float32Array} rightHandSide - The right-hand side vector (d)
 * @param {Float32Array} solution - The solution vector (x) to be filled
 * @param {number} systemSize - The size of the system (n)
 * @returns {void} - The solution is written to the solution parameter
 */
export function thomasAlgorithm(
    lowerDiagonal,
    mainDiagonal,
    upperDiagonal,
    rightHandSide,
    solution,
    systemSize
) {
    // Create temporary arrays to avoid modifying the input arrays
    // These arrays store the modified coefficients during forward elimination
    const modifiedUpperDiagonal = new Float32Array(systemSize);
    const modifiedRightHandSide = new Float32Array(systemSize);
    
    // ====================================================================
    // PHASE 1: Forward Elimination
    // ====================================================================
    // This phase eliminates the lower diagonal elements and modifies the
    // upper diagonal and right-hand side accordingly
    
    // Process the first row
    // For numerical stability, ensure we don't divide by zero or very small numbers
    const firstPivot = Math.abs(mainDiagonal[0]) < 1e-10 ? 1e-10 : mainDiagonal[0];
    modifiedUpperDiagonal[0] = upperDiagonal[0] / firstPivot;
    modifiedRightHandSide[0] = rightHandSide[0] / firstPivot;
    
    // Process rows 1 to n-1
    for (let i = 1; i < systemSize; i++) {
        // Calculate the denominator: b'ᵢ = bᵢ - aᵢ * c'ᵢ₋₁
        // This represents the pivot element after elimination
        const denominator = mainDiagonal[i] - lowerDiagonal[i] * modifiedUpperDiagonal[i-1];
        
        // Ensure numerical stability by avoiding division by very small numbers
        // If the denominator is close to zero, use a small value instead
        const pivotInverse = 1.0 / (Math.abs(denominator) < 1e-10 ? 1e-10 : denominator);
        
        // Calculate the modified upper diagonal: c'ᵢ = cᵢ / b'ᵢ
        modifiedUpperDiagonal[i] = upperDiagonal[i] * pivotInverse;
        
        // Calculate the modified right-hand side: d'ᵢ = (dᵢ - aᵢ * d'ᵢ₋₁) / b'ᵢ
        modifiedRightHandSide[i] = (rightHandSide[i] - lowerDiagonal[i] * modifiedRightHandSide[i-1]) * pivotInverse;
    }
    
    // ====================================================================
    // PHASE 2: Back Substitution
    // ====================================================================
    // This phase solves the transformed system from bottom to top
    
    // The last element of the solution is directly given by the modified right-hand side
    solution[systemSize-1] = modifiedRightHandSide[systemSize-1];
    
    // Solve for the remaining elements from the second-to-last to the first
    for (let i = systemSize - 2; i >= 0; i--) {
        // Calculate xᵢ = d'ᵢ - c'ᵢ * xᵢ₊₁
        solution[i] = modifiedRightHandSide[i] - modifiedUpperDiagonal[i] * solution[i+1];
    }
}

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



export const ADI = ( 
    currentConcentrationData,
    sources, sinks,deltaX, deltaT, timeLapse, DIFFUSION_RATE ) => {

     const WIDTH = 100;
     const HEIGHT = 60;
    
    // Temporary arrays for the ADI method
    const a = new Float32Array(Math.max(WIDTH, HEIGHT)); // Lower diagonal
    const b = new Float32Array(Math.max(WIDTH, HEIGHT)); // Main diagonal
    const c = new Float32Array(Math.max(WIDTH, HEIGHT)); // Upper diagonal
    const d = new Float32Array(Math.max(WIDTH, HEIGHT)); // Right-hand side
    const x = new Float32Array(Math.max(WIDTH, HEIGHT)); // Solution vector
    
    // Intermediate array to store results after the first half-step
    const intermediateData = new Float32Array(WIDTH * HEIGHT);
    const nextConcentrationData = new Float32Array(WIDTH * HEIGHT);
    
    // Check for NaN values in current concentration data and replace with safe values
    checkForUnexpectedValues(currentConcentrationData, 'currentConcentrationData');
    
    // Apply sources and sinks before diffusion
    for (let i = 0; i < WIDTH*HEIGHT; i++) {
        currentConcentrationData[i] += sources[i]*0.1 - (sinks[i]*currentConcentrationData[i])/(2+currentConcentrationData[i]);
    }
    
    // Calculate coefficients for the ADI method
    // Using the same diffusion rate as the explicit method for consistency
    const timeStep = deltaT * (60/1); // Convert to seconds
    //diffusion rate is in micrometers^2/s
    //deltaX is in micrometers
    //deltaT is in seconds

    const alpha = DIFFUSION_RATE*timeStep/(2*deltaX*deltaX); // non-dimensional diffusion coefficient
    
    // First half-step: implicit in x-direction, explicit in y-direction
    for (let j = 1; j < HEIGHT - 1; j++) {
        // Set up the tridiagonal system for this row
        for (let i = 1; i < WIDTH - 1; i++) {
            a[i] = -alpha;
            b[i] = 1 + 2*alpha;
            c[i] = -alpha;
            
            // Calculate the right-hand side using explicit method in y-direction
            const idx = j * WIDTH + i;
            const term_y = alpha * (
                currentConcentrationData[(j-1) * WIDTH + i] - 
                2 * currentConcentrationData[idx] + 
                currentConcentrationData[(j+1) * WIDTH + i]
            );
            
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
            );
            
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
    
    return nextConcentrationData;
};

