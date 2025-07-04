import { getAdjustedCoordinates } from "./grid.js";
import { 
    initializeSpecies, 
    lockObjects, 
    simulateConcentrations, 
    clearConcentrationSources, 
    createPositionMap 
} from "./signallingUtils.js";

const variables = {};
const parameters = {};
const interiorManager = {};
const exteriorManager = {};
const intSpeciesNames = [];
const extSpeciesNames = [];
const concentrationsState = {};
const workers = {};

let positionMap;


export const setModel = (params, vars, config) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);

    const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT;

    initializeSpecies(variables.int, intSpeciesNames, interiorManager, false, gridSize, concentrationsState);
    initializeSpecies(variables.ext, extSpeciesNames, exteriorManager, true, gridSize, concentrationsState);

    lockObjects([interiorManager, exteriorManager, concentrationsState, variables, parameters]);

    return concentrationsState;
};
let tempConcentrations;
let tempSources;


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

        //one worker will be created for each extracellular species. The worker will handle the diffusion of that species
    extSpeciesNames.forEach((speciesName) => {
        // Create a new worker for each extracellular species
        const worker = new Worker(new URL('./diffusionWorker.js', import.meta.url), { type: 'module' });
        worker.busy = false; 
        workers[speciesName] = worker;
       worker.onmessage = (event) => {
    // Create new Float64Arrays with the transferred buffers
    concentrationsState[speciesName].conc = new Float64Array(event.data.concentration);
    concentrationsState[speciesName].sources = new Float64Array(event.data.sources);
    
    // Resolve the promise when the worker completes
    if (worker._resolve) {
        worker._resolve();
    }
};
                 worker.createPromise = function() {
                    // Clear any existing resolve/reject that weren't used
                    this._resolve = null;
                    this._reject = null;
                    
                    return new Promise((resolve, reject) => {
                        this._resolve = resolve;
                        this._reject = reject;
                    });
                };
    }   
);
        
};

export const updateSignallingCircuit = async (currentBacteria, HEIGHT, WIDTH, timeLapse, numberOfIterations) => {
    positionMap = createPositionMap(currentBacteria, HEIGHT, WIDTH, getAdjustedCoordinates);
    const bacteriaCytoplasmConcentrations = new Map();
    let iteration = 0;
    
    
    clearConcentrationSources(extSpeciesNames, concentrationsState);
    currentBacteria.forEach(bacterium => {
        const { ID } = bacterium;
        const idx = positionMap.get(ID);
        simulateConcentrations(
            ID, timeLapse, idx, intSpeciesNames, extSpeciesNames, 
            interiorManager, exteriorManager, concentrationsState, 
            variables, parameters
        );
    });
        



    while (iteration < numberOfIterations) {
        
        // Process all workers in parallel with Promise.all
        const workerPromises = extSpeciesNames.map(speciesName => {
            const worker = workers[speciesName];
            const promise = worker.createPromise();
            
        
            worker.postMessage({
                concentration: concentrationsState[speciesName].conc, //this is a Float64Array
                sources: concentrationsState[speciesName].sources, //this is a Float64Array
                timeLapse: timeLapse // timeLapse is a constant real number
            }, [concentrationsState[speciesName].conc.buffer, concentrationsState[speciesName].sources.buffer]); // Transfer ownership of these buffers

            return promise;
        });


        try {

        // Wait for all workers to complete before moving to next iteration
        await Promise.all(workerPromises);
        clearConcentrationSources(extSpeciesNames, concentrationsState);
        currentBacteria.forEach(bacterium => {
            const { ID } = bacterium;
            const idx = positionMap.get(ID);
            const cytoplasmConcentrations = simulateConcentrations(
                ID, timeLapse, idx, intSpeciesNames, extSpeciesNames,
                interiorManager, exteriorManager, concentrationsState,
                variables, parameters
            );

            if (iteration === numberOfIterations - 1) {
                // Store the final concentrations for each bacterium
                bacteriaCytoplasmConcentrations.set(ID, cytoplasmConcentrations);
            }
        });
        iteration++;
    } catch (error) {
            console.error("Error during simulation iteration:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    
    // Create the final result once all iterations are done
    const resultArray = currentBacteria.map(bacterium => {
        const { ID, x, y, longAxis, angle } = bacterium;
        
        return {
            id: ID,
            x, y, angle, longAxis,
            phenotype: "test",
            cytoplasmConcentrations: bacteriaCytoplasmConcentrations.get(ID),
        };
    });

    return {
        bacteriaDataUpdated: resultArray,
        concentrations: concentrationsState
    };
}

