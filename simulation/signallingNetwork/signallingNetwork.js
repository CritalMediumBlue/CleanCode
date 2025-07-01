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

    intSpeciesNames.splice(0, intSpeciesNames.length, ...Object.keys(variables.int));
    intSpeciesNames.forEach((speciesName) => {
        interiorManager[speciesName] = new Map();
    });

    extSpeciesNames.splice(0, extSpeciesNames.length, ...Object.keys(variables.ext));
    extSpeciesNames.forEach((speciesName) => {
        exteriorManager[speciesName] = new Map();
        concentrationsState[speciesName] = {}; // Initialize as an object first
        concentrationsState[speciesName].conc = new Float64Array(gridSize).fill(0);
        concentrationsState[speciesName].sources = new Float64Array(gridSize).fill(0);
    });

    Object.seal(interiorManager);
    Object.preventExtensions(interiorManager);
    Object.seal(exteriorManager);
    Object.preventExtensions(exteriorManager);
    Object.seal(concentrationsState);
    Object.preventExtensions(concentrationsState);
    Object.seal(variables);
    Object.preventExtensions(variables);
    Object.seal(parameters);
    Object.preventExtensions(parameters);
};






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
    });

    extSpeciesNames.forEach((speciesName) => {
        exteriorManager[speciesName].set(ID, concentrationsState[speciesName].conc[idx] );
    });

    intSpeciesNames.forEach((speciesName) => {
        variables.int[speciesName].val = interiorManager[speciesName].get(ID);
    });
    
    extSpeciesNames.forEach((extSpeciesName) => {
        variables.ext[extSpeciesName].val = exteriorManager[extSpeciesName].get(ID);
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





export const updateSignallingCircuit = (currentBacteria, HEIGHT,WIDTH,timeLapse) => {

  extSpeciesNames.forEach((speciesName) => {
    concentrationsState[speciesName].sources.fill(0);
  } );

  const bacteriaCount = currentBacteria.length;
  const resultArray = new Array(bacteriaCount);



  for (let i = 0; i < bacteriaCount; i++) {
    const bacterium = currentBacteria[i];
    const { x, y, longAxis, angle, ID } = bacterium;

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


  extSpeciesNames.forEach((speciesName) => {
  diffuse(concentrationsState[speciesName], timeLapse);
  });


  
    return {
    bacteriaDataUpdated: resultArray,
    concentrations: concentrationsState
  };
};























//oldConcentration.conc.set(concentrationsState.AimP.conc);
