
/**
 * Creates and returns a surface mesh for the scene.
 * @param {THREE.Scene} scene - The scene to add the mesh to.
 * @returns {THREE.Mesh} The created surface mesh.
 */
export function createMesh(scene,THREE, config) {
    const WIDTH = config.GRID.WIDTH;
    const HEIGHT = config.GRID.HEIGHT;

    const planeGeometry = new THREE.PlaneGeometry(WIDTH-1, HEIGHT-1, WIDTH -1, HEIGHT-1 ); // width, height, widthSegments, heightSegments
    
    const material = new THREE.MeshBasicMaterial({
        wireframe: true, 
        wireframeLinewidth: 3,
        vertexColors: true
    });

    const surfaceMesh = new THREE.Mesh(planeGeometry, material);
    scene.add(surfaceMesh);
    surfaceMesh.position.set(0, 0, 0);
    surfaceMesh.rotation.x = Math.PI ; // Rotate to be horizontal

    //add helper axes
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
    return surfaceMesh;
}