
 function   expandPool(THREE,size, capsules) {
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
    return capsules;
}

export function setupBacteriaPool(stage, size, THREE, capsules) {
    
    // Expand the pool to the initial size
    capsules = expandPool(THREE,size, capsules);

    // Add all capsules to the scene
    capsules.forEach(capsule => {
        stage.scene.add(capsule);
    });
    return capsules;
}
