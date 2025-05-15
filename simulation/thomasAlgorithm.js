export function thomasAlgorithm(
    lowerDiagonal,
    mainDiagonal,
    upperDiagonal,
    rightHandSide,
    solution,
    n
) {
    if (lowerDiagonal.length !== n) {
        throw new Error(`lowerDiagonal must have length ${n}, got ${lowerDiagonal?.length}`);
    }
    if (mainDiagonal.length !== n) {
        throw new Error(`mainDiagonal must have length ${n}, got ${mainDiagonal?.length}`);
    }
    if (upperDiagonal.length !== n) {
        throw new Error(`upperDiagonal must have length ${n}, got ${upperDiagonal?.length}`);
    }
    if (rightHandSide.length !== n) {
        throw new Error(`rightHandSide must have length ${n}, got ${rightHandSide?.length}`);
    }
    if (solution.length !== n) {
        throw new Error(`solution must have length ${n}, got ${solution?.length}`);
    }

    if (Math.abs(lowerDiagonal[0]) !== 0) {
        console.warn("First element of lowerDiagonal should be 0 for a proper tridiagonal system");
        lowerDiagonal[0] = 0; 
    }
    
    if (Math.abs(upperDiagonal[n-1]) !== 0) {
        console.warn("Last element of upperDiagonal should be 0 for a proper tridiagonal system");
        upperDiagonal[n-1] = 0; 
    }
    
    const modifiedUpperDiagonal = new Float32Array(n);
    const modifiedRightHandSide = new Float32Array(n);
    
    const firstPivot = Math.abs(mainDiagonal[0]) < 1e-6 ? 1e-6 : mainDiagonal[0];
    modifiedUpperDiagonal[0] = upperDiagonal[0] / firstPivot;
    modifiedRightHandSide[0] = rightHandSide[0] / firstPivot;
    
    for (let i = 1; i < n; i++) {  
        const denominator = mainDiagonal[i] - lowerDiagonal[i] * modifiedUpperDiagonal[i-1];
        const safeDenominator = Math.abs(denominator) < 1e-6 
            ? Math.sign(denominator) * 1e-6 
            : denominator;
        modifiedUpperDiagonal[i] = upperDiagonal[i] / safeDenominator;
        modifiedRightHandSide[i] = (rightHandSide[i] - lowerDiagonal[i] * modifiedRightHandSide[i-1]) / safeDenominator;
    }
    
    solution[n-1] = modifiedRightHandSide[n-1];
    
    for (let i = n - 2; i >= 0; i--) {
        solution[i] = modifiedRightHandSide[i] - modifiedUpperDiagonal[i] * solution[i+1];
    }
    
    // Check for numerical issues in the final solution
    checkForUnexpectedValues(solution, "solution");
}

export const checkForUnexpectedValues = (array, name) => {
    for (let i = 0; i < array.length; i++) {
        if (isNaN(array[i]) || array[i] === null || array[i] === undefined || 
            array[i] == Infinity || array[i] == -Infinity ||
            array[i] > 1e2 ) {
            console.warn(`Unexpected value detected in ${name} at index ${i}`);
            array[i] = 0.0; 
        }
    }
}

