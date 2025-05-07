import {updateBacteriaPhenotypes,calculateSimilarities} from './DiscretePhenotypeSimulation.js';
import { prepareDiffusionStep} from './diffusionManager.js';
import { diffuse } from './diffusionStep.js';
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
            bacteriaDataUpdated = calculateCorrelations(bacteriaWithInformation,cytoplasmManager);
            globalParams = getGlobalParamsCont(bacteriaDataUpdated);
            prepareDiffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager,cytoplasmManager);
            diffuse(appConfig, concentrationState,1,1)

            break;
        case 'discrete':
            bacteriaWithInformation = updateBacteriaPhenotypes(currentBacteria, concentration,phenotypeManager,HEIGHT,WIDTH,changed);
            bacteriaDataUpdated = calculateSimilarities(bacteriaWithInformation,phenotypeManager);
            globalParams = getGlobalParams(bacteriaDataUpdated);
            prepareDiffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager);
            diffuse(appConfig, concentrationState,1,1)

            break;
    }   


    
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

    let totalAimP = 0;
    let totalAimR = 0;
    let extracellulatAimP = 0.5;
    let totalCount = 0;

    bacteriaData.forEach((bacterium) => {
        const aimP = bacterium.cytoplasmConcentrations.p
        const aimR = bacterium.cytoplasmConcentrations.r
        totalAimP+=aimP
        totalAimR+=aimR
        totalCount++;
    } );
    

    const globalParams = [
        totalCount,
        totalAimR,
        totalAimP,
        extracellulatAimP,
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
