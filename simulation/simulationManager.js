/**
 * @fileoverview Manages the bacteria simulation by coordinating the phenotype determination, 
 * spatial positioning, and diffusion calculations. Provides a unified API for the main application
 * to interact with the simulation components.
 * 
 * This module serves as the primary interface between the rendering/UI layer and the
 * underlying simulation mechanisms, handling updates, state management, and data flow.
 */
import { quadtree } from 'd3-quadtree';

import { 
    setSignalValue as setSignalValueFn,
    setAlphaValue as setAlphaValueFn,
    determinePhenotypeAndSimilarity,
    getMagentaCount as getMagentaCountFn,
    getCyanCount as getCyanCountFn,
    getPositions as getPositionsFn,
    clearPhenotypeMemo as clearPhenotypeMemoFn
} from './bacteriumSimulation.js';

import { BacteriumData } from './bacteriumData.js';
import {ADI} from './diffusion.js';

/**
 * Main bacterium system class that handles simulation logic only
 * @class
 * @classdesc Manages the simulation of bacterial colony behavior, including spatial relationships
 * and phenotype determination. Acts as the core simulation engine independent from rendering.
 */
export class BacteriumSystem {
    /**
     * Creates a new bacterium system with the provided configuration
     * @param {Object} config - Configuration object containing simulation parameters
     * @param {Object} config.PHENOTYPES - Phenotype definitions (MAGENTA, CYAN)
     * @param {Object} config.BACTERIUM - Bacterium-related configuration parameters
     * @param {number} config.BACTERIUM.NEIGHBOR_RADIUS - Radius for neighbor detection
     * @param {Object} phenotypeManager - Pre-created phenotype manager object with state information
     */
    constructor(config, phenotypeManager) {
        this.config = config;
        this.phenotypes = config.PHENOTYPES; // Extract phenotypes from config
        this.quadtree = null;
        this.currentTimestepBacteria = new Set();
        this.phenotypeManager = phenotypeManager;
        this.averageSimilarityWithNeighbors = 0;
    }

    /**
     * Clean up resources and reset internal state
     * @method
     */
    dispose() {
        // Reset all state
        clearPhenotypeMemoFn(this.phenotypeManager);
        this.quadtree = null;
        this.currentTimestepBacteria.clear();
        this.averageSimilarityWithNeighbors = 0;
    }

