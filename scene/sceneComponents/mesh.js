
/**
 * Creates and returns a surface mesh for the scene.
 * @param {THREE.Scene} scene - The scene to add the mesh to.
 * @returns {THREE.Mesh} The created surface mesh.
 */
export function createMesh(scene,THREE, config) {
    const WIDTH = config.GRID.WIDTH;
    const HEIGHT = config.GRID.HEIGHT;

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
    stage.surfaceMesh = createMesh(stage.scene, THREE, config);
    stage.surfaceMesh.rotation.x = Math.PI;
    stage.scene.add(stage.surfaceMesh);
    
    console.log("Surface mesh created (wireframe) and added to scene with color attribute.");
}