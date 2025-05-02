import { populateMapCaches, updateCapsuleColor } from './geometries.js';

/**
 * @module capsulePool
 * @description Manages the creation and initialization of a pool of 3D capsule objects 
 * that represent bacteria in the scene. This module provides functionality to set up
 * a predetermined number of bacteria capsule meshes with wireframes.
 */

// Caches to store pre-generated geometries for performance optimization
const capsuleGeometryCache = new Map();
const edgesGeometryCache = new Map();

/**
 * Creates and initializes a pool of bacteria capsule meshes in the 3D scene
 * 
 * @param {Object} stage - The stage object containing the scene where capsules will be added
 * @param {Object} BACTERIUM - Configuration object containing bacterial simulation parameters
 * @param {Object} THREE - The Three.js library object needed for creating 3D objects
 * @param {Array<THREE.Mesh>} capsules - Existing array of capsule objects to be populated
 * @returns {Array<THREE.Mesh>} The array of capsule meshes that was populated
 */
export function setupCapsulePool(stage, BACTERIUM, THREE, capsules) {
    const poolSize = BACTERIUM.INITIAL_POOL_SIZE*2;
    
    // Create capsule objects until we reach the desired pool size
    while (capsules.length < poolSize) {
        const capsuleGeometry = new THREE.CapsuleGeometry();
        const capsuleMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
        });
        
        const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
        
        // Add wireframe outline to capsule
        const wireframeGeometry = new THREE.EdgesGeometry(capsuleGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({});
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        
        capsule.add(wireframe);
        capsules.push(capsule);
    }

    // Add all capsules to the scene
    capsules.forEach(capsule => {
        stage.scene.add(capsule);
    });

    // Initialize geometry caches for different capsule sizes
    populateMapCaches(BACTERIUM, THREE, capsuleGeometryCache, edgesGeometryCache);
    
    return capsules;
}

/**
 * Updates the properties of capsule objects based on bacteria simulation data
 * 
 * @param {Array<Object>} bacteriaData - Array of bacteria data objects from simulation
 * @param {Object} BACTERIUM - Configuration object containing bacterial parameters
 * @param {Object} THREE - The Three.js library object
 * @param {Array<THREE.Mesh>} capsules - Array of capsule mesh objects to update
 */
export function updateCapsules(bacteriaData, BACTERIUM, THREE, capsules,nextSlices) {
    if (!bacteriaData || bacteriaData.length === 0) {
        return;
    }
    
    // Reset active count and hide all capsules
    let activeCount = 0;
    capsules.forEach(capsule => {
        capsule.visible = false;
    });
   
    // Update and show capsules for each bacterium
    bacteriaData.forEach(bacterium => {
        const capsule = capsules[activeCount++];
   
        const { x,y, angle, longAxis, phenotype, similarity } = bacterium;
   
        const threePosition = new THREE.Vector3(x, y, 0);
       
        capsule.position.set(threePosition.x, threePosition.y, 0);
        capsule.rotation.z = angle * Math.PI;  
        updateCapsuleGeometry(capsule, longAxis);
        updateCapsuleColor(capsule, phenotype, BACTERIUM, THREE, similarity,1);
       
        capsule.visible = true;
    });

    nextSlices.forEach((slice, index) => {
        slice.forEach(bacterium => {
            const { x,y, angle, longAxis, randomSwitch } = bacterium;
            if (randomSwitch) {
                const capsule = capsules[activeCount++];
                const threePosition = new THREE.Vector3(x, y, index*0.1);
                capsule.position.set(threePosition.x, threePosition.y, threePosition.z);
                capsule.rotation.z = angle * Math.PI;
                updateCapsuleGeometry(capsule, longAxis);
                updateCapsuleColor(capsule, "switch", BACTERIUM, THREE, 0, 1-0.005*index);
                capsule.visible = true;
            }
        }); 
    });

} 


/**
 * Updates the geometry of a capsule based on its required length
 * 
 * @param {THREE.Mesh} capsule - The capsule mesh to update
 * @param {number} longAxis - The length value to determine which geometry to use
 */
function updateCapsuleGeometry(capsule, longAxis) {
    // Get cached geometry for this length
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
