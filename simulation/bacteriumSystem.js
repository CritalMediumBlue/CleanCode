import * as THREE from 'three';
import { quadtree } from 'd3-quadtree';
import { CONFIG } from '../config.js';

// Import from the refactored modules
import { BacteriumPool, updateBacteriumColor, setBacteriumTransform, createBacteriumPool } from '../scene/bacteriumRenderer.js';
import { 
    PhenotypeManager, 
    HistoryManager, 
    PHENOTYPES 
} from './bacteriumSimulation.js';

/**
 * Main bacterium system class that coordinates between simulation and rendering
 */
export class BacteriumSystem {
    constructor(scene) {
        this.scene = scene;
        this.bacteriumPool = createBacteriumPool(scene);
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
        // Dispose of bacterium pool
        if (this.bacteriumPool) {
            this.bacteriumPool.dispose();
        }

        // Reset all state
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
            this.averageSimilarityWithNeighbors += bacterium.similarity || 0;
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
        const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
        const localConcentration = concentrations[idx] || 0;
        
        // Set position and rotation
        const adjustedPosition = new THREE.Vector3(x, y, 0);
        setBacteriumTransform(bacterium, adjustedPosition, angle, zPosition);
        
        this.bacteriumPool.updateGeometry(bacterium, longAxis);
        
        // Get neighbors for this bacterium
        const neighbors = this.countNeighbors(x, y);
        
        // Determine phenotype and calculate similarity
        const phenotypeInfo = this.phenotypeManager.determinePhenotypeAndSimilarity(
            ID, neighbors, parent, localConcentration
        );
        
        // Update bacterium color based on phenotype information
        updateBacteriumColor(
            bacterium, 
            phenotypeInfo.phenotype, 
            phenotypeInfo.magentaProportion, 
            phenotypeInfo.cyanProportion
        );
        
        // Store similarity for later calculations
        bacterium.similarity = phenotypeInfo.similarity;
        
        // Set visibility
        bacterium.visible = visible;
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

// Export functions for external use - these maintain the same API as before
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
