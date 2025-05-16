import { diffuse } from './diffusionStep.js';;
import { getAdjustedCoordinates } from './grid.js';
export function prepareDiffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager, cytoplasmManager) {
    const GRID = appConfig.GRID;

    if (cytoplasmManager === undefined) {
    const IDsByColor = getIDsByColor(currentBacteria, phenotypeManager);
    discreteSinksAndSources(currentBacteria, concentrationState, ...IDsByColor, GRID);
    } else if (cytoplasmManager){
        continuousSinksAndSources(currentBacteria, concentrationState, cytoplasmManager, GRID);
    }

    diffuse(appConfig, concentrationState)
    
}

const continuousSinksAndSources = (currentBacteria, concentrationState, cytoplasmManager, GRID) => {
    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);
    const Kout = 0.05;
    const Kin = 0.05;
    const Kp = 0.1;
    const Kr = 0.5;
    for (const bacterium of currentBacteria) {
        const { ID } = bacterium;
        const rConcentration = cytoplasmManager.rConcentrationMemo.get(ID);
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID.HEIGHT, GRID.WIDTH);
        const localConcentration = concentrationState.concentrationField[coords.idx];
        
        const michaelisMR = rConcentration/(Kr+rConcentration);
        
        const michaelisMP = localConcentration/(Kp+localConcentration);

        concentrationState.sources[coords.idx] += Kout*michaelisMR; 
        concentrationState.sinks[coords.idx] += Kin*michaelisMP;
    }
}


function getIDsByColor(currentBacteria, phenotypeManager) {
    const { phenotypeMemo, phenotypes } = phenotypeManager;
    const magentaIDs = [];
    const cyanIDs = [];

    currentBacteria.forEach((bacterium) => {
        const ID = bacterium.ID;
        const phenotype = phenotypeMemo.get(ID);
        
        if (phenotype === phenotypes.MAGENTA) {
            magentaIDs.push(ID);
        } else if (phenotype === phenotypes.CYAN) {
            cyanIDs.push(ID);
        }
    });

    return [magentaIDs, cyanIDs];
}

function discreteSinksAndSources(currentBacteria, concentrationState, magentaIDsRaw, cyanIDsRaw, GRID) {
    const MagentaIDs = new Set(magentaIDsRaw);
    const CyanIDs = new Set(cyanIDsRaw);

    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);

    // Iterate through each bacterium in the current time step
    for (const bacterium of currentBacteria) {
        // Convert bacterium's position to grid coordinates and index using GRID
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID.HEIGHT, GRID.WIDTH);

        // Increment source count if the bacterium is Magenta
        if (MagentaIDs.has(bacterium.ID)) {
            concentrationState.sources[coords.idx] += 1; // Simple count for now
        }

        // Increment sink count if the bacterium is Cyan
        if (CyanIDs.has(bacterium.ID)) {
            concentrationState.sinks[coords.idx] += 1; // Simple count for now
        }
    }
}


