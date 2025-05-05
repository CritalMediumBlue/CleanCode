/**
 * @module geometries
 * @description Handles the creation and management of geometries and related visual aspects
 * for bacteria representation in the 3D scene.
 */
import { interpolateViridis } from 'd3-scale-chromatic';

/**
 * Populates geometry caches for different capsule lengths to avoid recreating geometries
 * 
 * @param {Object} BACTERIUM - Configuration object with bacterial parameters
 * @param {Object} THREE - The Three.js library object
 * @param {Map} capsuleGeometryCache - Cache for storing capsule geometries
 * @param {Map} edgesGeometryCache - Cache for storing edge geometries for wireframes
 */
export function populateMapCaches(BACTERIUM, THREE, capsuleGeometryCache, edgesGeometryCache) {
    const capSeg = BACTERIUM.CAP_SEGMENTS;
    const radialSeg = BACTERIUM.RADIAL_SEGMENTS;
    
    // Pre-generate geometries for different bacterial lengths
    for (let length = 1; length < 30; length++) {
        // Create main capsule geometry
        const geometry = new THREE.CapsuleGeometry(0.5, length, capSeg, radialSeg);
        capsuleGeometryCache.set(length, geometry);

        // Create scaled geometry for wireframe
        const scaledGeometry = geometry.clone();
        scaledGeometry.scale(
            BACTERIUM.WIREFRAME_SCALE, 
            BACTERIUM.WIREFRAME_SCALE, 
            BACTERIUM.WIREFRAME_SCALE
        );
        
        const wireframeGeometry = new THREE.EdgesGeometry(scaledGeometry);
        edgesGeometryCache.set(length, wireframeGeometry);
    }
}

/**
 * Updates the color of a capsule based on either phenotype or similarity value
 * 
 * @param {THREE.Mesh} capsule - The capsule mesh to update
 * @param {string} phenotype - The phenotype category of the bacterium
 * @param {Object} BACTERIUM - Configuration object with bacterial parameters
 * @param {Object} THREE - The Three.js library object
 * @param {number} similarity - A value representing similarity (used for color gradient)
 */
export function updateCapsuleColor(capsule, phenotype, BACTERIUM, THREE, similarity,opacity, changed,cytoplasmConcentrations) {
    if (BACTERIUM.COLOR_BY_INHERITANCE) {
        // Color based on phenotype categories
        let color;
        
        switch (phenotype) {
            case 'MAGENTA':
                color = 0xFF00FF; // Magenta color
                capsule.children[0].visible = true;
                break;
            case 'CYAN':
                color = 0x00FFFF; // Cyan color
                capsule.children[0].visible = true;
                break;
            case 'switch':
                color = 0xFFFF00; // Yellow color for switch
                capsule.children[0].visible = false;
                break;
            case "continuous":
                const red = cytoplasmConcentrations.r;
                const blue = cytoplasmConcentrations.p;
                const green = 0.5;
                color = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
                capsule.children[0].visible = true;
                break;
            


        } 
        if (changed > 0.001) {
            color = 0xFFFF00; // Yellow color for switch
            capsule.children[0].visible = true;
        }

        
        const threeColor = new THREE.Color(color);

        capsule.material.color.copy(threeColor);
        capsule.material.opacity = changed > 0.001 ? 1-changed : opacity;
        capsule.children[0].material.color.copy(threeColor.clone().multiplyScalar(0.3));
      
    } else {
        if (similarity === null) {
            similarity = 0;
            capsule.children[0].visible = false;
        } else {
            capsule.children[0].visible = true;
        }
        const similarityColor = new THREE.Color(interpolateViridis(similarity));
               
        capsule.material.color.copy(similarityColor);
        capsule.material.opacity = opacity;
        capsule.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.3));
    }
}




