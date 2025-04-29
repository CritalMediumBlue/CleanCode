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
class BacteriumSystem {
   
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


    updateBacteria(timeStep, bacteriumData, concentrations) {
        const layer = bacteriumData.get(timeStep) || [];
        
        // Reset state for new time step
        this.buildQuadtree(layer);
        this.currentTimestepBacteria.clear();
        this.averageSimilarityWithNeighbors = 0;
        
        // Process each bacterium
        const bacteriaData = [];
        layer.forEach((data) => {
            const bacteriumData = this.processBacterium(data, concentrations);
            bacteriaData.push(bacteriumData);
            this.currentTimestepBacteria.add(data.ID);
            this.averageSimilarityWithNeighbors += bacteriumData.similarity || 0;
        });

        // Calculate average similarity
        this.averageSimilarityWithNeighbors = layer.length > 0 
            ? (this.averageSimilarityWithNeighbors / layer.length-0.5)*2 
            : 0;
            
        return bacteriaData;
    }

  
    processBacterium(bacteriumData, concentrations) {
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
            
        );
    }

    getGlobalParams() {
        const  magCount = getMagentaCountFn(this.phenotypeManager, this.currentTimestepBacteria);
        const  cyanCount = getCyanCountFn(this.phenotypeManager, this.currentTimestepBacteria);
        const  averageSimilarity = isNaN(this.averageSimilarityWithNeighbors) ? 0 : this.averageSimilarityWithNeighbors;
        return [magCount, cyanCount, averageSimilarity];
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

    setValue(value,param){
        if (param === 'signal') {
            setSignalValueFn(this.phenotypeManager, value);
        } else if (param === 'alpha') {
            setAlphaValueFn(this.phenotypeManager, value);
        }
    }

    /**
     * Sets the alpha (temperature) value used in phenotype determination
     * @param {number} value - The new alpha value (typically small, e.g., 0.0001)
     */
    setAlphaValue(value) {
        setAlphaValueFn(this.phenotypeManager, value);
    }


}


export function diffuse(
    appConfig,
    dataState,
        timeStep, // Time step duration in minutes (dt)
        subSteps // Number of substeps for ADI
    ) 
    {
    const WIDTH = appConfig.GRID.WIDTH;
    const HEIGHT = appConfig.GRID.HEIGHT;
    const DIFFUSION_RATE = appConfig.GRID.DIFFUSION_RATE;
    const currentConcentrationData = dataState.currentConcentrationData;
    const nextConcentrationData = dataState.nextConcentrationData;
    const sources = dataState.sources;
    const sinks = dataState.sinks;
        return ADI(
                WIDTH, HEIGHT,
                currentConcentrationData, nextConcentrationData, // Input concentration arrays
                sources, sinks, // Input source/sink arrays
                DIFFUSION_RATE, // Diffusion coefficient
                timeStep, // Time step duration in minutes (dt)
                subSteps // Number of substeps for ADI
            );
    
}



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


