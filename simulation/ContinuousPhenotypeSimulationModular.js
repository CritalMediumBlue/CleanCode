import { getAdjustedCoordinates } from "./grid.js";

let parsedEquations = null;
export const initEquations = (equations) => {
    parsedEquations = equations;
    console.log(parsedEquations.intracellularConstants);
    console.log(parsedEquations.intracellularSpecies);
};
function simulateConcentration(cytoplasmManager, ID, localConcentration, timeLapse) {
    const originalConcentrations = {};
    const timeFactor = parsedEquations.intracellularConstants.timeStep.value;
    
    Object.keys(cytoplasmManager).forEach(speciesName => {
        const originalConcentration = cytoplasmManager[speciesName].get(ID);
        originalConcentrations[speciesName] = originalConcentration;
    });

   // console.log(parsedEquations.intracellularSpecies);
/*     
Object { x: {…}, v: {…}, y: {…} }
​
v: Object { initialValue: 0, diffEquation: "-Math.pow(w, 2) * x", minValue: -1000 }
​​
diffEquation: "-Math.pow(w, 2) * x"
​​
initialValue: 0
​​
minValue: -1000
​​
<prototype>: Object { … }
​
x: Object { initialValue: 1, diffEquation: "v", minValue: -1000 }
​​
diffEquation: "v"
​​
initialValue: 1
​​
minValue: -1000
​​
<prototype>: Object { … }
​
y: Object { initialValue: 0.5, diffEquation: "0", minValue: -1000 }
​​
diffEquation: "0"
​​
initialValue: 0.5
​​
minValue: -1000
​​
<prototype>: Object { … }
​
<prototype>: Object { … }

*/

   // console.log(parsedEquations.intracellularConstants);
/* 
Object { w: {…}, timeStep: {…} }
​
timeStep: Object { value: 0.001, minValue: 0, maxValue: 0.1 }
​​
maxValue: 0.1
​​
minValue: 0
​​
value: 0.001
​​
<prototype>: Object { … }
​
w: Object { value: 0.5, minValue: 0, maxValue: 2 }
​​
maxValue: 2
​​
minValue: 0
​​
value: 0.5
​​
<prototype>: Object { … }
​
<prototype>: Object { … }


 */

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
            cytoplasmManager, ID, localConcentration, timeLapse, parsedEquations
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

