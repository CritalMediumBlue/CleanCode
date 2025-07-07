import { thomasAlgorithm } from './extracellular/thomasAlgorithm';


describe('Thomas Algorithm', () => {
   const tolerance = 1e-11;
    
    test('solves a large system similar to diffusion for the x axis', () => {
        const n = 100;
        const alpha = 1;

        const modUpperDiag = new Float64Array(n);
        const modRightSide = new Float64Array(n);
        const solutionArray = new Float64Array(n);

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
        
        thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n, modUpperDiag, modRightSide, solutionArray);
        
        // Check if the solution matches the expected values
        for (let i = 0; i < n; i++) {
            expect(Math.abs(solutionArray[i] - knownSolution[i])).toBeLessThan(tolerance);
        }
    });
      
    test('solves a large system similar to diffusion for the y axis ', () => {
        const n = 60;
        const alpha = 0.5;

        const lowerDiagonal = new Float64Array(n).fill(-alpha);
        const mainDiagonal = new Float64Array(n).fill(1 + 2 * alpha);
        const upperDiagonal = new Float64Array(n).fill(-alpha);
        const modUpperDiag = new Float64Array(n);
        const modRightSide = new Float64Array(n);
        const solutionArray = new Float64Array(n);
        
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
        
        thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n, modUpperDiag, modRightSide, solutionArray);
        
        // Check if the solution matches the expected values
        for (let i = 0; i < n; i++) {
            expect(Math.abs(solutionArray[i] - knownSolution[i])).toBeLessThan(tolerance);
        }
    });
        test('solves a simple tridiagonal system with known analytical solution', () => {
        const n = 5;
        
        const lowerDiagonal = [0,-1,-1,-1,-3];
        const mainDiagonal =  [2,2,2,2,4]
        const upperDiagonal = [-1,-1,-1,-1,0];
        const rightHandSide = [3,1,25,8,2]
        const modUpperDiag = new Float64Array(n);
        const modRightSide = new Float64Array(n);
        const solutionArray = new Float64Array(n);

        const exactSolution = [23.25, 43.5, 62.75, 57.0, 43.25];
        
        
        thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n, modUpperDiag, modRightSide, solutionArray);
        
        // The analytical solution is x²
        for (let i = 0; i < n; i++) {
            expect(Math.abs(solutionArray[i] - exactSolution[i])).toBeLessThan(tolerance);
        }
    });
});