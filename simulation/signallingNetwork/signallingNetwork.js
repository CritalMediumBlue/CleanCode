import { getAdjustedCoordinates } from "./grid.js";
import { ADI } from "./extracellular/ADI.js";
import { 
    setModel, 
    setParameter, 
    updateAllCytoplasms, 
    calculateResultArray, 
    variables, 
    parameters, 
    interiorManager, 
    exteriorManager, 
    extSpeciesNames, 
    concentrationsState 
} from "./intracellular/cytoplasmManager.js";
export { setModel, setParameter };


function clearConcentrationSources() {
    extSpeciesNames.forEach((speciesName) => {
        if (concentrationsState[speciesName] && concentrationsState[speciesName].sources) {
            concentrationsState[speciesName].sources.fill(0);
        }
    });
}

const positionMap = new Map();

function createPositionMap(currentBacteria, HEIGHT, WIDTH) {
    positionMap.clear();
    currentBacteria.forEach(bacterium => {
        const { x, y, id } = bacterium;
        const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        positionMap.set(id, idx);
    });
}

export const updateSignallingCircuit = (currentBacteria, HEIGHT, WIDTH, timeLapse, numberOfIterations) => {
    createPositionMap(currentBacteria, HEIGHT, WIDTH);

    for (let i = 0; i < numberOfIterations; i++) {
        clearConcentrationSources();
        
        updateAllCytoplasms(positionMap, timeLapse, variables, parameters, interiorManager, exteriorManager, concentrationsState);

        extSpeciesNames.forEach((speciesName) => {
          ADI(concentrationsState[speciesName].conc,concentrationsState[speciesName].sources,1, 0.1, 100, timeLapse);
        });

    }

    const resultArray = calculateResultArray(currentBacteria, interiorManager);


    return {
        bacteriaDataUpdated: resultArray,
        concentrations: concentrationsState
    };
};
