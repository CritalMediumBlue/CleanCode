import * as THREE from 'three';
import { CONFIG } from '../config.js';

/**
 * Manages a pool of bacterium objects for efficient reuse
 */
export class BacteriumPool {
    constructor(scene, initialSize) {
        this.scene = scene;
        this.bacteria = []; 
        this.activeCount = 0;
        this.growthFactor = CONFIG.BACTERIUM.POOL_GROWTH_FACTOR;
        this.capsuleGeometryCache = new Map();
        this.edgesGeometryCache = new Map();
        
        // Initialize pool
        this.expandPool(initialSize);
    }

    /**
     * Update bacterium geometry based on length
     */
    updateGeometry(bacterium, adjustedLength) {
        // Get or create geometry for this length
        let newGeometry = this.capsuleGeometryCache.get(adjustedLength);
        let newWireframeGeometry = this.edgesGeometryCache.get(adjustedLength);

        if (!newGeometry) {
            newGeometry = this.createCapsuleGeometry(adjustedLength);
            this.capsuleGeometryCache.set(adjustedLength, newGeometry);
            newWireframeGeometry = new THREE.EdgesGeometry(newGeometry);
            this.edgesGeometryCache.set(adjustedLength, newWireframeGeometry);
        }

        // Update geometry if different from current
        if (bacterium.geometry !== newGeometry) {
            bacterium.geometry.dispose();
            bacterium.geometry = newGeometry;

            const wireframe = bacterium.children[0];
            wireframe.geometry.dispose();
            wireframe.geometry = newWireframeGeometry;
            wireframe.scale.set(
                CONFIG.BACTERIUM.WIREFRAME_SCALE, 
                CONFIG.BACTERIUM.WIREFRAME_SCALE, 
                CONFIG.BACTERIUM.WIREFRAME_SCALE
            );
        }
    }

    /**
     * Create capsule geometry with specified length
     */
    createCapsuleGeometry(length = 1) {
        return new THREE.CapsuleGeometry(
            0.4,
            length,
            CONFIG.BACTERIUM.CAP_SEGMENTS,
            CONFIG.BACTERIUM.RADIAL_SEGMENTS
        );
    }

    /**
     * Get a bacterium from the pool, expanding if necessary
     */
    getBacterium() {
        if (this.activeCount >= this.bacteria.length) {
            this.expandPool(Math.ceil(this.bacteria.length * this.growthFactor));
        }
        return this.bacteria[this.activeCount++];
    }

    /**
     * Expand the pool to the specified size
     */
    expandPool(newSize) {
        while (this.bacteria.length < newSize) {
            const bacterium = this.createBacterium();
            this.bacteria.push(bacterium);
        }
    }

    /**
     * Reset the pool, optionally clearing all bacteria
     */
    reset(fullClear = false) {
        this.activeCount = 0;
        
        if (fullClear) {
            this.bacteria = [];
            this.capsuleGeometryCache.clear();
            this.edgesGeometryCache.clear();
        } else {
            this.bacteria.forEach(bacterium => {
                bacterium.visible = false;
                // Reset the phenotypeSet flag
                if (bacterium.userData) {
                    bacterium.userData.phenotypeSet = false;
                }
            });
        }
    }
 
    /**
     * Create a new bacterium and add it to the scene
     */
    createBacterium() {
        const capsuleGeometry = this.createCapsuleGeometry();
        const capsuleMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(0xffffff),
            transparent: true,
            opacity: 1
        });
        
        const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
        
        // Add wireframe
        const wireframeGeometry = new THREE.EdgesGeometry(capsuleGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: new THREE.Color(CONFIG.BACTERIUM.WIREFRAME_COLOR) 
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        
        capsule.add(wireframe);
        this.scene.add(capsule);
        capsule.visible = true;
        
        return capsule;
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        this.bacteria.forEach(bacterium => {
            this.scene.remove(bacterium);
            bacterium.geometry.dispose();
            bacterium.material.dispose();
            if (bacterium.children && bacterium.children.length > 0) {
                bacterium.children[0].geometry.dispose();
                bacterium.children[0].material.dispose();
            }
        });

        this.bacteria = [];
        this.capsuleGeometryCache.clear();
        this.edgesGeometryCache.clear();
    }
}

/**
 * Updates a bacterium's visual appearance based on phenotype
 * @param {THREE.Mesh} bacterium - The bacterium mesh to update
 * @param {THREE.Color} phenotype - The phenotype color
 * @param {number} magentaProportion - Proportion of magenta neighbors
 * @param {number} cyanProportion - Proportion of cyan neighbors
 */
export function updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion) {
    // Pre-define phenotype colors for comparison
    const MAGENTA = new THREE.Color(CONFIG.COLORS.MAGENTA_PHENOTYPE);

    if (CONFIG.BACTERIUM.COLOR_BY_INHERITANCE) {
        // Color by phenotype
        bacterium.material.color.set(phenotype);
        bacterium.children[0].material.color.set(phenotype.clone().multiplyScalar(0.5));
    } else {
        // Color by similarity
        const scalar = phenotype.equals(MAGENTA) 
            ? Math.round(magentaProportion * 255) 
            : Math.round(cyanProportion * 255);
            
        const similarityColor = new THREE.Color(`rgb(${scalar}, ${scalar}, ${255-scalar})`);
        bacterium.material.color.set(similarityColor);
        bacterium.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.5));
    }
}

/**
 * Sets bacterium position and rotation
 * @param {THREE.Mesh} bacterium - The bacterium mesh to transform
 * @param {THREE.Vector3} position - Position vector
 * @param {number} angle - Rotation angle
 * @param {number} zPosition - Z-axis position
 */
export function setBacteriumTransform(bacterium, position, angle, zPosition) {
    bacterium.position.set(position.x, position.y, zPosition);
    bacterium.rotation.z = angle * Math.PI; // 0 or PI means vertical, PI/2 means horizontal
}

/**
 * Creates a new bacterium renderer system
 * @param {THREE.Scene} scene - Three.js scene to add bacteria to
 * @returns {BacteriumPool} New bacterium pool instance
 */
export function createBacteriumPool(scene) {
    return new BacteriumPool(scene, CONFIG.BACTERIUM.INITIAL_POOL_SIZE);
}