import * as THREE from 'three';
import { quadtree } from 'd3-quadtree';
import { CONFIG } from '../config.js';

/**
 * Manages history tracking for bacteria simulation
 */
class HistoryManager {
    constructor() {
        this.totalBacteriaCountHistory = [];
        this.magentaBacteriaCountHistory = [];
        this.cyanBacteriaCountHistory = [];
        this.averageSimilarityHistory = [];
    }

    /**
     * Update history arrays with new data
     * @param {number} totalCount - Total bacteria count
     * @param {number} magentaCount - Magenta bacteria count
     * @param {number} cyanCount - Cyan bacteria count
     * @param {number} averageSimilarity - Average similarity value
     */
    update(totalCount, magentaCount, cyanCount, averageSimilarity) {
        this.totalBacteriaCountHistory.push(totalCount);
        this.magentaBacteriaCountHistory.push(magentaCount);
        this.cyanBacteriaCountHistory.push(cyanCount);
        this.averageSimilarityHistory.push(averageSimilarity);
    }

    /**
     * Get all history arrays
     * @returns {Object} Object containing all history arrays
     */
    getHistories() {
        return {
            totalBacteriaCountHistory: this.totalBacteriaCountHistory,
            magentaBacteriaCountHistory: this.magentaBacteriaCountHistory,
            cyanBacteriaCountHistory: this.cyanBacteriaCountHistory,
            averageSimilarityHistory: this.averageSimilarityHistory
        };
    }

    /**
     * Clear all history arrays
     */
    clear() {
        this.totalBacteriaCountHistory = [];
        this.magentaBacteriaCountHistory = [];
        this.cyanBacteriaCountHistory = [];
        this.averageSimilarityHistory = [];
    }
}

// Pre-define phenotype colors for reuse
const PHENOTYPES = {
    MAGENTA: new THREE.Color(CONFIG.COLORS.MAGENTA_PHENOTYPE),
    CYAN: new THREE.Color(CONFIG.COLORS.CYAN_PHENOTYPE)
};

/**
 * Manages phenotype determination, tracking, and related operations
 */
class PhenotypeManager {
    constructor() {
        this.phenotypeMemo = new Map();
        this.signal = CONFIG.BACTERIUM.SIGNAL.DEFAULT / 100;
        this.alpha = CONFIG.BACTERIUM.ALPHA.DEFAULT;
    }

    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Set the signal value used in phenotype determination
     */
    setSignalValue(value) {
        this.signal = this.clamp(value, CONFIG.BACTERIUM.SIGNAL.MIN, CONFIG.BACTERIUM.SIGNAL.MAX) / 100;
    }

    /**
     * Set the alpha value used in phenotype determination
     */
    setAlphaValue(value) {
        this.alpha = this.clamp(value, CONFIG.BACTERIUM.ALPHA.MIN, CONFIG.BACTERIUM.ALPHA.MAX);
    }

    /**
     * Get phenotype for a bacterium based on inheritance from parent
     */
    simplifiedInheritancePhenotype(ID, parentID) {
        // Check if phenotype is already determined for this ID
        if (this.phenotypeMemo.has(ID)) {
            return this.phenotypeMemo.get(ID);
        }
        
        // Check if parent phenotype is available
        if (parentID !== undefined && this.phenotypeMemo.has(parentID)) {
            const phenotype = this.phenotypeMemo.get(parentID);
            this.phenotypeMemo.set(ID, phenotype);
            return phenotype;
        }
        
        // Assign random phenotype if no inheritance information
        const phenotype = Math.random() < 0.5 ? PHENOTYPES.MAGENTA : PHENOTYPES.CYAN;
        this.phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }

    /**
     * Determine phenotype based on neighbors and local concentration
     */
    inheritancePhenotype(ID, neighbors, localConcentration) {
        // If phenotype already determined, use transition rules
        if (this.phenotypeMemo.has(ID)) {
            return this.determineTransitionPhenotype(ID, neighbors, localConcentration);
        }
        
        // Handle parent inheritance for IDs > 2000
        if (ID > 2000n) {
            const parentID = ID / 2n;
            if (this.phenotypeMemo.has(parentID)) {
                const phenotype = this.phenotypeMemo.get(parentID);
                this.phenotypeMemo.set(ID, phenotype);
                return phenotype;
            }
        }
        
        // Handle initial bacteria (IDs 1000-2000)
        if (ID >= 1000n && ID <= 2000n) {
            const phenotype = Math.random() < 0.5 ? PHENOTYPES.MAGENTA : PHENOTYPES.CYAN;
            this.phenotypeMemo.set(ID, phenotype);
            return phenotype;
        }
        
        // Default case - should not reach here in normal operation
        return null;
    }

