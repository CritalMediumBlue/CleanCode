import { getAdjustedCoordinates } from "./grid.js";


function simulateConcentration(speciesMemos, ID, localConcentration, timeLapse, parsedEquations) {
    const originalConcentrations = {};
    const timeFactor = parsedEquations.intracellularConstants.timeStep.value;
    
    Object.entries(speciesMemos).forEach(([speciesName, memo]) => {
        const originalConcentration = memo.get(ID);
        originalConcentrations[speciesName] = originalConcentration;
    });

    const w = parsedEquations.intracellularConstants.w.value;


    if (originalConcentrations.x !== undefined && originalConcentrations.v !== undefined) {
       
        const deltaX = originalConcentrations.v ; 
        const deltaV = -Math.pow(w, 2) * originalConcentrations.x;

        const deltaY = 0;

        let finalConcentrationX = originalConcentrations.x + deltaX * timeLapse * timeFactor;
        let finalConcentrationV = originalConcentrations.v + deltaV * timeLapse * timeFactor;
        let finalConcentrationY = originalConcentrations.y + deltaY * timeLapse * timeFactor;

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


export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, cytoplasmManager, HEIGHT, WIDTH, timeLapse, parsedEquations) => {
    const concentrations = concentrationsState.concentrationField;
    const sourcesArray = concentrationsState.sources;
    const sinksArray = concentrationsState.sinks;

    const speciesNames = Object.keys(parsedEquations.intracellularSpecies);

    const speciesMemos = {};
    speciesNames.forEach(species => {
        speciesMemos[species] = cytoplasmManager[`${species}`];
    });

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
            if (!speciesMemos[species].has(ID)) {
                speciesMemos[species].set(ID, speciesMemos[species].get(ID/2n));
            }
        });
       
        const cytoplasmConcentrations = simulateConcentration(
            speciesMemos, ID, localConcentration, timeLapse, parsedEquations
        );
        
        speciesNames.forEach(species => {
            if (cytoplasmConcentrations[species] !== undefined) {
                speciesMemos[species].set(ID, cytoplasmConcentrations[species]);
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