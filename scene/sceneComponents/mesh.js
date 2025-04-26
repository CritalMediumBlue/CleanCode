let WIDTH = 0;
let HEIGHT = 0;
function createMesh(scene,THREE, config) {
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;

    const geometry = new THREE.PlaneGeometry(WIDTH-1, HEIGHT-1, WIDTH -1, HEIGHT-1 ); // width, height, widthSegments, heightSegments
    
    const material = new THREE.MeshBasicMaterial({
        wireframe: true, 
        wireframeLinewidth: 3,
        vertexColors: true
    });

       // Initialize the color attribute buffer before creating the mesh
        // The size is num_vertices * 3 (r, g, b per vertex)
        const numVertices = geometry.attributes.position.count;
        const initialColors = new Float32Array(numVertices * 3); // Initialize with zeros
        geometry.setAttribute('color', new THREE.BufferAttribute(initialColors, 3)); // Add color attribute
    

    const surfaceMesh = new THREE.Mesh(geometry, material);
    scene.add(surfaceMesh);
    surfaceMesh.position.set(0, 0, 0);
    surfaceMesh.rotation.x = Math.PI ; // Rotate to be horizontal

    //add helper axes
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
    return surfaceMesh;
}

export function setupMesh(stage,THREE, config) {
    
    // Create and position the surface mesh
    const surfaceMesh = createMesh(stage.scene, THREE, config);
    surfaceMesh.rotation.x = Math.PI;
    stage.scene.add(surfaceMesh);

    return surfaceMesh;
    
}

const calculateColor = (concentration) => {
    // Normalize concentration value
    const normalizedConcentration = concentration;

    // Calculate the phase for the sine wave
    const phase = normalizedConcentration * 2 * Math.PI;

    // Calculate RGB components using sine waves with phase shifts, scaled to [0, 1]
    const red = (Math.sin(phase) + 1) / 2;
    const green = (Math.sin(phase - (2 * Math.PI / 3)) + 1) / 2;
    const blue = (Math.sin(phase - (4 * Math.PI / 3)) + 1) / 2;

    // Return RGB values, ensuring they are not NaN
    return {
        r: isNaN(red) ? 0 : red,
        g: isNaN(green) ? 0 : green,
        b: isNaN(blue) ? 0 : blue
    };
};

export function updateSurfaceMesh(surfaceMesh, concentrationData, heightMultiplier ) {
    if (!surfaceMesh) {
        console.warn("updateSurfaceMesh called before surfaceMesh is initialized.");
        return;
    }

    // Get direct access to the position and color buffer arrays
    const positions = surfaceMesh.geometry.attributes.position.array; // x, y, z for each vertex
    const colorsAttribute = surfaceMesh.geometry.attributes.color; // r, g, b for each vertex

    // Iterate through each point in the grid
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const idx = y * WIDTH + x; // Calculate 1D index
            const bufferIndex = 3 * idx; // Base index for position and color arrays

            // --- Update Height (Z-position) ---
            let concentration = concentrationData[idx];
            if (isNaN(concentration)) {
                concentration = 0.0;
            }
            const height = concentration; // Direct mapping
            positions[bufferIndex + 2] = isNaN(height) ? 0 : height * heightMultiplier; // Set Z value

            // --- Update Color ---
            const color = calculateColor(concentration);
            colorsAttribute.array[bufferIndex] = color.r;
            colorsAttribute.array[bufferIndex + 1] = color.g;
            colorsAttribute.array[bufferIndex + 2] = color.b;
        }
    }

    // Mark attributes as needing update for Three.js
    surfaceMesh.geometry.attributes.position.needsUpdate = true;
    surfaceMesh.geometry.attributes.color.needsUpdate = true;
}