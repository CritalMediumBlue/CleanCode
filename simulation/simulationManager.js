import {updateBacteriaPhenotypes,calculateSimilarities} from './DiscretePhenotypeSimulation.js';
import { diffusionStep } from './diffusionManager.js';
import { updateBacteriaCytoplasm, calculateCorrelations } from './ContinuousPhenotypeSimulation.js';


let phenotypeManager = null;
let changed;
let cytoplasmManager = null;
let WIDTH;
let HEIGHT;
const mode = 'continuous'; // or 'discrete'

export function updateSimulation(currentBacteria, concentrationState, appConfig) {

    const concentration = concentrationState.concentrationField;
    let bacteriaWithInformation;
    let bacteriaDataUpdated;
    let globalParams = null;
    
    switch (mode) {
        case 'continuous':
            bacteriaWithInformation = updateBacteriaCytoplasm(currentBacteria, concentration,cytoplasmManager,HEIGHT,WIDTH,changed);
            bacteriaDataUpdated = bacteriaWithInformation;//calculateCorrelations(bacteriaWithInformation,cytoplasmManager);
            globalParams = getGlobalParamsCont(bacteriaDataUpdated);
            break;
        case 'discrete':
            bacteriaWithInformation = updateBacteriaPhenotypes(currentBacteria, concentration,phenotypeManager,HEIGHT,WIDTH,changed);
            bacteriaDataUpdated = calculateSimilarities(bacteriaWithInformation,phenotypeManager);
            globalParams = getGlobalParams(bacteriaDataUpdated);
            break;
    }   


    concentrationState.concentrationField = diffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager);
    
    return {
        bacteriaDataUpdated,
        globalParams
    };

}


 function getGlobalParams(bacteriaData) {

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
function getGlobalParamsCont(bacteriaData) {

    let magCount = 1.2+(Math.random()-0.5)*0.1;
    let cyanCount = 1.3+(Math.random()-0.5)*0.1;
    let averageSimilarity = 0.5+(Math.random()-0.5)*0.1;
    let totalCount = 2.5+(Math.random()-0.5)*0.1;
    
    const globalParams = [
        Math.round(totalCount),
        Math.round(magCount),
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
    changed = new Map();
    cytoplasmManager = {
        signal: config.BACTERIUM.SIGNAL.DEFAULT ,
        pConcentrationMemo: new Map(),
        rConcentrationMemo: new Map()
    };
    Object.seal(cytoplasmManager);
    Object.preventExtensions(cytoplasmManager);
    Object.seal(phenotypeManager);
    Object.preventExtensions(phenotypeManager);
    WIDTH = config.GRID.WIDTH;
    HEIGHT = config.GRID.HEIGHT;
}