    /**
     * Determine phenotype transition based on current phenotype and environment
     */
    determineTransitionPhenotype(ID, neighbors, localConcentration) {
        const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
        const proportionCyan = cyanNeighbors / totalNeighbors;
        const originalPhenotype = this.phenotypeMemo.get(ID);
        
        // Calculate transition rates based on feedback type
        let K_c2m, K_m2c; // Transition rates: cyan-to-magenta and magenta-to-cyan
        
        if (CONFIG.BACTERIUM.POSITIVE_FEEDBACK) {
            K_c2m = this.alpha + localConcentration * this.signal;
            K_m2c = this.alpha + proportionCyan * this.signal;
        } else {
            K_c2m = this.alpha + proportionCyan * this.signal;
            K_m2c = this.alpha + localConcentration * this.signal;
        }
        
        // Determine new phenotype based on transition probabilities
        const rand = Math.random();
        let phenotype;
        
        if (originalPhenotype.equals(PHENOTYPES.MAGENTA)) {
            phenotype = rand < K_m2c ? PHENOTYPES.CYAN : PHENOTYPES.MAGENTA;
        } else {
            phenotype = rand < K_c2m ? PHENOTYPES.MAGENTA : PHENOTYPES.CYAN;
        }
        
        this.phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }

    /**
     * Set bacterium phenotype and update its appearance
     */
    setPhenotypeBasedOnPhenotypeInheritance(bacterium, ID, neighbors, parentID, localConcentration) {
        // Determine phenotype based on inheritance or neighbors
        const phenotype = parentID === undefined 
            ? this.inheritancePhenotype(ID, neighbors, localConcentration) 
            : this.simplifiedInheritancePhenotype(ID, parentID);
        
        // Calculate similarity with neighbors
        const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
        const magentaProportion = magentaNeighbors / totalNeighbors;
        const cyanProportion = cyanNeighbors / totalNeighbors;
        
        // Set similarity based on phenotype
        if (phenotype.equals(PHENOTYPES.MAGENTA)) {
            bacterium.similarity = magentaProportion;
        } else {
            bacterium.similarity = cyanProportion;
        }
        
        // Update bacterium color based on configuration
        this.updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion);
    }
    
    /**
     * Update bacterium color based on configuration settings
     */
    updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion) {
        if (CONFIG.BACTERIUM.COLOR_BY_INHERITANCE) {
            // Color by phenotype
            bacterium.material.color.set(phenotype);
            bacterium.children[0].material.color.set(phenotype.clone().multiplyScalar(0.5));
        } else {
            // Color by similarity
            const scalar = phenotype.equals(PHENOTYPES.MAGENTA) 
                ? Math.round(magentaProportion * 255) 
                : Math.round(cyanProportion * 255);
                
            const similarityColor = new THREE.Color(`rgb(${scalar}, ${scalar}, ${255-scalar})`);
            bacterium.material.color.set(similarityColor);
            bacterium.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.5));
        }
    }

    /**
     * Get count of bacteria with magenta phenotype
     */
    getMagentaCount(currentTimestepBacteria) {
        return this.getPhenotypeCount(currentTimestepBacteria, PHENOTYPES.MAGENTA);
    }

    /**
     * Get count of bacteria with cyan phenotype
     */
    getCyanCount(currentTimestepBacteria) {
        return this.getPhenotypeCount(currentTimestepBacteria, PHENOTYPES.CYAN);
    }

    /**
     * Get positions of bacteria by phenotype
     */
    getPositions(currentTimestepBacteria) {
        const magentaPositions = [];
        const cyanPositions = [];

        Array.from(currentTimestepBacteria).forEach((ID) => {
            const phenotype = this.phenotypeMemo.get(ID);
            if (!phenotype) return;
            
            if (phenotype.equals(PHENOTYPES.MAGENTA)) {
                magentaPositions.push(ID);
            } else if (phenotype.equals(PHENOTYPES.CYAN)) {
                cyanPositions.push(ID);
            }
        });

        return [magentaPositions, cyanPositions];
    }

    /**
     * Count bacteria with a specific phenotype
     */
    getPhenotypeCount(currentTimestepBacteria, targetPhenotype) {
        return Array.from(currentTimestepBacteria).reduce((count, ID) => {
            const phenotype = this.phenotypeMemo.get(ID);
            return  phenotype.equals(targetPhenotype) ? count + 1 : count;
        }, 0);
    }

    /**
     * Clear phenotype memoization cache
     */
    clearPhenotypeMemo() {
        this.phenotypeMemo.clear();
    }
}

