export function populateMapCaches(BACTERIUM, THREE, capsuleGeometryCache, edgesGeometryCache) {
    const capSeg = BACTERIUM.CAP_SEGMENTS;
    const radialSeg = BACTERIUM.RADIAL_SEGMENTS;
    for (let length = 1; length < 30; length++) {
        const geometry = new THREE.CapsuleGeometry(0.5,length,capSeg,radialSeg);
        capsuleGeometryCache.set(length, geometry);

        const scaledGeometry = geometry.clone();
        scaledGeometry.scale(BACTERIUM.WIREFRAME_SCALE, BACTERIUM.WIREFRAME_SCALE, BACTERIUM.WIREFRAME_SCALE);
        
        const wireframeGeometry = new THREE.EdgesGeometry(scaledGeometry);
        edgesGeometryCache.set(length, wireframeGeometry);
    }
}

export function updateCapsuleColor(capsule, phenotype, BACTERIUM, THREE,similarity) {
   

    switch (BACTERIUM.COLOR_BY_INHERITANCE) {
        case true:
            

            let color;
        
            switch (phenotype) {
                case 'MAGENTA':
                    color = 0xFF00FF;
                    break;
                case 'CYAN':
                    color = 0x00FFFF;
                    break;
                default:
                    color = 0xFFFFFF; 
            }
        
            const threeColor = new THREE.Color(color);

            capsule.material.color.copy(threeColor);
            capsule.children[0].material.color.copy(threeColor.clone().multiplyScalar(0.3));
            break;
            
        case false:
            // Color by similarity
            const scalar = Math.round(similarity * 255);
                
            const similarityColor = new THREE.Color(`rgb(${scalar}, ${scalar}, ${255-scalar})`);
            capsule.material.color.set(similarityColor);
            capsule.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.3));
            break;
        }
}




