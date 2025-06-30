import { getAdjustedCoordinates } from "./grid.js";
import { diffuse } from "./diffusionStep.js";

let variables = null;
let parameters = null;
let cytoplasmManager = {};
let intSpeciesNames = null;
let extSpeciesNames = null;
let exteriorManager = {};


export const setModel = (params, vars) => {
  parameters = params;
  variables = vars;

  intSpeciesNames = Object.keys(variables.int);
  intSpeciesNames.forEach((speciesName) => {
    cytoplasmManager[speciesName] = new Map();
  });

    extSpeciesNames = Object.keys(variables.ext);
    extSpeciesNames.forEach((extSpeciesNames) => {
    exteriorManager[extSpeciesNames] = new Map();
    });

  Object.seal(cytoplasmManager);
  Object.preventExtensions(cytoplasmManager);
    Object.seal(exteriorManager);
    Object.preventExtensions(exteriorManager);
  console.log("Cytoplasm Manager Initialized", cytoplasmManager);   
  console.log("Exterior Manager Initialized", exteriorManager);
};


export const setParameter = (paramName, value) => {parameters[paramName].val = value; console.log(`Parameter ${paramName} set to ${value}`);};




export const setCytopManager = (bacteriaData) => {
  intSpeciesNames.forEach((speciesName) => {
    bacteriaData.forEach((bacterium) => {
      const ID = bacterium.ID;
      if (!cytoplasmManager[speciesName].has(ID)) {cytoplasmManager[speciesName].set(ID, variables.int[speciesName].val);}
    });
  });
  console.log("Cytoplasm Manager Updated", cytoplasmManager);
};



function simulateConcentrations(ID, localConcentration, timeLapse) {
  const originalConcentrations = {};
  const finalConcentrations = {};
     Object.keys(cytoplasmManager).forEach((speciesName) => {

    if (!cytoplasmManager[speciesName].has(ID)) {
        cytoplasmManager[speciesName].set(ID, cytoplasmManager[speciesName].get(ID / 2n));
      }
    } );

  // update the internal variables with the current concentrations
   Object.keys(variables.int).forEach((speciesName) => {
    variables.int[speciesName].val = cytoplasmManager[speciesName].get(ID) 
   });


   
  Object.keys(cytoplasmManager).forEach((speciesName) => {

 


    originalConcentrations[speciesName] = cytoplasmManager[speciesName].get(ID);
    const delta = variables.int[speciesName].eq(variables, parameters)*0.01;
    variables.int[speciesName].val = originalConcentrations[speciesName] + delta * timeLapse;
    finalConcentrations[speciesName] = variables.int[speciesName].val;
    cytoplasmManager[speciesName].set(ID, finalConcentrations[speciesName]);


  });



  return {
    ...finalConcentrations,
  };
}


export const updateBacteriaCytoplasm = (currentBacteria,concentrationsState,HEIGHT,WIDTH,timeLapse) => {
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

 

    sourcesArray[idx] += cytoplasmConcentrations.AimP * 0.1;
    sinksArray[idx] += 0;//Math.abs(cytoplasmConcentrations.v) * localConcentration;

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