/**
 * Manages the bacterium system including quadtree for spatial queries
 */
export class BacteriumSystem {
    constructor(scene) {
        this.scene = scene;
        this.bacteriumPool = new BacteriumPool(scene, CONFIG.BACTERIUM.INITIAL_POOL_SIZE);
        this.quadtree = null;
        this.currentTimestepBacteria = new Set();
        this.phenotypeManager = new PhenotypeManager();
        this.averageSimilarityWithNeighbors = 0;
        this.historyManager = new HistoryManager();
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Dispose of all bacteria in the scene
        this.bacteriumPool.bacteria.forEach(bacterium => {
            this.scene.remove(bacterium);
            bacterium.geometry.dispose();
            bacterium.material.dispose();
            if (bacterium.children && bacterium.children.length > 0) {
                bacterium.children[0].geometry.dispose();
                bacterium.children[0].material.dispose();
            }
        });

        // Reset all state
        this.bacteriumPool.reset(true);
        this.phenotypeManager.clearPhenotypeMemo();
        this.quadtree = null;
        this.currentTimestepBacteria.clear();
        this.averageSimilarityWithNeighbors = 0;
        this.historyManager.clear();
    }

    /**
     * Build quadtree for spatial queries
     */
    buildQuadtree(layer) {
        this.quadtree = quadtree()
            .x(d => d.x)
            .y(d => d.y);
        
        layer.forEach(data => {
            this.quadtree.add(data);
        });
    }

    /**
     * Count neighbors by phenotype within radius
     */
    countNeighbors(x, y) {
        const neighborRadius = CONFIG.BACTERIUM.NEIGHBOR_RADIUS;
        let totalCount = 0;
        let magentaCount = 0;
        let cyanCount = 0;

        this.quadtree.visit((node, x1, y1, x2, y2) => {
            // Skip if node is outside search radius
            if (x1 > x + neighborRadius || 
                x2 < x - neighborRadius || 
                y1 > y + neighborRadius || 
                y2 < y - neighborRadius) {
                return true;
            }
            
            // Process leaf node
            if (!node.length) {
                do {
                    if (node.data) {
                        const dx = node.data.x - x;
                        const dy = node.data.y - y;
                        const distSquared = dx * dx + dy * dy;
                        
                        if (distSquared < neighborRadius * neighborRadius) {
                            totalCount++;
                            const phenotype = this.phenotypeManager.phenotypeMemo.get(node.data.ID);
                            
                            if (phenotype && phenotype.equals(PHENOTYPES.MAGENTA)) {
                                magentaCount++;
                            } else if (phenotype && phenotype.equals(PHENOTYPES.CYAN)) {
                                cyanCount++;
                            }
                        }
                    }
                } while (node = node.next);
            }
            
            return false; // Continue traversal
        });

        return [totalCount, magentaCount, cyanCount];
    }

    /**
     * Update bacteria for current time step
     */
    updateBacteria(timeStep, bacteriumData, visible, concentrations) {
        const layer = bacteriumData.get(timeStep) || [];
        
        // Reset state for new time step
        this.bacteriumPool.reset();
        this.buildQuadtree(layer);
        this.currentTimestepBacteria.clear();
        this.averageSimilarityWithNeighbors = 0;
        
        // Update each bacterium
        layer.forEach((data) => {
            const bacterium = this.bacteriumPool.getBacterium();
            this.updateBacterium(bacterium, data, 0, visible, concentrations);
            this.currentTimestepBacteria.add(data.ID);
            this.averageSimilarityWithNeighbors += bacterium.similarity;
        });

        // Calculate average similarity
        this.averageSimilarityWithNeighbors = layer.length > 0 
            ? this.averageSimilarityWithNeighbors / layer.length 
            : 0;
    }

