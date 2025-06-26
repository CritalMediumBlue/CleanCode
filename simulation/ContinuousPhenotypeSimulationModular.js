import { getAdjustedCoordinates } from "./grid.js";

let parsedEquations = null;
export const initEquations = (equations) => {
    parsedEquations = equations;
    Object.keys(parsedEquations.intracellularSpecies).forEach(species => {
    console.log('Change of '+ species+ ' with respect to time is given by ' + 'd' + species + '/dt = ' + parsedEquations.intracellularSpecies[species].diffEquation);
    });
    Object.keys(parsedEquations.intracellularConstants).forEach(constant => {
        console.log('constant ' + constant + ' = ' + parsedEquations.intracellularConstants[constant].value); 
    });

    // The resulting log is shown below
    /*
    Change of x with respect to time is given by dx/dt = v 
    Change of v with respect to time is given by dv/dt = -Math.pow(w, 2) * x 
    Change of y with respect to time is given by dy/dt = 0 
    constant w = 0.5 
    constant timeStep = 0.001 
    */
};
function simulateConcentration(cytoplasmManager, ID, localConcentration, timeLapse) {
    const originalConcentrations = {};
    
    Object.keys(cytoplasmManager).forEach(speciesName => {
        const originalConcentration = cytoplasmManager[speciesName].get(ID);
        originalConcentrations[speciesName] = originalConcentration;
    });

    const w = parsedEquations.intracellularConstants.w.value; // This should not be hardcoded, please use the parsed constants
    const timeStep = parsedEquations.intracellularConstants.timeStep.value; // This should not be hardcoded, please use the parsed constants



    if (originalConcentrations.x !== undefined && originalConcentrations.v !== undefined) {

        const deltaX = parsedEquations.intracellularSpecies.x.diffEquation(originalConcentrations.v); 
        const deltaV = parsedEquations.intracellularSpecies.v.diffEquation(w, originalConcentrations.x);
        const deltaY = 0; // This should not be hardcoded, please use the parsed equations

        let finalConcentrationX = originalConcentrations.x + deltaX * timeLapse * timeStep;
        let finalConcentrationV = originalConcentrations.v + deltaV * timeLapse * timeStep;
        let finalConcentrationY = originalConcentrations.y + deltaY * timeLapse * timeStep;

        return {
            x: finalConcentrationX,
            v: finalConcentrationV,
            y: finalConcentrationY
        };
    } else {
        return {
            x: parsedEquations.intracellularSpecies.x.initialValue,
            v: parsedEquations.intracellularSpecies.v.initialValue,
            y: parsedEquations.intracellularSpecies.y.initialValue
        };
    }
}


export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, cytoplasmManager, HEIGHT, WIDTH, timeLapse) => {
    const concentrations = concentrationsState.concentrationField;
    const sourcesArray = concentrationsState.sources;
    const sinksArray = concentrationsState.sinks;

    const speciesNames = Object.keys(parsedEquations.intracellularSpecies);

   /*  console.log(parsedEquations.intracellularSpecies);
    console.log(parsedEquations.intracellularConstants);
 */
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
       
        const cytoplasmConcentrations = simulateConcentration(
            cytoplasmManager, ID, localConcentration, timeLapse
        );
        
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
    
    return resultArray;
};

