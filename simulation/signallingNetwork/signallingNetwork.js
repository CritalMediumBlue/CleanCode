import { getAdjustedCoordinates } from "./grid.js";
import { diffuse } from "./diffusionStep.js";

const variables = {};
const parameters = {};
const interiorManager = {};
const exteriorManager = {};
const intSpeciesNames = [];
const extSpeciesNames = [];
const concentrationsState = {};

const MIN_CONCENTRATION = 1e-6;

const webWorkers = {}


export const setModel = (params, vars, config) => {
    Object.assign(parameters, params);
    Object.assign(variables, vars);

    const gridSize = config.GRID.WIDTH * config.GRID.HEIGHT;

    initializeSpecies(variables.int, intSpeciesNames, interiorManager, false, gridSize);
    initializeSpecies(variables.ext, extSpeciesNames, exteriorManager, true, gridSize);

    lockObjects([interiorManager, exteriorManager, concentrationsState, variables, parameters]);

    return concentrationsState;
};


function initializeSpecies(speciesObj, speciesNames, manager, isExternal, gridSize) {
    speciesNames.splice(0, speciesNames.length, ...Object.keys(speciesObj));
    
    speciesNames.forEach((speciesName) => {
        manager[speciesName] = new Map();
        
        if (isExternal) {
            // Create a single buffer for both concentration and sources
            // Using a single typed array is more efficient for transferring to workers
            const totalSize = gridSize * 2;
            const buffer = new ArrayBuffer(totalSize * Float64Array.BYTES_PER_ELEMENT);
            
            // Create views into different parts of the buffer
            const conc = new Float64Array(buffer, 0, gridSize);
            const sources = new Float64Array(buffer, gridSize * Float64Array.BYTES_PER_ELEMENT, gridSize);
            
            concentrationsState[speciesName] = {
                conc,
                sources,
                buffer // Store reference to the buffer for potential transferable objects
            };
            
            try {
                // Create a module worker with the correct path and type
                const workerURL = new URL('/simulation/signallingNetwork/diffusionWorker.js', window.location.origin);
                const worker = new Worker(workerURL, { type: 'module' });
                
                // Set up message handler once during initialization
                worker.onmessage = (event) => {
                    if (event.data.success) {
                        // Update the concentration data
                        concentrationsState[speciesName].conc.set(event.data.data.conc);
                        
                        // Resolve the promise if it exists
                        if (worker._resolve) {
                            worker._resolve();
                            // Clear references to prevent memory leaks
                            worker._resolve = null;
                            worker._reject = null;
                        }
                    } else {
                        console.error(`Worker for ${speciesName} reported an error:`, event.data.error);
                        if (worker._reject) {
                            worker._reject(new Error(event.data.error));
                            worker._resolve = null;
                            worker._reject = null;
                        }
                    }
                };
                
                worker.onerror = (error) => {
                    console.error(`Worker for ${speciesName} encountered an error:`, error);
                    if (worker._reject) {
                        worker._reject(error);
                        worker._resolve = null;
                        worker._reject = null;
                    }
                };
                
                // Add helper method to create a promise for this worker
                worker.createPromise = function() {
                    // Clear any existing resolve/reject that weren't used
                    this._resolve = null;
                    this._reject = null;
                    
                    return new Promise((resolve, reject) => {
                        this._resolve = resolve;
                        this._reject = reject;
                    });
                };
                
                webWorkers[speciesName] = worker;
                console.log(`Worker for ${speciesName} initialized successfully`);
            } catch (error) {
                console.error(`Failed to create worker for ${speciesName}:`, error);
            }
        }
    });
}


function lockObjects(objectArray) {
    objectArray.forEach(obj => {
        Object.seal(obj);
        Object.preventExtensions(obj);
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
        exteriorManager[speciesName].set(ID, concentrationsState[speciesName].conc[idx]);
        variables.ext[speciesName].val = exteriorManager[speciesName].get(ID);
    });
}

//we will move this function to a web worker. we have to implement dependency injection
function simulateConcentrations(ID, timeLapse, idx) {
    const finalConcentrations = {};

    inheritConcentrations(ID, idx);
    
    intSpeciesNames.forEach((speciesName) => {
        const originalConcentration = interiorManager[speciesName].get(ID);
        const delta = variables.int[speciesName].eq(variables, parameters);
        finalConcentrations[speciesName] = originalConcentration + delta * timeLapse;

        if (finalConcentrations[speciesName] < MIN_CONCENTRATION) {
            finalConcentrations[speciesName] = MIN_CONCENTRATION; 
        }

        interiorManager[speciesName].set(ID, finalConcentrations[speciesName]);
    });

    extSpeciesNames.forEach((speciesName) => {
        concentrationsState[speciesName].sources[idx] = 
            variables.ext[speciesName].eq(variables, parameters);
    });

    return finalConcentrations;
}

function clearConcentrationSources() {
    extSpeciesNames.forEach((speciesName) => {
        concentrationsState[speciesName].sources.fill(0);
    });
}

const positionMap = new Map();

function createPositionMap(currentBacteria, HEIGHT, WIDTH) {
    positionMap.clear();
    currentBacteria.forEach(bacterium => {
        const { x, y, ID } = bacterium;
        const idx = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        positionMap.set(ID, idx);
    });
}

export const updateSignallingCircuit = async (currentBacteria, HEIGHT, WIDTH, timeLapse, numberOfIterations) => {
    createPositionMap(currentBacteria, HEIGHT, WIDTH);
    const bacteriaCytoplasmConcentrations = new Map();
    let iteration = 0;
    
    // Initial concentration calculation before any diffusion
    clearConcentrationSources();
    currentBacteria.forEach(bacterium => {
        const { ID } = bacterium;
        const idx = positionMap.get(ID);
        simulateConcentrations(ID, timeLapse, idx);
    });
    
    // Main simulation loop
    while (iteration < numberOfIterations) {
        
        // 1. Process diffusion using workers
        const workerPromises = extSpeciesNames.map(speciesName => {
            const worker = webWorkers[speciesName];
            // Use the pre-defined promise creator
            const promise = worker.createPromise();
            
            // Transfer data to worker - use transferable objects if possible
            worker.postMessage({
                concentrations: concentrationsState[speciesName],
                timeLapse: timeLapse
            });
            
            return promise;
        });

        try {
            // 2. Wait for all diffusion workers to complete
            await Promise.all(workerPromises);
            
            // 3. Now update the bacteria concentrations based on the new diffusion results
            clearConcentrationSources();
            currentBacteria.forEach(bacterium => {
                const { ID } = bacterium;
                const idx = positionMap.get(ID);
                const cytoplasmConcentrations = simulateConcentrations(ID, timeLapse, idx);
                
                // Only store the final concentrations on the last iteration
                if (iteration === numberOfIterations - 1) {
                    bacteriaCytoplasmConcentrations.set(ID, cytoplasmConcentrations);
                }
            });
            
            iteration++;
        } catch (error) {
            console.error("Error in worker processing:", error);
            iteration++; // Continue to next iteration even if there's an error
        }
    }
   

    const resultArray = currentBacteria.map(bacterium => {
        const { ID, x, y, longAxis, angle } = bacterium;
        
        return {
            id: ID,
            x,
            y,
            angle,
            longAxis,
            phenotype: "test",
            cytoplasmConcentrations: bacteriaCytoplasmConcentrations.get(ID),
        };
    });

    return {
        bacteriaDataUpdated: resultArray,
        concentrations: concentrationsState
    };
};