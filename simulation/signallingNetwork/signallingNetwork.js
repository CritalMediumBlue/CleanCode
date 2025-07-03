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
            concentrationsState[speciesName] = {
                conc: new Float64Array(gridSize).fill(0),
                sources: new Float64Array(gridSize).fill(0)
            };
            // Create a module worker with the correct path and type
            const workerURL = new URL('/simulation/signallingNetwork/diffusionWorker.js', window.location.origin);
            const worker = new Worker(workerURL, { type: 'module' });
            worker.busy = false; // Initialize as not busy
            webWorkers[speciesName] = worker;
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
    let workersBusy = false;
    let allowedToSimulateConcentrations = true;

 
    
    while (iteration < numberOfIterations) {
        // Process bacteria concentrations
        if (allowedToSimulateConcentrations) {
            clearConcentrationSources();
            currentBacteria.forEach(bacterium => {
                const { ID } = bacterium;
                const idx = positionMap.get(ID);
                const cytoplasmConcentrations = simulateConcentrations(ID, timeLapse, idx);
                
                if (iteration === numberOfIterations - 1) {
                    bacteriaCytoplasmConcentrations.set(ID, cytoplasmConcentrations);
                }
            });
            allowedToSimulateConcentrations = false; 
        }

            // Process diffusion using workers
            const workerPromises = extSpeciesNames.map(speciesName => {
                return new Promise((resolve, reject) => {
                    const worker = webWorkers[speciesName];
                    
                    worker.onmessage = (event) => {
                        if (event.data.success) {
                            concentrationsState[speciesName].conc.set(event.data.data.conc);
                            resolve();
                        } else {
                            console.error(`Worker for ${speciesName} reported an error:`, event.data.error);
                            reject(new Error(event.data.error));
                        }
                    };
                    
                    worker.onerror = (error) => {
                        console.error(`Worker for ${speciesName} encountered an error:`, error);
                        reject(error);
                    };
                    
                    worker.postMessage({
                        concentrations: concentrationsState[speciesName],
                        timeLapse: timeLapse
                    });
                });
            });

            try {
                // Wait for all workers to complete
                await Promise.all(workerPromises);
                iteration++;
                allowedToSimulateConcentrations = true; 
            } catch (error) {
                console.error("Error in worker processing:", error);
                // Handle error case - we could break or continue depending on requirements
                // For now, we'll continue to the next iteration
                iteration++;
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