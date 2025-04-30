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
    determinePhenotypeAndSimilarity,
} from './phenotypeSimulation.js';

import {ADI} from './diffusion.js';

let phenotypeManager = null;
let phenotypes = null;
let phenotypeMemo =null;
const currentBacteria = new Set();
let averageSimilarityWithNeighbors = 0;


class BacteriumSystem {
   
    constructor(config) {
        this.config = config;
        this.quadtree = null;
    }


 
    buildQuadtree(layer) {
        this.quadtree = quadtree()
            .x(d => d.x)
            .y(d => d.y);
        
        layer.forEach(data => {
            this.quadtree.add(data);
        });
    }

 
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
                            const phenotype = phenotypeMemo.get(node.data.ID);
                            
                            if (phenotype && phenotype === phenotypes.MAGENTA) {
                                magentaCount++;
                            } else if (phenotype && phenotype === phenotypes.CYAN) {
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


    updateBacteria(layer, concentrations) {
        
        // Reset state for new time step
        this.buildQuadtree(layer);
        currentBacteria.clear();
        averageSimilarityWithNeighbors = 0;
        
        // Process each bacterium
        const bacteriaData = [];
        layer.forEach((data) => {
            const singlebacteriumData = this.processBacterium(data, concentrations);
            bacteriaData.push(singlebacteriumData);
            currentBacteria.add(data.ID);
            averageSimilarityWithNeighbors += singlebacteriumData.similarity || 0;
        });

        // Calculate average similarity
        averageSimilarityWithNeighbors = layer.length > 0 
            ? (averageSimilarityWithNeighbors / layer.length-0.5)*2 
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
            phenotypeManager,phenotypes,phenotypeMemo, ID, neighbors, parent, localConcentration
        );
        
        // Return data object for rendering
        return {
            id:ID,
            position:position,
            angle:angle,
            longAxis:longAxis,
            phenotype:phenotypeInfo[0],
            magentaProportion:phenotypeInfo[1],
            cyanProportion:phenotypeInfo[2],
            similarity:phenotypeInfo[3],
        };
            
      
    }


}


export function updateBacteria(timeStep, bacteriumData, concentrations) {
    const layer = bacteriumData.get(timeStep) || [];
    
    // Reset state for new time step
    this.buildQuadtree(layer);
    currentBacteria.clear();
    averageSimilarityWithNeighbors = 0;
    
    // Process each bacterium
    const bacteriaData = [];
    layer.forEach((data) => {
        const bacteriumData = this.processBacterium(data, concentrations);
        bacteriaData.push(bacteriumData);
        currentBacteria.add(data.ID);
        averageSimilarityWithNeighbors += bacteriumData.similarity || 0;
    });

    // Calculate average similarity
    averageSimilarityWithNeighbors = layer.length > 0 
        ? (averageSimilarityWithNeighbors / layer.length-0.5)*2 
        : 0;
        
    return bacteriaData;
}




export  function   getGlobalParams() {
    let magCount = 0;
    let cyanCount = 0;
    for (const ID of currentBacteria) {
        const phenotype = phenotypeMemo.get(ID);
        if (phenotype === phenotypes.MAGENTA) {magCount++;} 
        else if (phenotype === phenotypes.CYAN) { cyanCount++;}
    }
    const averageSimilarity = isNaN(averageSimilarityWithNeighbors) ? 0 : averageSimilarityWithNeighbors;
    return [magCount, cyanCount, averageSimilarity];
}

export function getPositions() {
    const magentaPositions = [];
    const cyanPositions = [];

Array.from(currentBacteria).forEach((ID) => {
    const phenotype =phenotypeMemo.get(ID);
    if (!phenotype) return;
    
    if (phenotype === phenotypes.MAGENTA) {
        magentaPositions.push(ID);
    } else if (phenotype === phenotypes.CYAN) {
        cyanPositions.push(ID);
    }
});

return [magentaPositions, cyanPositions];
}


export function setValue(value, param) {
    // Check if phenotypeManager is initialized
    if (!phenotypeManager || !phenotypeManager.config) {
        console.error('phenotypeManager is not initialized');
        return;
    }
    
    // Ensure value is a number
    const numValue = Number(value);

    
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    
    if (param === 'signal') {
        const minSignal = phenotypeManager.config.BACTERIUM.SIGNAL.MIN;
        const maxSignal = phenotypeManager.config.BACTERIUM.SIGNAL.MAX;
        phenotypeManager.signal = clamp(numValue, minSignal, maxSignal) / 100;
        console.log('Signal set to:', phenotypeManager.signal);
    } else if (param === 'alpha') {
        const minAlpha = phenotypeManager.config.BACTERIUM.ALPHA.MIN;
        const maxAlpha = phenotypeManager.config.BACTERIUM.ALPHA.MAX;
        phenotypeManager.alpha = clamp(numValue, minAlpha, maxAlpha);
        console.log('Alpha set to:', phenotypeManager.alpha);
    } else {
        console.error(`Unknown parameter: ${param}`);
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
    phenotypes = config.PHENOTYPES;
    phenotypeMemo = new Map();
    phenotypeManager = {
        config,
        signal: config.BACTERIUM.SIGNAL.DEFAULT / 100,
        alpha: config.BACTERIUM.ALPHA.DEFAULT
    };
    
    return new BacteriumSystem(config);
}


