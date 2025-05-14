/**
 * Mesh.js - Handles the creation and updating of 3D meshes representing simulation data
 * 
 * This module provides functions for creating, setting up, and updating a surface mesh
 * that visualizes concentration data in 3D space with both height and color mapping.
 */

// Grid dimensions, initialized when createMesh is called
let WIDTH;
let HEIGHT; 

/**
 * Creates a wireframe mesh for representing simulation data
 * 
 * @param {Object} THREE - Three.js library object
 * @param {Object} GRID - Grid configuration containing WIDTH and HEIGHT properties
 * @returns {Object} - The created surface mesh
 */
function createMesh(THREE, GRID) {
    WIDTH = GRID.WIDTH;
    HEIGHT = GRID.HEIGHT;

    const geometry = new THREE.PlaneGeometry(
        WIDTH-1, 
        HEIGHT-1, 
        WIDTH -1, 
        HEIGHT -1
    ); // width, height, widthSegments, heightSegments
    
    const material = new THREE.MeshBasicMaterial({
        //wireframe: true, 
        vertexColors: true,
        side: THREE.DoubleSide,
    });

    // Initialize the color attribute buffer before creating the mesh
    // The size is num_vertices * 3 (r, g, b per vertex)
    const numVertices = WIDTH * HEIGHT;
    const initialColors = new Float32Array(numVertices * 3); // Initialize with zeros
    geometry.setAttribute('color', new THREE.BufferAttribute(initialColors, 3)); // Add color attribute

    const surfaceMesh = new THREE.Mesh(geometry, material);
    return surfaceMesh;
}

/**
 * Sets up the mesh in the 3D scene
 * 
 * @param {Object} stage - The stage object containing the scene
 * @param {Object} THREE - Three.js library object
 * @param {Object} GRID - Grid configuration containing WIDTH and HEIGHT properties
 * @returns {Object} - The configured surface mesh added to the scene
 */
export function setupMesh(stage, THREE, GRID) {
    // Create and position the surface mesh
    const surfaceMesh = createMesh(THREE, GRID);
    surfaceMesh.position.set(0, 0, 0);
    surfaceMesh.rotation.x = Math.PI;
    stage.scene.add(surfaceMesh);

    return surfaceMesh;
}

/**
 * Calculates RGB color values based on concentration using sine waves
 * 
 * @param {number} concentration - Value representing concentration (0-1)
 * @returns {Object} - Object containing r, g, b values between 0-1
 */
const calculateColor = (concentration) => {
    // Calculate the phase for the sine wave
    const phase = concentration * 2 * Math.PI;

    // Calculate RGB components using sine waves with phase shifts, scaled to [0, 1]
    const red = (Math.sin(phase) + 1) / 2;
    const green = (Math.sin(phase - (2 * Math.PI / 3)) + 1) / 2;
    const blue = (Math.sin(phase - (4 * Math.PI / 3)) + 1) / 2;

    // Return RGB values, ensuring they are not NaN
    return {
        r: red,
        g: green,
        b: blue
    };
};

/**
 * Updates the surface mesh geometry based on concentration data
 * 
 * @param {Object} surfaceMesh - The Three.js mesh to update
 * @param {Array} concentrationData - Array of concentration values
 * @param {number} heightMultiplier - Factor to multiply height values by
 */
export function updateSurfaceMesh(surfaceMesh, concentrationData, heightMultiplier) {
    // Get direct access to the position and color buffer arrays
    const positions = surfaceMesh.geometry.attributes.position.array; // x, y, z for each vertex
    const colorsAttribute = surfaceMesh.geometry.attributes.color; // r, g, b for each vertex

    // Iterate through each point in the grid
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const idx = y * WIDTH + x; // Calculate 1D index
            const bufferIndex = 3 * idx; // Base index for position and color arrays

            // --- Update Height (Z-position) ---
            const concentration = concentrationData[idx]*2;
            const height = concentration* heightMultiplier; // Direct mapping
            positions[bufferIndex + 2] = height ; // Set Z value

            // --- Update Color ---
            const { r, g, b } = calculateColor(concentration);
            colorsAttribute.array[bufferIndex] = r;
            colorsAttribute.array[bufferIndex + 1] = g;
            colorsAttribute.array[bufferIndex + 2] = b;
        }
    }



    // Mark attributes as needing update to reflect changes
    surfaceMesh.geometry.attributes.position.needsUpdate = true;
    surfaceMesh.geometry.attributes.color.needsUpdate = true;
}