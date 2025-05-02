
import {determinePhenotype,} from './phenotypeSimulation.js';
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
   
    const { x, y, longAxis, angle, ID, parent, randomSwitch } = bacteriumData;
    
    const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
    const localConcentration = concentrations[idx] || 0;

    if (!phenotypeMemo.has(ID)) {
        phenotypeMemo.set(ID, phenotypeMemo.get(ID/2n));
    }

    let phenotype =  phenotypeMemo.get(ID);
    if (!randomSwitch) {
    phenotype = determinePhenotype(
        phenotypeManager,phenotypes,phenotypeMemo, ID, parent, localConcentration
    );
    phenotypeMemo.set(ID, phenotype);
    } else if (randomSwitch) {
        phenotype = phenotype === phenotypes.MAGENTA ? phenotypes.CYAN : phenotypes.MAGENTA;
        phenotypeMemo.set(ID, phenotype);
    }


      const [totalNeighbors, magentaNeighbors, cyanNeighbors] = countNeighbors(x, y, phenotypeMemo, phenotypes);
      const magentaProportion = magentaNeighbors / totalNeighbors;
      const cyanProportion = cyanNeighbors / totalNeighbors;
      const similarity = phenotype === phenotypes.MAGENTA 
          ? magentaProportion 
          : cyanProportion;
    
    return {
        id:ID,
        x:x,
        y:y,
        angle:angle,
        longAxis:longAxis,
        phenotype:phenotype,
        magentaProportion,
        cyanProportion,
        similarity,
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

export function setValue(value) {
   
    
    // Ensure value is a number
    const numValue = Number(value);

    
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    
        const minSignal = phenotypeManager.config.BACTERIUM.SIGNAL.MIN;
        const maxSignal = phenotypeManager.config.BACTERIUM.SIGNAL.MAX;
        phenotypeManager.signal = clamp(numValue, minSignal, maxSignal) / 100;
        console.log('Signal set to:', phenotypeManager.signal);
   
}

export function createBacteriumSystem(config) {
    phenotypes = config.PHENOTYPES;
    phenotypeMemo = new Map();
    phenotypeManager = {
        config,
        signal: config.BACTERIUM.SIGNAL.DEFAULT / 100,
    };
    Object.seal(phenotypeManager);
    Object.preventExtensions(phenotypeManager);
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
