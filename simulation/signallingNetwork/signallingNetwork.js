import { getAdjustedCoordinates } from "./grid.js";
import { diffuse } from './diffusionStep.js';

let equations = null;
let variables = null;
let parameters = null;
let cytoplasmManager = null;
let speciesNames = null;

export const setModel = (eqs, params, vars) => {
  
    equations = eqs;
    parameters = params;
    variables = vars;
    cytoplasmManager = {};
    speciesNames = Object.keys(variables.int)
    speciesNames.forEach(speciesName => {
        cytoplasmManager[`${speciesName}`] = new Map();
    });

    Object.seal(cytoplasmManager);
    Object.preventExtensions(cytoplasmManager);
};

export const setExtraParameter = (paramName, value) => {
parameters.ext[paramName].val = value;
}
export const setIntraParameter = (paramName, value) => {
    parameters.int[paramName].val = value;
}

export const setCytopManager = (bacteriaData) => {

    speciesNames.forEach(speciesName => {
        bacteriaData.forEach(bacterium => {
            const ID = bacterium.ID;
            if (!cytoplasmManager[speciesName].has(ID)) {
                cytoplasmManager[speciesName].set(ID, variables.int[speciesName].val);
            }
        });
    });
};


function simulateConcentration( ID, localConcentration, timeLapse) {
    const originalConcentrations = {};

    Object.keys(cytoplasmManager).forEach(speciesName => {   
        originalConcentrations[speciesName] = cytoplasmManager[speciesName].get(ID);
        const delta = equations.int[speciesName](variables, parameters);
    });

        const deltaX = equations.int.x(variables, parameters) ;
        const deltaV = equations.int.v(variables, parameters);
        const deltaY = equations.int.y(variables, parameters);

  variables.int.x.val = originalConcentrations.x + deltaX * timeLapse;
  variables.int.v.val = originalConcentrations.v + deltaV * timeLapse;
  variables.int.y.val = originalConcentrations.y + deltaY * timeLapse;

  return {
    x: variables.int.x.val,
    v: variables.int.v.val,
    y: variables.int.y.val,
  };

   
}


export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, HEIGHT, WIDTH, timeLapse) => {
    const concentrations = concentrationsState.concentrationField;
    const sourcesArray = concentrationsState.sources;
    const sinksArray = concentrationsState.sinks;

    const speciesNames = Object.keys(variables.int);

 
    sourcesArray.fill(0);
    sinksArray.fill(0);
    
    const bacteriaCount = currentBacteria.length;
    const resultArray = new Array(bacteriaCount);
    
    for (let i = 0; i < bacteriaCount; i++) {
        const bacterium = currentBacteria[i];
        const { x, y, longAxis, angle, ID } = bacterium;
        
        const adjustedCoords = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        const idx = adjustedCoords.idx;
        const localConcentration = concentrations[idx] || 0;

        speciesNames.forEach(species => {
            if (!cytoplasmManager[species].has(ID)) {
                cytoplasmManager[species].set(ID, cytoplasmManager[species].get(ID/2n));
            }
        });
       
        const cytoplasmConcentrations = simulateConcentration(ID, localConcentration, timeLapse);
        
        speciesNames.forEach(species => {
            if (cytoplasmConcentrations[species] !== undefined) {
                cytoplasmManager[species].set(ID, cytoplasmConcentrations[species]);
            }
        });
        
        sourcesArray[idx] += Math.abs(cytoplasmConcentrations.x) * 0.5;
        sinksArray[idx] += Math.abs(cytoplasmConcentrations.v);

        resultArray[i] = {
            id: ID,
            x,
            y,
            angle,
            longAxis,
            phenotype: "test",
            cytoplasmConcentrations
        };
    }


    diffuse(concentrationsState, timeLapse);
    
    return resultArray;
};

