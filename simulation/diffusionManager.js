

export function prepareDiffusionStep(currentBacteria, concentrationState, appConfig, phenotypeManager, cytoplasmManager) {
    const GRID = appConfig.GRID;

    if (cytoplasmManager === undefined) {
    const IDsByColor = getIDsByColor(currentBacteria, phenotypeManager);
    discreteSinksAndSources(currentBacteria, concentrationState, ...IDsByColor, GRID);
    } else if (cytoplasmManager){
        continuousSinksAndSources(currentBacteria, concentrationState, cytoplasmManager, GRID);
    }
    
}

const continuousSinksAndSources = (currentBacteria, concentrationState, cytoplasmManager, GRID) => {
    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);
    const Kout = 1;
    const Kin = 1;
    const Kp = 0.05;
    const Kr = 0.05;
    for (const bacterium of currentBacteria) {
        const { ID } = bacterium;
        const rConcentration = cytoplasmManager.rConcentrationMemo.get(ID);
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID);
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
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID);

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


function getAdjustedCoordinates(x, y, grid) {
    // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
    let adjustedX = Math.round(x + grid.WIDTH / 2);
    let adjustedY = Math.round(y + grid.HEIGHT / 2);
  
    // Skip bacteria below the grid's bottom edge.
    if (adjustedY <= 0) {
        adjustedY = 0;
    }
    if (adjustedX <= 0) {
        adjustedX = 0;
    }
  
    // Clamp coordinates to valid grid boundaries (leaving a 1-cell border).
    adjustedY = Math.min(adjustedY, grid.HEIGHT - 2); 
    adjustedX = Math.max(1, Math.min(adjustedX, grid.WIDTH - 2));
  
    // Calculate the 1D index corresponding to the 2D grid coordinates.
    const idx = adjustedY * grid.WIDTH + adjustedX;
  
    return { x: adjustedX, y: adjustedY, idx };
}

