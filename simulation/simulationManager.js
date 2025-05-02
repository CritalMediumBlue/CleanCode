import {updateBacteriaPhenotypes,calculateSimilarities} from './phenotypeSimulation.js';
import { diffusionStep } from './diffusionManager.js';
import { updateBacteriaCytoplasm, calculateCorrelations } from './citoplasmSimulation.js';


let phenotypeManager = null;
let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
const mode = 'discrete'; // or 'discrete'

export function updateSimulation(currentBacteria, concentrationState, appConfig) {

    const concentration = concentrationState.concentrationField;
    let bacteriaWithInformation;
    let bacteriaDataUpdated;
    
    switch (mode) {
        case 'continuous':
            bacteriaWithInformation = updateBacteriaCytoplasm(currentBacteria, concentration,cytoplasmManager);
            bacteriaDataUpdated = calculateCorrelations(bacteriaWithInformation,cytoplasmManager);
            break;
        case 'discrete':
            bacteriaWithInformation = updateBacteriaPhenotypes(currentBacteria, concentration,phenotypeManager,HEIGHT,WIDTH);
            bacteriaDataUpdated = calculateSimilarities(bacteriaWithInformation,phenotypeManager);
            break;
    }   


    concentrationState.concentrationField = diffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager);
    
    return bacteriaDataUpdated;

}


export function getGlobalParams(bacteriaData) {
    let magCount = 0;
    let cyanCount = 0;
    let averageSimilarity = 0;
    let totalCount = 0;
    const phenotypes = phenotypeManager.phenotypes;
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
