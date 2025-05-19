import { thomasAlgorithm } from './thomasAlgorithm';

// filepath: simulation/thomasAlgorithm.test.js

describe('Thomas Algorithm', () => {
    test('solves a simple 3x3 tridiagonal system', () => {
        // 2x - y = 1
        // -x + 2y - z = 0
        // -y + 2z = 1
        // Expected solution: x=1, y=1, z=1
        
        const lowerDiagonal = new Float32Array([0, -1, -1]);
        const mainDiagonal = new Float32Array([2, 2, 2]);
        const upperDiagonal = new Float32Array([-1, -1, 0]);
        const rightHandSide = new Float32Array([1, 0, 1]);
        const n = 3;
        
        const solution = thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n);
        
        // Check solution with some tolerance for floating-point arithmetic
        expect(Math.abs(solution[0] - 1.0)).toBeLessThan(1e-5);
        expect(Math.abs(solution[1] - 1.0)).toBeLessThan(1e-5);
        expect(Math.abs(solution[2] - 1.0)).toBeLessThan(1e-5);
    });
    
    test('handles near-zero values in main diagonal', () => {
        const lowerDiagonal = new Float32Array([0, 0.5]);
        const mainDiagonal = new Float32Array([1e-6, 1.0]);
        const upperDiagonal = new Float32Array([0.5, 0]);
        const rightHandSide = new Float32Array([1.0, 2.0]);
        const n = 2;
        
        const solution = thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n);
        
        // The function should handle the small pivot value and still produce a result
        expect(solution).toHaveLength(2);
        expect(Number.isFinite(solution[0])).toBe(true);
        expect(Number.isFinite(solution[1])).toBe(true);
    });
    
    test('solves a larger 5x5 system', () => {
        // Set up a system where the solution is [1, 2, 3, 4, 5]
        const n = 5;
        const lowerDiagonal = new Float32Array([0, -1, -1, -1, -1]);
        const mainDiagonal = new Float32Array([2, 2, 2, 2, 2]);
        const upperDiagonal = new Float32Array([-1, -1, -1, -1, 0]);
        
        // Calculate right hand side for known solution
        const knownSolution = [1, 2, 3, 4, 5];
        const rightHandSide = new Float32Array(n);
        
        // First equation: 2x₁ - x₂ = a₁ → a₁ = 2(1) - 2 = 0
        rightHandSide[0] = mainDiagonal[0] * knownSolution[0] + upperDiagonal[0] * knownSolution[1];
        
        // Middle equations: -xᵢ₋₁ + 2xᵢ - xᵢ₊₁ = aᵢ
        for (let i = 1; i < n - 1; i++) {
            rightHandSide[i] = lowerDiagonal[i] * knownSolution[i-1] + 
                                                 mainDiagonal[i] * knownSolution[i] + 
                                                 upperDiagonal[i] * knownSolution[i+1];
        }
        
        // Last equation: -x_{n-2} + 2x_{n-1} = a_{n-1}
        rightHandSide[n-1] = lowerDiagonal[n-1] * knownSolution[n-2] + 
                                                 mainDiagonal[n-1] * knownSolution[n-1];
        
        const solution = thomasAlgorithm(lowerDiagonal, mainDiagonal, upperDiagonal, rightHandSide, n);
        
        // Check if the solution matches the expected values
        for (let i = 0; i < n; i++) {
            expect(Math.abs(solution[i] - knownSolution[i])).toBeLessThan(1e-5);
        }
    });
});