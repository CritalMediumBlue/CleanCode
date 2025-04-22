/**
 * Manages a pool of bacterium objects for efficient reuse
 */
export class BacteriumPool {
    constructor(scene, initialSize, config = null, THREE) {
        this.scene = scene;
        this.config = config;
        this.bacteria = []; 
        this.activeCount = 0;
        this.growthFactor = this.config.BACTERIUM.POOL_GROWTH_FACTOR;
        this.capsuleGeometryCache = new Map();
        this.edgesGeometryCache = new Map();
        this.THREE = THREE; // Store THREE as instance property
        
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
            newWireframeGeometry = new this.THREE.EdgesGeometry(newGeometry);
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
                this.config.BACTERIUM.WIREFRAME_SCALE, 
                this.config.BACTERIUM.WIREFRAME_SCALE, 
                this.config.BACTERIUM.WIREFRAME_SCALE
            );
        }
    }

    /**
     * Create capsule geometry with specified length
     */
    createCapsuleGeometry(length = 1) {
        return new this.THREE.CapsuleGeometry(
            0.4,
            length,
            this.config.BACTERIUM.CAP_SEGMENTS,
            this.config.BACTERIUM.RADIAL_SEGMENTS
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
        const capsuleMaterial = new this.THREE.MeshBasicMaterial({ 
            color: new this.THREE.Color(0xffffff),
            transparent: true,
            opacity: 1
        });
        
        const capsule = new this.THREE.Mesh(capsuleGeometry, capsuleMaterial);
        
        // Add wireframe
        const wireframeGeometry = new this.THREE.EdgesGeometry(capsuleGeometry);
        const wireframeMaterial = new this.THREE.LineBasicMaterial({ 
            color: new this.THREE.Color(this.config.BACTERIUM.WIREFRAME_COLOR) 
        });
        const wireframe = new this.THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        
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
 * @param {string} phenotype - The phenotype identifier ('MAGENTA' or 'CYAN')
 * @param {number} magentaProportion - Proportion of magenta neighbors
 * @param {number} cyanProportion - Proportion of cyan neighbors
 * @param {Object} phenotypeColors - Map of phenotype names to THREE.Color objects
 * @param {Object} config - Configuration object
 * @param {Object} THREE - THREE.js library
 */
export function updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion, phenotypeColors, config, THREE) {
    // Convert string phenotype to THREE.Color
    const threeColor = phenotypeColors[phenotype];

    if (config.BACTERIUM.COLOR_BY_INHERITANCE) {
        // Color by phenotype
        bacterium.material.color.copy(threeColor);
        bacterium.children[0].material.color.copy(threeColor.clone().multiplyScalar(0.5));
    } else {
        // Color by similarity
        const isMagenta = phenotype === config.PHENOTYPES.MAGENTA;
        const scalar = isMagenta
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
 * @param {Object} THREE - THREE.js library
 */
export function setBacteriumTransform(bacterium, position, angle, zPosition, THREE) {
    bacterium.position.set(position.x, position.y, zPosition);
    bacterium.rotation.z = angle * Math.PI; // 0 or PI means vertical, PI/2 means horizontal
}

/**
 * Creates a new bacterium renderer system
 * @param {THREE.Scene} scene - Three.js scene to add bacteria to
 * @param {Object} config - Configuration object
 * @param {Object} THREE - THREE.js library
 * @returns {BacteriumPool} New bacterium pool instance
 */
export function createBacteriumPool(scene, config, THREE) {
    return new BacteriumPool(scene, config.BACTERIUM.INITIAL_POOL_SIZE, config, THREE);
}

/**
 * Renderer class that handles visualizing bacteria based on simulation data.
 * This decouples rendering from simulation logic.
 */
export class BacteriumRenderer {
    /**
     * Create a new bacterium renderer
     * @param {THREE.Scene} scene - Three.js scene to render bacteria in
     * @param {Object} config - Configuration object
     * @param {Object} THREE - THREE.js library
     */
    constructor(scene, config = null, THREE) {
        this.scene = scene;
        this.config = config;
        this.THREE = THREE;
        this.bacteriumPool = new BacteriumPool(scene, this.config.BACTERIUM.INITIAL_POOL_SIZE, this.config, THREE);
        
        // Initialize phenotype colors from config
        this.phenotypeColors = {
            'MAGENTA': new THREE.Color(this.config.COLORS.MAGENTA_PHENOTYPE),
            'CYAN': new THREE.Color(this.config.COLORS.CYAN_PHENOTYPE)
        };
    }
    
    /**
     * Render bacteria based on simulation data
     * @param {BacteriumData[]} bacteriaData - Array of bacterium data from simulation
     */
    renderBacteria(bacteriaData) {
        // Reset the pool for new render
        this.bacteriumPool.reset();
        
        // Render each bacterium
        bacteriaData.forEach(data => {
            const bacterium = this.bacteriumPool.getBacterium();
            this.renderBacterium(bacterium, data);
        });
    }
    
    /**
     * Render a single bacterium
     * @param {THREE.Mesh} bacterium - Three.js mesh to update
     * @param {BacteriumData} data - Data for this bacterium
     */
    renderBacterium(bacterium, data) {
        const { position, angle, longAxis, phenotype, magentaProportion, cyanProportion, visible } = data;
        
        // Convert plain position to THREE.Vector3
        const threePosition = new this.THREE.Vector3(position.x, position.y, position.z || 0);
        
        // Set position and rotation
        setBacteriumTransform(bacterium, threePosition, angle, position.z || 0, this.THREE);
        
        // Update geometry using THREE
        this.bacteriumPool.updateGeometry(bacterium, longAxis);
        
        // Update color
        updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion, this.phenotypeColors, this.config, this.THREE);
        
        // Set visibility
        bacterium.visible = visible;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.bacteriumPool) {
            this.bacteriumPool.dispose();
        }
    }
}