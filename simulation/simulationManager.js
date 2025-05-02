import {processBacteria} from './phenotypeSimulation.js';
import { diffusionStep } from './diffusionManager.js';


let phenotypeManager = null;
let WIDTH;
let HEIGHT;

export function updateSimulation(currentBacteria, concentrationState, appConfig) {

    const concentration = concentrationState.concentrationField;

    const bacteriaDataUpdated = processBacteria(currentBacteria, concentration,phenotypeManager,HEIGHT,WIDTH);
    
    diffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager);
    
    const globalParams = getGlobalParams(bacteriaDataUpdated,phenotypeManager.phenotypes);

    return {bacteriaDataUpdated, globalParams};

}


function getGlobalParams(bacteriaData,phenotypes) {
    let magCount = 0;
    let cyanCount = 0;
    let averageSimilarity = 0;
    let totalCount = 0;
    bacteriaData.forEach((bacterium) => {
        const phenotype = bacterium.phenotype;
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
    
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    
        const minSignal = phenotypeManager.config.BACTERIUM.SIGNAL.MIN;
        const maxSignal = phenotypeManager.config.BACTERIUM.SIGNAL.MAX;
        phenotypeManager.signal = clamp(value, minSignal, maxSignal) ;
        console.log('Signal set to:', phenotypeManager.signal);
   
}

export function createBacteriumSystem(config) {
    phenotypeManager = {
        config,
        signal: config.BACTERIUM.SIGNAL.DEFAULT ,
        phenotypes: config.PHENOTYPES,
        phenotypeMemo: new Map()
    };
    Object.seal(phenotypeManager);
    Object.preventExtensions(phenotypeManager);
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
