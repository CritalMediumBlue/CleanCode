export function thomasAlgorithm(
    lowerDiagonal,
    mainDiagonal,
    upperDiagonal,
    rightHandSide,
    n,
    modifiedUpperDiagonal,
    modifiedRightHandSide,
    solution
) {
    const tolerance = 1e-10;

    let pivot = mainDiagonal[0];
    if (Math.abs(pivot) < tolerance) {
     
        pivot = (pivot >= 0) ? tolerance : -tolerance;
    }
    const invPivot = 1.0 / pivot; 

    modifiedUpperDiagonal[0] = upperDiagonal[0] * invPivot;
    modifiedRightHandSide[0] = rightHandSide[0] * invPivot;

    for (let i = 1; i < n; i++) {
        const l_i = lowerDiagonal[i]; 
        const u_prime_prev = modifiedUpperDiagonal[i-1]; 
        const d_prime_prev = modifiedRightHandSide[i-1]; 

        let currentDenominator = mainDiagonal[i] - l_i * u_prime_prev;

        if (Math.abs(currentDenominator) < tolerance) {
            currentDenominator = (currentDenominator >= 0) ? tolerance : -tolerance;
        }
        const invDenominator = 1.0 / currentDenominator; 

        modifiedUpperDiagonal[i] = upperDiagonal[i] * invDenominator;
        modifiedRightHandSide[i] = (rightHandSide[i] - l_i * d_prime_prev) * invDenominator;
    }

    solution[n-1] = modifiedRightHandSide[n-1];
    for (let i = n - 2; i >= 0; i--) {
        solution[i] = modifiedRightHandSide[i] - modifiedUpperDiagonal[i] * solution[i+1];
    }

}