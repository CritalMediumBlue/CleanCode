
 function   expandPool(Size,config, THREE, capsules) {
    while (capsules.length < Size) {
        const capsule = createCapsule(config, THREE);
        capsules.push(capsule);
    }
    return capsules;
}

function createCapsule(config, THREE) {
    const capsuleGeometry = new THREE.CapsuleGeometry(
        0.4,
        1,
        config.BACTERIUM.CAP_SEGMENTS,
        config.BACTERIUM.RADIAL_SEGMENTS
    );
    const capsuleMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 1
    });
    
    const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    
    // Add wireframe
    const wireframeGeometry = new THREE.EdgesGeometry(capsuleGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(config.BACTERIUM.WIREFRAME_COLOR) 
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    
    capsule.add(wireframe);
    
    return capsule;
}

export function setupBacteriaPool(stage, config, THREE, capsules) {
    const initialSize = config.BACTERIUM.INITIAL_POOL_SIZE;
    
    // Expand the pool to the initial size
    capsules = expandPool(initialSize, config, THREE, capsules);

    // Add all capsules to the scene
    capsules.forEach(capsule => {
        stage.scene.add(capsule);
    });
    return capsules;

}
