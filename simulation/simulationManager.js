/**
 * @fileoverview Manages the bacteria simulation by coordinating the phenotype determination, 
 * spatial positioning, and diffusion calculations. Provides a unified API for the main application
 * to interact with the simulation components.
 * 
 * This module serves as the primary interface between the rendering/UI layer and the
 * underlying simulation mechanisms, handling updates, state management, and data flow.
 */



import {determinePhenotypeAndSimilarity,} from './phenotypeSimulation.js';
import { countNeighbors, buildGrid , getAdjustedCoordinates} from './grid.js'; 
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

export function updateSimulation(layer, concentrationState,appConfig) {
    currentBacteria = new Set();
    // Build the grid for spatial partitioning
    buildGrid(layer);
    currentBacteria.clear();
    
    // Process each bacterium
    const bacteriaDataUpdated = [];
    layer.forEach((data) => {
        const singlebacteriumData = processBacterium(data, concentrationState.concentrationField, phenotypeManager, phenotypes, phenotypeMemo);
        bacteriaDataUpdated.push(singlebacteriumData);
        currentBacteria.add(data.ID);
    });

    diffusionStep(layer,concentrationState,appConfig);

    const globalParams = getGlobalParams(bacteriaDataUpdated);

        
    return {bacteriaDataUpdated, globalParams};
}


function getGlobalParams(bacteriaData) {
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

function getIDsByColor() {
    const magentaIDs = [];
    const cyanIDs = [];

Array.from(currentBacteria).forEach((ID) => {
    const phenotype =phenotypeMemo.get(ID);
    if (!phenotype) return;
    
    if (phenotype === phenotypes.MAGENTA) {
        magentaIDs.push(ID);
    } else if (phenotype === phenotypes.CYAN) {
        cyanIDs.push(ID);
    }
});

return [magentaIDs, cyanIDs];
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
function diffuse(
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


const diffusionStep = (currentBacteria,concentrationState,appConfig) => {
    const GRID = appConfig.GRID;
    const IDsByColor = getIDsByColor();
    updateSourcesAndSinks(currentBacteria,concentrationState,...IDsByColor,GRID);
    [concentrationState.concentrationField] = diffuse(
        appConfig,
        concentrationState,
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

}


const updateSourcesAndSinks = (currentBacteria,concentrationState,magentaIDsRaw,cyanIDsRaw,GRID) => {
    const MagentaIDs = new Set(magentaIDsRaw);
    const CyanIDs = new Set(cyanIDsRaw);

    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);

    // Iterate through each bacterium in the current time step
    for (const bacterium of currentBacteria) {
        // Convert bacterium's position to grid coordinates and index using appConfig.GRID
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID);

        // Skip if the bacterium is outside the valid grid area
        if (!coords) console.warn(`Bacterium ${bacterium.ID} is out of bounds `)

        // Increment source count if the bacterium is Magenta
        if (MagentaIDs.has(bacterium.ID)) {
            concentrationState.sources[coords.idx] += 1; // Simple count for now
        }

        // Increment sink count if the bacterium is Cyan
        if (CyanIDs.has(bacterium.ID)) {
            concentrationState.sinks[coords.idx] += 1; // Simple count for now
        }
    }
};





