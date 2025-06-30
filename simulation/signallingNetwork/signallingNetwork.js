import { getAdjustedCoordinates } from "./grid.js";
import { diffuse } from "./diffusionStep.js";

const variables = {};
const parameters = {};
const interiorManager = {};
const exteriorManager = {};
const intSpeciesNames = [];
const extSpeciesNames = [];


const diffussionManager = {
  conc: {},
  sources: {},
  sinks: {},
};



/**
 * Initializes the model parameters and variables, and sets up managers for interior and exterior species.
 * @param {Object} params - Model parameters to assign.
 * @param {Object} vars - Model variables, containing 'int' and 'ext' species.
 */
export const setModel = (params, vars, config) => {
  Object.assign(parameters, params);
  Object.assign(variables, vars);
  const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT

  intSpeciesNames.splice(0, intSpeciesNames.length, ...Object.keys(variables.int));
  intSpeciesNames.forEach((speciesName) => {
    interiorManager[speciesName] = new Map();
  });

  extSpeciesNames.splice(0, extSpeciesNames.length, ...Object.keys(variables.ext));
  extSpeciesNames.forEach((speciesName) => {
    exteriorManager[speciesName] = new Map();
    diffussionManager.conc[speciesName] = new Float64Array(gridSize).fill(0);
    diffussionManager.sources[speciesName] = new Float64Array(gridSize).fill(0);
    diffussionManager.sinks[speciesName] = new Float64Array(gridSize).fill(0);
  });

  Object.seal(interiorManager);
  Object.preventExtensions(interiorManager);
  Object.seal(exteriorManager);
  Object.preventExtensions(exteriorManager);
  Object.seal(diffussionManager);
  Object.preventExtensions(diffussionManager);

  console.log("Cytoplasm Manager Initialized", interiorManager);
  console.log("Exterior Manager Initialized", exteriorManager);
  console.log("Diffusion Manager Initialized", diffussionManager);
};





/**
 * Sets the value of a model parameter.
 * @param {string} paramName - The name of the parameter to set.
 * @param {*} value - The new value for the parameter.
 */
export const setParameter = (paramName, value) => {
  parameters[paramName].val = value;
  console.log(`Parameter ${paramName} set to ${value}`);
};





/**
 * Initializes cytoplasm and exterior managers for each bacterium based on current species variables.
 * @param {Array} bacteriaData - Array of bacterium objects with unique IDs.
 */
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

  console.log("Cytoplasm Manager Updated", interiorManager);
};





function simulateConcentrations(ID, localConcentration, timeLapse) {

  const originalConcentrations = {};
  const finalConcentrations = {};
     Object.keys(interiorManager).forEach((speciesName) => {

    if (!interiorManager[speciesName].has(ID)) {
        interiorManager[speciesName].set(ID, interiorManager[speciesName].get(ID / 2n));
      }
    } );

    

  // update the internal variables with the current concentrations
   Object.keys(variables.int).forEach((speciesName) => {
    variables.int[speciesName].val = interiorManager[speciesName].get(ID) 
   });
   // update the external variables with the current concentrations
    Object.keys(variables.ext).forEach((extSpeciesName) => {
        variables.ext[extSpeciesName].val = localConcentration
     });


   
  Object.keys(interiorManager).forEach((speciesName) => {


    originalConcentrations[speciesName] = interiorManager[speciesName].get(ID);
    const delta = variables.int[speciesName].eq(variables, parameters)*0.1;
    variables.int[speciesName].val = originalConcentrations[speciesName] + delta * timeLapse < 1e-6 ? 1e-6 : originalConcentrations[speciesName] + delta * timeLapse;

    finalConcentrations[speciesName] = variables.int[speciesName].val;
    interiorManager[speciesName].set(ID, finalConcentrations[speciesName]);


  });



  return {
    ...finalConcentrations,
  };
}


export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, HEIGHT,WIDTH,timeLapse) => {
  const concentrations = concentrationsState.concentrationField;
  const sourcesArray = concentrationsState.sources;
  const sinksArray = concentrationsState.sinks;


  sourcesArray.fill(0);
  sinksArray.fill(0);

  const bacteriaCount = currentBacteria.length;
  const resultArray = new Array(bacteriaCount);



  for (let i = 0; i < bacteriaCount; i++) {
    const bacterium = currentBacteria[i];
    const { x, y, longAxis, angle, ID } = bacterium;

    const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
    const localConcentration = concentrations[idx] || 0;
  

    


    const cytoplasmConcentrations = simulateConcentrations(ID,localConcentration,timeLapse);

 

    sourcesArray[idx] += cytoplasmConcentrations.AimR * 0.5;
    sinksArray[idx] += localConcentration * 0.5;

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



  diffuse(concentrationsState, timeLapse);

  return resultArray;
};