    /**
     * Build quadtree for efficient spatial queries of bacteria positions
     * @param {Array<Object>} layer - Array of bacteria objects for the current time step
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
     * Count neighbors by phenotype within the configured radius
     * @param {number} x - X coordinate to search from
     * @param {number} y - Y coordinate to search from
     * @returns {Array<number>} Array containing [totalCount, magentaCount, cyanCount]
     */
    countNeighbors(x, y) {
        const neighborRadius = this.config.BACTERIUM.NEIGHBOR_RADIUS;
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
                            
                            if (phenotype && phenotype === this.phenotypes.MAGENTA) {
                                magentaCount++;
                            } else if (phenotype && phenotype === this.phenotypes.CYAN) {
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
     * @param {number} timeStep - The current simulation time step
     * @param {Map<number, Array<Object>>} bacteriumData - Map of bacteria data keyed by time step
     * @param {boolean} visible - Whether bacteria should be visible
     * @param {Float32Array} concentrations - Concentration values across the grid
     * @returns {Array<BacteriumData>} Array of bacterium data objects for rendering
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
     * @param {Object} bacteriumData - Raw bacterium data from the input dataset
     * @param {number} bacteriumData.x - X position of the bacterium
     * @param {number} bacteriumData.y - Y position of the bacterium
     * @param {number} bacteriumData.longAxis - Length of the bacterium's long axis
     * @param {number} bacteriumData.angle - Rotation angle of the bacterium
     * @param {bigint} bacteriumData.ID - Unique identifier for the bacterium
     * @param {bigint} [bacteriumData.parent] - ID of the parent bacterium if available
     * @param {boolean} visible - Whether the bacterium should be visible
     * @param {Float32Array} concentrations - Concentration values across the grid
     * @returns {BacteriumData} Processed bacterium data ready for rendering
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
        const phenotypeInfo = determinePhenotypeAndSimilarity(
            this.phenotypeManager, ID, neighbors, parent, localConcentration
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

    /**
     * Gets the count of bacteria with magenta phenotype
     * @returns {number} Count of bacteria with magenta phenotype
     */
    getMagentaCount() {
        return getMagentaCountFn(this.phenotypeManager, this.currentTimestepBacteria);
    }

    /**
     * Gets the count of bacteria with cyan phenotype
     * @returns {number} Count of bacteria with cyan phenotype
     */
    getCyanCount() {
        return getCyanCountFn(this.phenotypeManager, this.currentTimestepBacteria);
    }

    /**
     * Gets the positions of bacteria by phenotype
     * @returns {Array<Array<bigint>>} Array containing [magentaPositions, cyanPositions]
     */
    getPositions() {
        return getPositionsFn(this.phenotypeManager, this.currentTimestepBacteria);
    }

    /**
     * Clears the phenotype memoization cache
     */
    clearPhenotypeMemo() {
        clearPhenotypeMemoFn(this.phenotypeManager);
    }

    /**
     * Sets the signal value used in phenotype determination
     * @param {number} value - The new signal value (typically 0-1 range)
     */
    setSignalValue(value) {
        setSignalValueFn(this.phenotypeManager, value);
    }

    /**
     * Sets the alpha (temperature) value used in phenotype determination
     * @param {number} value - The new alpha value (typically small, e.g., 0.0001)
     */
    setAlphaValue(value) {
        setAlphaValueFn(this.phenotypeManager, value);
    }


    /**
     * Gets the average similarity value among neighboring bacteria
     * @returns {number} The average similarity value (0-1 range)
     */
    getAverageSimilarityWithNeighbors() {
        return isNaN(this.averageSimilarityWithNeighbors) ? 0 : this.averageSimilarityWithNeighbors;
    }

}

/**
 * Performs diffusion calculation using the Alternating Direction Implicit (ADI) method.
 * This function delegates the actual calculation to the ADI function from diffusion.js.
 * 
 * @param {number} WIDTH - The width of the simulation grid
 * @param {number} HEIGHT - The height of the simulation grid
 * @param {Float32Array} currentConcentrationData - Array of current concentration values
 * @param {Float32Array} nextConcentrationData - Array to store the next concentration values
 * @param {Float32Array} sources - Array of diffusion source values
 * @param {Float32Array} sinks - Array of diffusion sink values
 * @param {number} DIFFUSION_RATE - Coefficient that determines the diffusion speed
 * @param {number} timeStep - Time step duration in minutes
 * @param {number} subSteps - Number of ADI iterations to perform per step
 * @returns {Array<Float32Array>} Updated concentration arrays [currentData, nextData]
 */
export function diffuse(
        WIDTH, HEIGHT,
        currentConcentrationData, nextConcentrationData, // Input concentration arrays
        sources, sinks, // Input source/sink arrays
        DIFFUSION_RATE, // Diffusion coefficient
        timeStep, // Time step duration in minutes (dt)
        subSteps // Number of substeps for ADI
    ) 
    {
        return ADI(
                WIDTH, HEIGHT,
                currentConcentrationData, nextConcentrationData, // Input concentration arrays
                sources, sinks, // Input source/sink arrays
                DIFFUSION_RATE, // Diffusion coefficient
                timeStep, // Time step duration in minutes (dt)
                subSteps // Number of substeps for ADI
            );
    
}

// Export functions for external use - these maintain the same API as before

/**
 * Creates a new bacterium system instance
 * @param {Object} config - Configuration object for the bacterium system
 * @returns {BacteriumSystem} A new bacterium system instance
 */
export function createBacteriumSystem(config) {
    // Create phenotype state internally
    const phenotypeState = {
        config,
        phenotypes: config.PHENOTYPES,
        phenotypeMemo: new Map(),
        signal: config.BACTERIUM.SIGNAL.DEFAULT / 100,
        alpha: config.BACTERIUM.ALPHA.DEFAULT
    };
    
    return new BacteriumSystem(config, phenotypeState);
}

/**
 * Updates bacteria for the current time step and returns data for rendering
 * @param {BacteriumSystem} bacteriumSystem - The bacterium system instance
 * @param {number} timeStep - The current simulation time step
 * @param {Map<number, Array<Object>>} bacteriumData - Map of bacteria data keyed by time step
 * @param {boolean} visible - Whether bacteria should be visible
 * @param {Float32Array} concentrations - Concentration values across the grid
 * @returns {Array<BacteriumData>} Array of bacterium data objects for rendering
 */
export function updateBacteria(bacteriumSystem, timeStep, bacteriumData, visible, concentrations) {
    return bacteriumSystem.updateBacteria(timeStep, bacteriumData, visible, concentrations);
}

/**
 * Updates historical tracking data with current bacteria metrics and returns the metrics.
 * Consolidates multiple related metrics into a single function call.
 * 
 * @param {BacteriumSystem} bacteriumSystem - The bacterium system instance
 * @param {number} totalCount - Total bacteria count
 * @returns {Object} Object containing the calculated metrics
 */
export function updateBacteriumMetrics(bacteriumSystem, totalCount) {
    // Get counts internally rather than requiring them as parameters
    const magentaCount = bacteriumSystem.getMagentaCount();
    const cyanCount = bacteriumSystem.getCyanCount();
    
    // Calculate similarity internally
    const averageSimilarity = bacteriumSystem.getAverageSimilarityWithNeighbors();
    const scaledSimilarity = (averageSimilarity - 0.5) * 2800;
    
    // Return the calculated values if needed elsewhere
    return {
        magentaCount,
        cyanCount,
        averageSimilarity,
        scaledSimilarity
    };
}

/**
 * Gets the count of bacteria with magenta phenotype
 * @param {BacteriumSystem} bacteriumSystem - The bacterium system instance
 * @returns {number} Count of bacteria with magenta phenotype
 */
export function getMagentaCount(bacteriumSystem) {
    return bacteriumSystem.getMagentaCount();
}

/**
 * Gets the count of bacteria with cyan phenotype
 * @param {BacteriumSystem} bacteriumSystem - The bacterium system instance
 * @returns {number} Count of bacteria with cyan phenotype
 */
export function getCyanCount(bacteriumSystem) {
    return bacteriumSystem.getCyanCount();
}

/**
 * Gets the positions of bacteria by phenotype
 * @param {BacteriumSystem} bacteriumSystem - The bacterium system instance
 * @returns {Array<Array<bigint>>} Array containing [magentaPositions, cyanPositions]
 */
export function getPositions(bacteriumSystem) {
    return bacteriumSystem.getPositions();
}

