/**
 * @fileoverview Manages the bacteria simulation by coordinating the phenotype determination, 
 * spatial positioning, and diffusion calculations. Provides a unified API for the main application
 * to interact with the simulation components.
 * 
 * This module serves as the primary interface between the rendering/UI layer and the
 * underlying simulation mechanisms, handling updates, state management, and data flow.
 */



import {
    determinePhenotypeAndSimilarity,
} from './phenotypeSimulation.js';
import { countNeighbors, buildGrid } from './grid.js';

import {ADI} from './diffusion.js';

let phenotypeManager = null;
let phenotypes = null;
let phenotypeMemo =null;
let currentBacteria;

function  processBacterium(bacteriumData, concentrations, phenotypeManager, phenotypes, phenotypeMemo) {
   
    const { x, y, longAxis, angle, ID, parent } = bacteriumData;
    const WIDTH = 100, HEIGHT = 60;
    
    // Get local concentration at bacterium position
    const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
    const localConcentration = concentrations[idx] || 0;
    
    // Create position as a plain object
    const position = { x, y, z: 0 };
    
    const neighbors = countNeighbors(x, y, phenotypeMemo, phenotypes);
    
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

export function updateBacteria(layer, concentrations) {
    currentBacteria = new Set();
    // Build the grid for spatial partitioning
    buildGrid(layer);
    currentBacteria.clear();
    
    // Process each bacterium
    const bacteriaData = [];
    layer.forEach((data) => {
        const singlebacteriumData = processBacterium(data, concentrations, phenotypeManager, phenotypes, phenotypeMemo);
        bacteriaData.push(singlebacteriumData);
        currentBacteria.add(data.ID);
    });

    
        
    // Return both the bacteria data and the calculated average similarity value
    return bacteriaData  
}


export function getGlobalParams(bacteriaData) {
    let magCount = 0;
    let cyanCount = 0;
    let averageSimilarity = 0;
    let totalCount = 0;
    bacteriaData.forEach((bacterium) => {
        const  ID = bacterium.id;
        const phenotype = phenotypeMemo.get(ID);
        if (phenotype === phenotypes.MAGENTA) {magCount++;} 
        else if (phenotype === phenotypes.CYAN) { cyanCount++;}
        averageSimilarity += bacterium.similarity || 0;
        totalCount++;
    } );
    averageSimilarity = (averageSimilarity / bacteriaData.length-0.5)*2 

    const globalParams = [
        totalCount,
        magCount,
        cyanCount,
        averageSimilarity,
    ];
    return globalParams;
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
    concentrationState,
        timeStep, // Time step duration in minutes (dt)
        subSteps // Number of substeps for ADI
    ) 
    {
    const WIDTH = appConfig.GRID.WIDTH;
    const HEIGHT = appConfig.GRID.HEIGHT;
    const DIFFUSION_RATE = appConfig.GRID.DIFFUSION_RATE;
    const currentConcentrationData = concentrationState.concentrationField
    const nextConcentrationData = concentrationState.concentrationField
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks;
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
    
    
}


export const getAdjustedCoordinates = (x, y, grid) => {
    // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
    let adjustedX = Math.round(x + grid.WIDTH / 2);
    let adjustedY = Math.round(y + grid.HEIGHT / 2);

    // Skip bacteria below the grid's bottom edge.
    if (adjustedY <= 0) {
        return null;
    }

    // Clamp coordinates to valid grid boundaries (leaving a 1-cell border).
    adjustedY = Math.min(adjustedY, grid.HEIGHT - 2); 
    adjustedX = Math.max(1, Math.min(adjustedX, grid.WIDTH - 2));

    // Calculate the 1D index corresponding to the 2D grid coordinates.
    const idx = adjustedY * grid.WIDTH + adjustedX;

    return { x: adjustedX, y: adjustedY, idx };
};