    /**
     * Update a single bacterium
     */
    updateBacterium(bacterium, bacteriumData, zPosition, visible, concentrations) {
        const { x, y, longAxis, angle, ID, parent } = bacteriumData;
        const WIDTH = 100, HEIGHT = 60;
        
        // Get local concentration at bacterium position
        const idx = Math.round(y) * WIDTH + Math.round(x);
        const localConcentration = concentrations[idx];
        
        // Set position and rotation
        const adjustedPosition = new THREE.Vector3(x, y, 0);
        this.setBacteriumTransform(bacterium, adjustedPosition, angle, zPosition);
        
        this.bacteriumPool.updateGeometry(bacterium, longAxis);
        
        // Determine phenotype and update appearance
        const neighbors = this.countNeighbors(x, y);
        this.phenotypeManager.setPhenotypeBasedOnPhenotypeInheritance(
            bacterium, ID, neighbors, parent, localConcentration
        );

        // Set visibility
        bacterium.visible = visible;
    }

    /**
     * Set bacterium position and rotation
     */
    setBacteriumTransform(bacterium, position, angle, zPosition) {
        bacterium.position.set(position.x, position.y, zPosition);
        bacterium.rotation.z = angle * Math.PI; // 0 or PI means vertical, PI/2 means horizontal
    }

    // Delegate methods to phenotype manager
    getMagentaCount() {
        return this.phenotypeManager.getMagentaCount(this.currentTimestepBacteria);
    }

    getCyanCount() {
        return this.phenotypeManager.getCyanCount(this.currentTimestepBacteria);
    }

    getPositions() {
        return this.phenotypeManager.getPositions(this.currentTimestepBacteria);
    }

    getAverageSimilarityWithNeighbors() {
        return isNaN(this.averageSimilarityWithNeighbors) ? 0 : this.averageSimilarityWithNeighbors;
    }

    clearPhenotypeMemo() {
        this.phenotypeManager.clearPhenotypeMemo();
    }

    setSignalValue(value) {
        this.phenotypeManager.setSignalValue(value);
    }

    setAlphaValue(value) {
        this.phenotypeManager.setAlphaValue(value);
    }
}

/**
 * Manages a pool of bacterium objects for efficient reuse
 */
class BacteriumPool {
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
}

// Export functions for external use
export function createBacteriumSystem(scene) {
    return new BacteriumSystem(scene);
}

export function updateBacteria(bacteriumSystem, timeStep, bacteriumData, visible, concentrations) {
    bacteriumSystem.updateBacteria(timeStep, bacteriumData, visible, concentrations);
}

export function getMagentaCount(bacteriumSystem) {
    return bacteriumSystem.getMagentaCount();
}

export function getCyanCount(bacteriumSystem) {
    return bacteriumSystem.getCyanCount();
}

export function getPositions(bacteriumSystem) {
    return bacteriumSystem.getPositions();
}

export function clearPhenotypeMemo(bacteriumSystem) {
    bacteriumSystem.clearPhenotypeMemo();
}

export function setSignalValue(bacteriumSystem, value) {
    bacteriumSystem.setSignalValue(value);
}

export function setAlphaValue(bacteriumSystem, value) {
    bacteriumSystem.setAlphaValue(value);
}

export function getAverageSimilarityWithNeighbors(bacteriumSystem) {
    return bacteriumSystem.getAverageSimilarityWithNeighbors();
}

/**
 * Update history arrays with new data
 * @param {object} bacteriumSystem - The bacterium system instance
 * @param {number} totalCount - Total bacteria count
 * @param {number} magentaCount - Magenta bacteria count
 * @param {number} cyanCount - Cyan bacteria count
 * @param {number} averageSimilarity - Average similarity value
 */
export function updateHistories(bacteriumSystem, totalCount, magentaCount, cyanCount, averageSimilarity) {
    bacteriumSystem.historyManager.update(totalCount, magentaCount, cyanCount, averageSimilarity);
}

/**
 * Get all history arrays
 * @param {object} bacteriumSystem - The bacterium system instance
 * @returns {Object} Object containing all history arrays
 */
export function getHistories(bacteriumSystem) {
    return bacteriumSystem.historyManager.getHistories();
}

/**
 * Clear all history arrays
 * @param {object} bacteriumSystem - The bacterium system instance
 */
export function clearHistories(bacteriumSystem) {
    bacteriumSystem.historyManager.clear();
}
