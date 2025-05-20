export function thomasAlgorithm(
    lowerDiagonal,
    mainDiagonal,
    upperDiagonal,
    rightHandSide,
    n
) {
    const tolerance = 1e-10;
    const modifiedUpperDiagonal = new Float64Array(n);
    const modifiedRightHandSide = new Float64Array(n);
   
    const firstPivot = Math.abs(mainDiagonal[0]) < tolerance 
        ? Math.sign(mainDiagonal[0])*tolerance 
        : mainDiagonal[0];
    modifiedUpperDiagonal[0] = upperDiagonal[0] / firstPivot;
    modifiedRightHandSide[0] = rightHandSide[0] / firstPivot;
    
    for (let i = 1; i < n; i++) {  
        const denominator = mainDiagonal[i] - lowerDiagonal[i] * modifiedUpperDiagonal[i-1];
        const safeDenominator = Math.abs(denominator) < tolerance 
            ? Math.sign(denominator) * tolerance 
            : denominator;
        modifiedUpperDiagonal[i] = upperDiagonal[i] / safeDenominator;
        modifiedRightHandSide[i] = (rightHandSide[i] - lowerDiagonal[i] * modifiedRightHandSide[i-1]) / safeDenominator;
    }
    const solution = new Float64Array(n);
    solution[n-1] = modifiedRightHandSide[n-1];
    
    for (let i = n - 2; i >= 0; i--) {
        solution[i] = modifiedRightHandSide[i] - modifiedUpperDiagonal[i] * solution[i+1];
    }
    

    return solution;
}
