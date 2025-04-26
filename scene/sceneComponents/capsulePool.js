import { populateMapCaches, updateCapsuleColor } from './geometries.js';
/**
 * @module capsulePool
 * @description Manages the creation and initialization of a pool of 3D capsule objects 
 * that represent bacteria in the scene. This module provides functionality to set up
 * a predetermined number of bacteria capsule meshes with wireframes.
 */
const capsuleGeometryCache = new Map();
const edgesGeometryCache = new Map();
/**
 * Creates and initializes a pool of bacteria capsule meshes in the 3D scene
 * 
 * @param {Object} stage - The stage object containing the scene where capsules will be added
 * @param {number} size - The desired number of capsule objects to maintain in the pool
 * @param {Object} THREE - The Three.js library object needed for creating 3D objects
 * @param {Array<THREE.Mesh>} capsules - Existing array of capsule objects to be populated
 * @returns {Array<THREE.Mesh>} The array of capsule meshes that was populated
 */
export function setupCapsulePool(stage, BACTERIUM, THREE, capsules) {
    const poolSize = BACTERIUM.INITIAL_POOL_SIZE;
    while (capsules.length < poolSize) {

        const capsuleGeometry = new THREE.CapsuleGeometry();
        const capsuleMaterial = new THREE.MeshBasicMaterial({ });
        
        const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
        
        // Add wireframe
        const wireframeGeometry = new THREE.EdgesGeometry(capsuleGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({});
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        
        capsule.add(wireframe);
        capsules.push(capsule);
    }

    capsules.forEach(capsule => {
        stage.scene.add(capsule);
    });

    populateMapCaches(BACTERIUM, THREE, capsuleGeometryCache, edgesGeometryCache);
    
    return capsules;
}


export function updateCapsules(bacteriaData, BACTERIUM, THREE, capsules) {
    if (!bacteriaData || bacteriaData.length === 0) {
        return;
    }
   // Reset active count and hide all capsules
   let activeCount = 0;
   capsules.forEach(capsule => {
        capsule.visible = false;
   });
   
   // Render each capsule
   bacteriaData.forEach(bacterium => {
       const capsule = capsules[activeCount++]
   
       const { position, angle, longAxis, phenotype, similarity } = bacterium;
   
       const threePosition = new THREE.Vector3(position.x, position.y, 0);

       
       
       capsule.position.set(threePosition.x, threePosition.y, 0);
       capsule.rotation.z = angle * Math.PI;  
       updateCapsuleGeometry(capsule, longAxis);
       updateCapsuleColor(capsule, phenotype,  BACTERIUM, THREE,similarity);
       
       capsule.visible = true;
   });
}



function updateCapsuleGeometry(capsule, longAxis) {
    // Get or create geometry for this length
    let newGeometry = capsuleGeometryCache.get(longAxis);
    let newWireframeGeometry = edgesGeometryCache.get(longAxis);

    // Update geometry if different from current
    if (capsule.geometry !== newGeometry) {
        capsule.geometry.dispose();
        capsule.geometry = newGeometry;

        const wireframe = capsule.children[0];
        wireframe.geometry.dispose();
        wireframe.geometry = newWireframeGeometry;
    }
}
