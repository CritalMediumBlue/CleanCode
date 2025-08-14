
import { 
    speciesNames,
    secretedSpecies,
    variables,
    parameters,
    interiorManager,
    exteriorManager,
    intEquations,
    extEquations,
    lineage
} from './cytoplasmState.js';

export const updateAllCytoplasms = (positionMap, timeLapse, concentrationsState) => {
    for (const [id, idx] of positionMap.entries()) {
        //simulateConcentrations(id, timeLapse, idx, concentrationsState);
        rk4Step(id, timeLapse, idx, concentrationsState);
    }
};

/* function simulateConcentrations(ID, timeLapse, idx, concentrationsState) {
   
    
    inheritConcentrations(ID, idx, concentrationsState);

    for (let i = 0, len = speciesNames.length; i < len; i++) {
        const speciesName = speciesNames[i];
        const manager = interiorManager[speciesName];
        const origConc = manager.get(ID);
        const delta = intEquations[speciesName](variables, parameters); // calculates the change in concentration by evaluating the differential equation for "speciesName"
        const newConc = origConc + delta * timeLapse; //New concentration is calculated by simply adding delta concenttration multiplied by delta time to the previous concentration
        manager.set(ID, newConc); //updates concentration
    }

    secretedSpecies.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = extEquations[speciesName](variables, parameters);
    });
} */

function rk4Step(ID, timeLapse, idx, concentrationsState) {
    inheritConcentrations(ID, idx, concentrationsState);
    const k1 = {};
    const k2 = {};
    const k3 = {};
    const k4 = {};

    // Compute k1: slope at beginning
    for (let i = 0, len = speciesNames.length; i < len; i++) {
        const speciesName = speciesNames[i];
        k1[speciesName] = intEquations[speciesName](variables, parameters);
    }

    // Compute k2: slope at midpoint using k1
    for (let i = 0, len = speciesNames.length; i < len; i++) {
        const speciesName = speciesNames[i];
        const manager = interiorManager[speciesName];
        const origConc = manager.get(ID);
        variables.int[speciesName].val = origConc + (timeLapse/2) * k1[speciesName];
    }
    for (let i = 0; i < speciesNames.length; i++) {
        const speciesName = speciesNames[i];
        k2[speciesName] = intEquations[speciesName](variables, parameters);
    }

    // Compute k3: slope at midpoint using k2
    for (let i = 0; i < speciesNames.length; i++) {
        const speciesName = speciesNames[i];
        const manager = interiorManager[speciesName];
        const origConc = manager.get(ID);
        variables.int[speciesName].val = origConc + (timeLapse/2) * k2[speciesName];
    }
    for (let i = 0; i < speciesNames.length; i++) {
        const speciesName = speciesNames[i];
        k3[speciesName] = intEquations[speciesName](variables, parameters);
    }

    // Compute k4: slope at endpoint using k3
    for (let i = 0; i < speciesNames.length; i++) {
        const speciesName = speciesNames[i];
        const manager = interiorManager[speciesName];
        const origConc = manager.get(ID);
        variables.int[speciesName].val = origConc + timeLapse * k3[speciesName];
    }
    for (let i = 0; i < speciesNames.length; i++) {
        const speciesName = speciesNames[i];
        k4[speciesName] = intEquations[speciesName](variables, parameters);
    }

    // Update concentrations with weighted RK4 average
    for (let i = 0; i < speciesNames.length; i++) {
        const speciesName = speciesNames[i];
        const manager = interiorManager[speciesName];
        const origConc = manager.get(ID);
        const newConc = origConc + (timeLapse/6) * (k1[speciesName] + 2*k2[speciesName] + 2*k3[speciesName] + k4[speciesName]);
        manager.set(ID, newConc);
    }

    // Update secreted species as before
    secretedSpecies.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = extEquations[speciesName](variables, parameters);
    });
}



function inheritConcentrations(ID, idx, concentrationsState) {
   

    for (let i = 0, len = speciesNames.length; i < len; i++) {
        const speciesName = speciesNames[i];
        const managerInt = interiorManager[speciesName];
        if (!managerInt.has(ID)) {
            const parent = lineage[ID]
            
          
            let defaultVal = managerInt.get(parent);
              if (parent == 0){
                defaultVal=0
            }
            managerInt.set(ID, defaultVal);
        }
        variables.int[speciesName].val = managerInt.get(ID);
    }

    for (let i = 0, len = secretedSpecies.length; i < len; i++) {
        const speciesName = secretedSpecies[i];
        const extManager = exteriorManager[speciesName];
        const concValue = concentrationsState[speciesName].conc[idx];
        extManager.set(ID, concValue);
        variables.ext[speciesName].val = extManager.get(ID);
    }
}

export const calculateResultArray = (currentBacteria) => {
    
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
};
