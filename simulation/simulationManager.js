
import {determinePhenotypeAndSimilarity,} from './phenotypeSimulation.js';
import { countNeighbors, buildGrid } from './grid.js'; 
import { diffusionStep } from './diffusionManager.js';

let phenotypeManager = null;
let phenotypes = null;
let phenotypeMemo =null;
let WIDTH;
let HEIGHT;



export function updateSimulation(currentBacteria, concentrationState,appConfig) {
    const bacteriaDataUpdated = [];
    buildGrid(currentBacteria);
    
    currentBacteria.forEach((bacterium) => {
        const updatedBacterium = processBacterium(bacterium, concentrationState.concentrationField);
        bacteriaDataUpdated.push(updatedBacterium);
    });

    diffusionStep(currentBacteria, concentrationState, appConfig, phenotypeMemo, phenotypes);

    const globalParams = getGlobalParams(bacteriaDataUpdated);
        
    return {bacteriaDataUpdated, globalParams};
}

function  processBacterium(bacteriumData, concentrations) {
   
    const { x, y, longAxis, angle, ID, parent } = bacteriumData;
    
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

export function createBacteriumSystem(config) {
    phenotypes = config.PHENOTYPES;
    phenotypeMemo = new Map();
    phenotypeManager = {
        config,
        signal: config.BACTERIUM.SIGNAL.DEFAULT / 100,
        alpha: config.BACTERIUM.ALPHA.DEFAULT
    };
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
