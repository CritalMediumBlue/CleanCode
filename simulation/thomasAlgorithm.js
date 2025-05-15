export function thomasAlgorithm(
    lowerDiagonal,
    mainDiagonal,
    upperDiagonal,
    rightHandSide,
    solution,
    systemSize
) {
    
    const modifiedUpperDiagonal = new Float32Array(systemSize);
    const modifiedRightHandSide = new Float32Array(systemSize);
    
    const firstPivot = Math.abs(mainDiagonal[0]) < 1e-10 ? 1e-10 : mainDiagonal[0];
    modifiedUpperDiagonal[0] = upperDiagonal[0] / firstPivot;
    modifiedRightHandSide[0] = rightHandSide[0] / firstPivot;
    
    for (let i = 1; i < systemSize; i++) {
        
        const denominator = mainDiagonal[i] - lowerDiagonal[i] * modifiedUpperDiagonal[i-1];
     
        const pivotInverse = 1.0 / (Math.abs(denominator) < 1e-10 ? 1e-10 : denominator);
        
        modifiedUpperDiagonal[i] = upperDiagonal[i] * pivotInverse;
        
        modifiedRightHandSide[i] = (rightHandSide[i] - lowerDiagonal[i] * modifiedRightHandSide[i-1]) * pivotInverse;
    }
    
  
    solution[systemSize-1] = modifiedRightHandSide[systemSize-1];
    
    for (let i = systemSize - 2; i >= 0; i--) {
        solution[i] = modifiedRightHandSide[i] - modifiedUpperDiagonal[i] * solution[i+1];
    }
}

export const checkForUnexpectedValues = (array, name) => {
    for (let i = 0; i < array.length; i++) {
        if (isNaN(array[i]) || array[i] === null || array[i] === undefined || 
            array[i] == Infinity || array[i] == -Infinity ||
            array[i] > 1e2 ) {
            console.warn(`Unexpected value detected in ${name} at index ${i}`);
            array[i] = 0.0; // Replace with a safe value
        }
    }
}

