
/**
 * @module capsulePool
 * @description Manages the creation and initialization of a pool of 3D capsule objects 
 * that represent bacteria in the scene. This module provides functionality to set up
 * a predetermined number of bacteria capsule meshes with wireframes.
 */

/**
 * Creates and initializes a pool of bacteria capsule meshes in the 3D scene
 * 
 * @param {Object} stage - The stage object containing the scene where capsules will be added
 * @param {number} size - The desired number of capsule objects to maintain in the pool
 * @param {Object} THREE - The Three.js library object needed for creating 3D objects
 * @param {Array<THREE.Mesh>} capsules - Existing array of capsule objects to be populated
 * @returns {Array<THREE.Mesh>} The array of capsule meshes that was populated
 */
export function setupCapsulePool(stage, size, THREE, capsules) {
    
    while (capsules.length < size) {

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
    
    return capsules;
}
