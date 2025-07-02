import { getAdjustedCoordinates } from "./grid.js";
import { diffuse } from "./diffusionStep.js";

const variables = {};
const parameters = {};

const interiorManager = {};
const exteriorManager = {};

const intSpeciesNames = [];
const extSpeciesNames = [];

const concentrationsState = {};



export const setModel = (params, vars, config) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);

    const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT;

    initializeSpecies(variables.int, intSpeciesNames, interiorManager, false, gridSize);
    
    initializeSpecies(variables.ext, extSpeciesNames, exteriorManager, true, gridSize);

    lockObjects([interiorManager, exteriorManager, concentrationsState, variables, parameters]);

    return concentrationsState
};


function lockObjects(objectArray) {
    objectArray.forEach(obj => {
        Object.seal(obj);
        Object.preventExtensions(obj);
    });
}

function initializeSpecies(speciesObj, speciesNames, manager, isExternal, gridSize) {
    speciesNames.splice(0, speciesNames.length, ...Object.keys(speciesObj));
    
    speciesNames.forEach((speciesName) => {
        manager[speciesName] = new Map();
        
        if (isExternal) {
            concentrationsState[speciesName] = {}; 
            concentrationsState[speciesName].conc = new Float64Array(gridSize).fill(0);
            concentrationsState[speciesName].sources = new Float64Array(gridSize).fill(0);
        }
    });
}


export const setParameter = (paramName, value) => {
    parameters[paramName] = value;
    console.log(`Parameter ${paramName} set to ${value}`);
};



export const setCytopManager = (bacteriaData) => {
    intSpeciesNames.forEach((speciesName) => {
        bacteriaData.forEach((bacterium) => {
            const ID = bacterium.ID;
            if (!interiorManager[speciesName].has(ID)) {
                interiorManager[speciesName].set(ID, variables.int[speciesName].val);
            }
        });
    });

    extSpeciesNames.forEach((speciesName) => {
        bacteriaData.forEach((bacterium) => {
            const ID = bacterium.ID;
            if (!exteriorManager[speciesName].has(ID)) {
                exteriorManager[speciesName].set(ID, variables.ext[speciesName].val);
            }
        });
    });
};



function inheritConcentrations(ID, idx) {
    intSpeciesNames.forEach((speciesName) => {
        if (!interiorManager[speciesName].has(ID)) {
            interiorManager[speciesName].set(ID, interiorManager[speciesName].get(ID / 2n));
        }
        variables.int[speciesName].val = interiorManager[speciesName].get(ID);

    });

    extSpeciesNames.forEach((speciesName) => {
        exteriorManager[speciesName].set(ID, concentrationsState[speciesName].conc[idx] );
        variables.ext[speciesName].val = exteriorManager[speciesName].get(ID);

      });

}



function simulateConcentrations(ID, timeLapse, idx) {

  const finalConcentrations = {};


  inheritConcentrations(ID, idx)

    
  intSpeciesNames.forEach((speciesName) => {


    const originalConcentrations = interiorManager[speciesName].get(ID);
    const delta = variables.int[speciesName].eq(variables, parameters);
    finalConcentrations[speciesName] = originalConcentrations + delta * timeLapse;

    if (finalConcentrations[speciesName] < 1e-6) {
      finalConcentrations[speciesName] = 1e-6; 
    }

    interiorManager[speciesName].set(ID, finalConcentrations[speciesName]);


  });


  extSpeciesNames.forEach((speciesName) => {

    concentrationsState[speciesName].sources[idx] = variables.ext[speciesName].eq(variables, parameters);

  });



  return {
    ...finalConcentrations,
  };
}





export const updateSignallingCircuit = (currentBacteria, HEIGHT,WIDTH,timeLapse, numberOfIterations) => {



  const bacteriaCount = currentBacteria.length;
  const resultArray = new Array(bacteriaCount);


 for (let i = 1; i < numberOfIterations-1; i++) {
   
  


  extSpeciesNames.forEach((speciesName) => {
    concentrationsState[speciesName].sources.fill(0);
  } );



  for (let i = 0; i < bacteriaCount; i++) {
    const bacterium = currentBacteria[i];
    const { x, y, ID } = bacterium;

    const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
  
    simulateConcentrations(ID,timeLapse, idx);
 
  }


  extSpeciesNames.forEach((speciesName) => {
  diffuse(concentrationsState[speciesName], timeLapse);
  });

}

  for (let i = 0; i < bacteriaCount; i++) {
    const bacterium = currentBacteria[i];
    const { ID, x, y, longAxis, angle } = bacterium;
    const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
    const cytoplasmConcentrations = simulateConcentrations(ID,timeLapse, idx);
  
    resultArray[i] = {
      id: ID,
      x,
      y,
      angle,
      longAxis,
      phenotype: "test",
      cytoplasmConcentrations,
    };
  }

    return {
    bacteriaDataUpdated: resultArray,
    concentrations: concentrationsState
  };
};























