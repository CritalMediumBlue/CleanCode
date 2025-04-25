/**
 * Manages a pool of bacterium objects for efficient reuse
 */
export class BacteriaPool {
    constructor(scene, initialSize, config = null, THREE) {
        this.scene = scene;
        this.config = config;
        this.capsules = []; 
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
        // Handle the case where the pool might be empty initially
        if (this.capsules.length === 0) {
            // Use the INITIAL_POOL_SIZE from config if available, otherwise use a default of 100
            const initialSize = (this.config && this.config.BACTERIUM && this.config.BACTERIUM.INITIAL_POOL_SIZE) || 100;
            console.log(`Initial pool expansion with size ${initialSize}`);
            this.expandPool(initialSize);
        }
        
        if (this.activeCount >= this.capsules.length) {
            const newSize = Math.ceil(this.capsules.length * this.growthFactor);
            console.log(`Expanding pool from ${this.capsules.length} to ${newSize}`);
            this.expandPool(newSize);
      
        }
        return this.capsules[this.activeCount++];
    }

    /**
     * Expand the pool to the specified size
     */
    expandPool(newSize) {
        while (this.capsules.length < newSize) {
            const capsule = this.createCapsule();
            this.capsules.push(capsule);
        }
    }

    /**
     * Reset the pool, optionally clearing all capsules
     */
    reset(fullClear = false) {
        this.activeCount = 0;
        
        if (fullClear) {
            this.capsules = [];
            this.capsuleGeometryCache.clear();
            this.edgesGeometryCache.clear();
        } else {
            this.capsules.forEach(bacterium => {
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
    createCapsule() {
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


}
