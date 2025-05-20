import { thomasAlgorithm } from './thomasAlgorithm';


describe('Thomas Algorithm', () => {
   const tolerance = 1e-15;
    
    test('solves a large system similar to diffusion for the x axis', () => {
        const n = 100;
        const alpha = 1;

        const lowerDiagonal = new Float64Array(n).fill(-alpha);
        const mainDiagonal = new Float64Array(n).fill(1 + 2 * alpha);
        const upperDiagonal = new Float64Array(n).fill(-alpha);
        
        lowerDiagonal[0] = 0; // First element of lower diagonal
        upperDiagonal[n - 1] = 0; // Last element of upper diagonal
        mainDiagonal[0] = 1 + alpha; // First element of main diagonal
        mainDiagonal[n - 1] = 1 + alpha; // Last element of main diagonal


        // Calculate right hand side for known solution
        const knownSolution = new Float64Array(n);
        for (let i = 0; i < n; i++) {
            knownSolution[i] = Math.sin(i *2* Math.PI / (n - 1))+Math.random();
        }
        const rightHandSide = new Float64Array(n);
        
        rightHandSide[0] = mainDiagonal[0] * knownSolution[0] + upperDiagonal[0] * knownSolution[1];
        
        for (let i = 1; i < n - 1; i++) {
            rightHandSide[i] = lowerDiagonal[i] * knownSolution[i-1] + 
                                                 mainDiagonal[i] * knownSolution[i] + 
                                                 upperDiagonal[i] * knownSolution[i+1];
        }
        
        rightHandSide[n-1] = lowerDiagonal[n-1] * knownSolution[n-2] + 
                                                 mainDiagonal[n-1] * knownSolution[n-1];
        
        const solution = thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n);
        
        // Check if the solution matches the expected values
        for (let i = 0; i < n; i++) {
            expect(Math.abs(solution[i] - knownSolution[i])).toBeLessThan(tolerance);
        }
    });
      
    test('solves a large system similar to diffusion for the y axis ', () => {
        const n = 60;
        const alpha = 0.5;

        const lowerDiagonal = new Float64Array(n).fill(-alpha);
        const mainDiagonal = new Float64Array(n).fill(1 + 2 * alpha);
        const upperDiagonal = new Float64Array(n).fill(-alpha);
        
        lowerDiagonal[0] = 0; // First element of lower diagonal
        upperDiagonal[n - 1] = 0; // Last element of upper diagonal
        mainDiagonal[0] = 1 + alpha; // First element of main diagonal
        mainDiagonal[n - 1] = 1 + alpha; // Last element of main diagonal


        // Calculate right hand side for known solution
        const knownSolution = new Float64Array(n);
        for (let i = 0; i < n; i++) {
            knownSolution[i] = Math.sin(i *2* Math.PI / (n - 1))+Math.random();
        }
        const rightHandSide = new Float64Array(n);
        
        rightHandSide[0] = mainDiagonal[0] * knownSolution[0] + upperDiagonal[0] * knownSolution[1];
        
        for (let i = 1; i < n - 1; i++) {
            rightHandSide[i] = lowerDiagonal[i] * knownSolution[i-1] + 
                                                 mainDiagonal[i] * knownSolution[i] + 
                                                 upperDiagonal[i] * knownSolution[i+1];
        }
        
        rightHandSide[n-1] = lowerDiagonal[n-1] * knownSolution[n-2] + 
                                                 mainDiagonal[n-1] * knownSolution[n-1];
        
        const solution = thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n);
        
        // Check if the solution matches the expected values
        for (let i = 0; i < n; i++) {
            expect(Math.abs(solution[i] - knownSolution[i])).toBeLessThan(tolerance);
        }
    });
});