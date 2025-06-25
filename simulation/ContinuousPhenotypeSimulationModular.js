import { getAdjustedCoordinates } from "./grid.js";
 

function simulateConcentration(speciesMemos, ID, localConcentration, timeLapse, parsedEquations) {
    const originalConcentrations = {};
    const timeFactor = parsedEquations.constants.timeStep.value;
    
    // Iterate over each species using Object.entries instead of forEach
    Object.entries(speciesMemos).forEach(([speciesName, memo]) => {
        const originalConcentration = memo.get(ID);
        originalConcentrations[speciesName] = originalConcentration;
    });

    // Get constants from the parsed equations
    const w = parsedEquations.constants.w.value;
    
    // Check if we have the necessary species values
    if (originalConcentrations.x !== undefined && originalConcentrations.v !== undefined) {
        // Calculate changes based on the differential equations in the JSON
        // x' = v
        const deltaX = originalConcentrations.v-originalConcentrations.x*0.0001; 
        
        // v' = -w^2*x
        const deltaV = -Math.pow(w, 2) * originalConcentrations.x - originalConcentrations.v * 0.0001;

        const deltaY = 0; // y doesn't change as per the equation

        // Update concentrations using Euler method
        let finalConcentrationX = originalConcentrations.x + deltaX * timeLapse*timeFactor;
        let finalConcentrationV = originalConcentrations.v + deltaV * timeLapse*timeFactor;
        let finalConcentrationY = originalConcentrations.y || 0.5; // y is initialized to 0.5 if not defined

        // Return updated values for all species
        return {
            x: finalConcentrationX,
            v: finalConcentrationV,
            y: finalConcentrationY
        };
    } else {
        // Use initial values from the JSON if species don't exist yet
        return {
            x: parsedEquations.intracellularSpecies.x.initialValue,
            v: parsedEquations.intracellularSpecies.v.initialValue,
            y: parsedEquations.intracellularSpecies.y.initialValue
        };
    }
}
export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, cytoplasmManager, HEIGHT, WIDTH, timeLapse, parsedEquations) => {
    const concentrations = concentrationsState.concentrationField;
    const sourcesArray = concentrationsState.sources;
    const sinksArray = concentrationsState.sinks;

    const speciesNames = Object.keys(parsedEquations.intracellularSpecies);

    const speciesMemos = {};
    speciesNames.forEach(species => {
        speciesMemos[species] = cytoplasmManager[`${species}`];
    });

    // Initialize sources and sinks arrays first
    sourcesArray.fill(0);
    sinksArray.fill(0);
    

    
    const bacteriaCount = currentBacteria.length;
    const resultArray = new Array(bacteriaCount);
    
    for (let i = 0; i < bacteriaCount; i++) {
        const bacterium = currentBacteria[i];
        const { x, y, longAxis, angle, ID } = bacterium;
        
        // Process 1: Update cytoplasm concentrations
        const adjustedCoords = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        const idx = adjustedCoords.idx;
        const localConcentration = concentrations[idx] || 0;

        // Check if ID already exists in memo
        speciesNames.forEach(species => {
            if (!speciesMemos[species].has(ID)) {
                // Try to inherit from parent cell (ID/2n) if exists
                speciesMemos[species].set(ID, speciesMemos[species].get(ID/2n));
            }
        });
       
        const cytoplasmConcentrations = simulateConcentration(
            speciesMemos, ID, localConcentration, timeLapse, parsedEquations
        );
        
        // Update all species memos with new values
        speciesNames.forEach(species => {
            if (cytoplasmConcentrations[species] !== undefined) {
                speciesMemos[species].set(ID, cytoplasmConcentrations[species]);
            }
        });
        
        

        sourcesArray[idx] += Math.abs(cytoplasmConcentrations.x)*0.5;
        sinksArray[idx] += Math.abs(cytoplasmConcentrations.v);


        // Assign to pre-allocated array
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
}

