/**
 * @fileoverview Manages the bacteria simulation by coordinating the phenotype determination, 
 * spatial positioning, and diffusion calculations. Provides a unified API for the main application
 * to interact with the simulation components.
 * 
 * This module serves as the primary interface between the rendering/UI layer and the
 * underlying simulation mechanisms, handling updates, state management, and data flow.
 */
import { quadtree } from 'd3-quadtree';



import {updateBacteria} from './updateBacteria.js';

import {ADI} from './diffusion.js';

let phenotypeManager = null;
let phenotypes = null;
let phenotypeMemo =null;
const currentBacteria = new Set();
let averageSimilarityWithNeighbors = 0;





export  function   getGlobalParams(layer,currentConcentrationData) {
    let magCount = 0;
    let cyanCount = 0;
    for (const ID of currentBacteria) {
        const phenotype = phenotypeMemo.get(ID);
        if (phenotype === phenotypes.MAGENTA) {magCount++;} 
        else if (phenotype === phenotypes.CYAN) { cyanCount++;}
    }
    
    // Call updateBacteria and extract both bacteriaData and averageSimilarity
    const { bacteriaData, averageSimilarity } = updateBacteria(layer, currentConcentrationData, quadtree, currentBacteria, phenotypeManager, phenotypeMemo, phenotypes);
    
    // Use the averageSimilarity directly from updateBacteria's return value
    const globalParams = {
        magCount,
        cyanCount,
        averageSimilarity,
    };
    
    return {
        globalParams,
        bacData: bacteriaData
    };
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
    
    
}


