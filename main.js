
import {setupNewScene, renderScene,meshVisibility,scaleMesh,translateMesh,setCapsuleVisibility, 
    setColorMultiplier,visibleGridAndAxes,takeScreenshot,
    selectSpecies} from './scene/graphicsManager.js';
import {createBacteriumSystem,updateSimulation, setParamFromGUI,assignInitialConcentrations,getGlobalSpeciesConcentrations} from './simulation/simulationManager.js';
import { createStates, createHistories,createConstants,updateHistories,getHistories,resetHistories} from './state/stateManager.js';
import { initGUI } from './GUI/controlManager.js';    
import { CONFIG } from './config.js';



let session;
let constants;
let concentrationState;
let bacteriaTimeSeries;

let histories;
let globalParams;
let storedProcessedData;
let bacteriaDataUpdated;
let previusParams = null;
let previusVars = null;  
let concentrations;  


const guiActions = {
    setPlayState: () => {session.play = !session.play;},
    setMeshVisible: (boolean) => {meshVisibility(boolean);},
    selectSpecies: (speciesName) => { selectSpecies(speciesName);},
    setMeshScale: (scale) => {scaleMesh(scale);},
    translateMesh: (z) => {translateMesh(z);},
    setCapsuleVisibility: (visible) => {setCapsuleVisibility(visible);},
    setColorMultiplier: (value) => {setColorMultiplier(value);},
    reset: () => {
        const continueSimu = session.play;
        init(storedProcessedData);
        session.play = continueSimu;
    },
    visibleGridAndAxes: (visible) => {visibleGridAndAxes(visible);},
    takeScreenshot: (filename) => {takeScreenshot(filename);},
       stepForward: () => { 
        // Only step forward if a simulation is not already in progress
        if (!session.simulationInProgress) {
            session.simulationInProgress = true;
            singleStep().then(() => {
                session.simulationInProgress = false;
            }).catch(error => {
                console.error("Error in step forward:", error);
                session.simulationInProgress = false;
            });
        } else {
            console.log("Simulation step already in progress, please wait");
        }
    },
    init: (processedData) => {init(processedData);},
    setParam: (paramName, newValue) => {setParamFromGUI(paramName, newValue); },
    setModel: (vars, params) => {
        concentrations=createBacteriumSystem(CONFIG, vars, params); 
        previusParams = params;
        previusVars = vars;
    }

};


const init = (processedData) => {
    concentrationState = createBacteriumSystem(CONFIG, previusVars, previusParams);
    constants = createConstants();
    createHistories(Object.keys(previusVars.int).length);
    storedProcessedData = processedData;
    bacteriaTimeSeries = processedData.bacteriaTimeSeries;
    constants.numberOfTimeSteps = bacteriaTimeSeries.length;
    constants.fromStepToMinutes = constants.doublingTime / processedData.averageLifetime;
    Object.freeze(constants); 
    console.log(`Duration of one step: ${constants.fromStepToMinutes} minutes`);
    resetHistories();
    if (session) { 
        cancelAnimationFrame(session.animationFrameId);
    }
    
    ({session} = createStates(CONFIG.GRID.WIDTH * CONFIG.GRID.HEIGHT));

    setupNewScene(CONFIG,previusVars);
    assignInitialConcentrations(bacteriaTimeSeries[session.currentTimeStep])
    animate();
};

const animate = () => {

    
    session.animationFrameId = requestAnimationFrame(animate);

      if (session.play && !session.simulationInProgress) {
        // Set a flag to prevent multiple overlapping simulation steps
        session.simulationInProgress = true;
        
        singleStep().then(() => {
            // Clear the flag when the step is done
            session.simulationInProgress = false;
        }).catch(error => {
            console.error("Error in animation step:", error);
            session.simulationInProgress = false;
        });
    }
    
   
    renderScene(histories, bacteriaDataUpdated, concentrations, CONFIG.BACTERIUM, session, constants);

    if (session.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        init(storedProcessedData);
    }

};

const singleStep = async () => {  
    try {
        const currentBacteria = bacteriaTimeSeries[session.currentTimeStep];
        
        // Now we need to await the result since updateSimulation is async
        const result = await updateSimulation(currentBacteria, constants.fromStepToMinutes);
        globalParams = getGlobalSpeciesConcentrations( result.bacteriaDataUpdated);
        // Check if result is valid before destructuring
        if (result) {
            ({bacteriaDataUpdated, concentrations} = result);
            updateData();
        } else {
            console.error("Failed to update simulation: result was null or undefined");
        }
    } catch (error) {
        console.error("Error in singleStep:", error);
    }
}

const updateData = () => {
    updateHistories(globalParams.mean, globalParams.standardDeviation);
    histories = getHistories();
    session.currentTimeStep++;
}

initGUI(guiActions);


console.log("Initial setup complete. Waiting for data file...");

























