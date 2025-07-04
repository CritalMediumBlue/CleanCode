// Utility functions for ADI method and diagonals generation

export const generateDiagonals = (length, alpha) => {
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
        oneMinus2Alpha,
    };
};
