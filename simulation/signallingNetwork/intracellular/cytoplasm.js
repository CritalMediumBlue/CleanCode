
let speciesNames = null;
let secretedSpecies = null;

export const initCytoplasmConstants = (variables) => {
       if (speciesNames === null) {
        speciesNames = Object.keys(variables.int);
    }
    if (secretedSpecies === null) {
        secretedSpecies = Object.keys(variables.ext);
    }

}

export const updateAllCytoplasms = (currentBacteria, positionMap, timeLapse, variables, parameters, interiorManager, exteriorManager,concentrationsState) =>
{
 
        
let cytoplasmConcentrations;
            //One web Worker can handle this loop
            currentBacteria.forEach(bacterium => {
                const { id } = bacterium;
                const idx = positionMap.get(id);
               cytoplasmConcentrations = simulateConcentrations(id, timeLapse, idx, variables, parameters, interiorManager, exteriorManager,concentrationsState);
            });
    
    
}

function simulateConcentrations(ID, timeLapse, idx, variables, parameters, interiorManager, exteriorManager, concentrationsState) {
    const finalConcentrations = {};

    inheritConcentrations(ID, idx,  interiorManager, exteriorManager, variables, concentrationsState);
    
    speciesNames.forEach((speciesName) => {
        const originalConcentration = interiorManager[speciesName].get(ID);
        const delta = variables.int[speciesName].eq(variables, parameters);
        finalConcentrations[speciesName] = originalConcentration + delta * timeLapse;

        if (finalConcentrations[speciesName] < 1e-6) {
            finalConcentrations[speciesName] = 1e-6; 
        }

        interiorManager[speciesName].set(ID, finalConcentrations[speciesName]);
    });
 
    secretedSpecies.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = 
            variables.ext[speciesName].eq(variables, parameters);
    });

}

function inheritConcentrations(ID, idx, interiorManager, exteriorManager, variables, concentrationsState){
    speciesNames.forEach((speciesName) => {
        if (!interiorManager[speciesName].has(ID)) {
            interiorManager[speciesName].set(ID, interiorManager[speciesName].get(ID / 2n));
        }
        variables.int[speciesName].val = interiorManager[speciesName].get(ID);
    });

    secretedSpecies.forEach((speciesName) => {
        exteriorManager[speciesName].set(ID, concentrationsState[speciesName].conc[idx]);
        variables.ext[speciesName].val = exteriorManager[speciesName].get(ID);
    });
}

export const calculateResultArray = (currentBacteria,interiorManager) =>
{
      
    const resultArray = currentBacteria.map(bacterium => {
        const { id, x, y, longAxis, angle } = bacterium;
     
        const cytoplasmConcentrations = {}; 
        speciesNames.forEach((speciesName) => {
            cytoplasmConcentrations[speciesName] = interiorManager[speciesName].get(id);
        });
        return {
            id,
            x,
            y,
            angle,
            longAxis,
            phenotype: "test",
            cytoplasmConcentrations,
        };
    });
    return resultArray;
}