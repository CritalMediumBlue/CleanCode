

// Grid dimensions, initialized when createMesh is called
let WIDTH;
let HEIGHT; 


function createMesh(THREE, GRID) {
    WIDTH = GRID.WIDTH;
    HEIGHT = GRID.HEIGHT;

    const geometry = new THREE.PlaneGeometry(
        WIDTH - 1, 
        HEIGHT - 1, 
        WIDTH - 1, 
        HEIGHT - 1
    ); // width, height, widthSegments, heightSegments
    
    const material = new THREE.MeshBasicMaterial({
        //wireframe: true, 
        wireframeLinewidth: 1,
        vertexColors: true,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.7,
      

    });

    const numVertices = WIDTH * HEIGHT;
    const initialColors = new Float32Array(numVertices * 3); // Initialize with zeros
    geometry.setAttribute('color', new THREE.BufferAttribute(initialColors, 3)); // Add color attribute

    const surfaceMesh = new THREE.Mesh(geometry, material);
    surfaceMesh.renderOrder = 1;
    return surfaceMesh;
}

export function setupMesh(stage, THREE, GRID) {
    // Create and position the surface mesh
    const surfaceMesh = createMesh(THREE, GRID);
    surfaceMesh.position.set(0, 0, 0);
    //surfaceMesh.rotation.x = Math.PI;
    surfaceMesh.rotation.z = Math.PI;
    stage.scene.add(surfaceMesh);
    surfaceMesh.visible = false; 

    return surfaceMesh;
}


const calculateColor = (concentration) => {
    
    let con = concentration+2.5;
    const red = (Math.sin(con) + 1) / 2;
    const green = (Math.sin(con - (2 * Math.PI / 3)) + 1) / 2;
    const blue = (Math.sin(con - (4 * Math.PI / 3)) + 1) / 2;

    // Return RGB values, ensuring they are not NaN
    return {
        r: red,
        g: green,
        b: blue
    };
};


export function updateSurfaceMesh(surfaceMesh, concentrationData, heightMultiplier,translation,colorMultiplier) {
    // Get direct access to the position and color buffer arrays
    const positions = surfaceMesh.geometry.attributes.position.array; // x, y, z for each vertex
    const colorsAttribute = surfaceMesh.geometry.attributes.color; // r, g, b for each vertex


    // Iterate through each point in the grid
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const idx = y * WIDTH + x; // Calculate 1D index
            const bufferIndex = 3 * idx; // Base index for position and color arrays

            const height = concentrationData[idx];
            positions[bufferIndex + 2] = height*heightMultiplier+translation; // Set Z value

            // --- Update Color ---
            const { r, g, b } = calculateColor(height*colorMultiplier);
            colorsAttribute.array[bufferIndex] = r;
            colorsAttribute.array[bufferIndex + 1] = g;
            colorsAttribute.array[bufferIndex + 2] = b;
        }
    }

    // Mark attributes as needing update to reflect changes
    surfaceMesh.geometry.attributes.position.needsUpdate = true;
    surfaceMesh.geometry.attributes.color.needsUpdate = true;
}