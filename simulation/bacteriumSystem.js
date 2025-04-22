import { quadtree } from 'd3-quadtree';
import { CONFIG } from '../config.js';

import { 
    PhenotypeManager, 
    HistoryManager, 
    PHENOTYPES 
} from './bacteriumSimulation.js';

import { BacteriumData } from './bacteriumData.js';

/**
 * Main bacterium system class that handles simulation logic only
 */
export class BacteriumSystem {
    constructor() {
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
                            
                            // Replace .equals() with === for string comparison
                            if (phenotype && phenotype === PHENOTYPES.MAGENTA) {
                                magentaCount++;
                            } else if (phenotype && phenotype === PHENOTYPES.CYAN) {
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
     * Update bacteria for current time step and return data for rendering
     * @returns {BacteriumData[]} Array of bacterium data objects for rendering
     */
    updateBacteria(timeStep, bacteriumData, visible, concentrations) {
        const layer = bacteriumData.get(timeStep) || [];
        
        // Reset state for new time step
        this.buildQuadtree(layer);
        this.currentTimestepBacteria.clear();
        this.averageSimilarityWithNeighbors = 0;
        
        // Process each bacterium
        const bacteriaData = [];
        layer.forEach((data) => {
            const bacteriumData = this.processBacterium(data, visible, concentrations);
            bacteriaData.push(bacteriumData);
            this.currentTimestepBacteria.add(data.ID);
            this.averageSimilarityWithNeighbors += bacteriumData.similarity || 0;
        });

        // Calculate average similarity
        this.averageSimilarityWithNeighbors = layer.length > 0 
            ? this.averageSimilarityWithNeighbors / layer.length 
            : 0;
            
        return bacteriaData;
    }

    /**
     * Process a single bacterium and return data for rendering
     */
    processBacterium(bacteriumData, visible, concentrations) {
        const { x, y, longAxis, angle, ID, parent } = bacteriumData;
        const WIDTH = 100, HEIGHT = 60;
        
        // Get local concentration at bacterium position
        const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
        const localConcentration = concentrations[idx] || 0;
        
        // Create position as a plain object
        const position = { x, y, z: 0 };
        
        // Get neighbors for this bacterium
        const neighbors = this.countNeighbors(x, y);
        
        // Determine phenotype and calculate similarity
        const phenotypeInfo = this.phenotypeManager.determinePhenotypeAndSimilarity(
            ID, neighbors, parent, localConcentration
        );
        
        // Return data object for rendering
        return new BacteriumData(
            ID,
            position,
            angle,
            longAxis,
            phenotypeInfo.phenotype,
            phenotypeInfo.magentaProportion,
            phenotypeInfo.cyanProportion,
            phenotypeInfo.similarity,
            visible
        );
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
export function createBacteriumSystem() {
    return new BacteriumSystem();
}

export function updateBacteria(bacteriumSystem, timeStep, bacteriumData, visible, concentrations) {
    return bacteriumSystem.updateBacteria(timeStep, bacteriumData, visible, concentrations);
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
