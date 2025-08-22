
import {setupNewScene, renderScene,meshVisibility,scaleMesh,translateMesh,setCapsuleVisibility, 
    setColorMultiplier,visibleGridAndAxes,takeScreenshot,
    selectSpecies, setBacterialColor} from './scene/graphicsManager.js';
import {createBacteriumSystem,updateSimulation, setParamFromGUI,getGlobalSpeciesConcentrations} from './simulation/simulationManager.js';
import { createStates, createHistories,createConstants,updateHistories,getHistories,resetHistories} from './state/stateManager.js';
import { initGUI } from './GUI/controlManager.js';    
import { CONFIG } from './config.js';



let session;
let constants;
let bacteriaTimeSeries;

let histories;
let globalParams;
let storedProcessedData;
let bacteriaDataUpdated;
let previusParams = null;
let previusVars = null;  
let concentrations;  
let savinStates = false


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
    stepForward: () => { singleStep(); },
    init: (processedData) => {init(processedData);},
    setParam: (paramName, newValue) => {setParamFromGUI(paramName, newValue); },
    setVarsAndParams: (vars, params) => {
        previusParams = params;
        previusVars = vars;
        Object.keys(previusVars.int).forEach(speciesName => {
            console.log(previusVars.int[speciesName].val());
        }
        );   
    },
    setBacteriaColor: (species,color) => 
    {
        setBacterialColor(species, color)
    },
    saveState: () => {
        // Create JSON files for both data structures
        const bacteriaDataJson = JSON.stringify(bacteriaDataUpdated, null, 2);

        // Create Blob objects for downloading
        const bacteriaBlob = new Blob([bacteriaDataJson], { type: 'application/json' });

        // Generate timestamps for unique filenames
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Create download links and trigger downloads
        const bacteriaLink = document.createElement('a');
        bacteriaLink.href = URL.createObjectURL(bacteriaBlob);
        bacteriaLink.download = `bacteria_state_${timestamp}.json`;
        bacteriaLink.click();

        // Clean up temporary URLs
        URL.revokeObjectURL(bacteriaLink.href);
    },

    startSaving: () => {
        savinStates = true;
    },
    stopSaving: () => {
        savinStates = false;
    },
   

};


const init = (processedData) => {
    bacteriaTimeSeries = processedData.bacteriaTimeSeries;
    ({session} = createStates(CONFIG.GRID.WIDTH * CONFIG.GRID.HEIGHT));

    createBacteriumSystem(CONFIG, previusVars, previusParams,bacteriaTimeSeries[session.currentTimeStep], processedData.bacteriaLineage);
    constants = createConstants();
    createHistories(Object.keys(previusVars.int).length);
    storedProcessedData = processedData;
    constants.numberOfTimeSteps = bacteriaTimeSeries.length;
    constants.fromStepToMinutes = constants.doublingTime / processedData.averageLifetime;
    Object.freeze(constants); 
    console.log(`Duration of one step: ${constants.fromStepToMinutes} minutes`);
    resetHistories();
    if (session) { 
        cancelAnimationFrame(session.animationFrameId);
    }
    

    setupNewScene(CONFIG,previusVars);
    renderScene(histories, bacteriaDataUpdated, concentrations, CONFIG.BACTERIUM, session, constants);
    session.animationFrameId = requestAnimationFrame(animate);
    session.play=true
    animate();

};

const animate = () => {

    
    session.animationFrameId = requestAnimationFrame(animate);

    if (session.play) {
      singleStep();
      if(savinStates & session.currentTimeStep%80==0){
        guiActions.saveState()
      }
    }
    
   
    renderScene(histories, bacteriaDataUpdated, concentrations, CONFIG.BACTERIUM, session, constants);

    if (session.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        init(storedProcessedData);
    }

};



//97% of the time we will be in this function
const singleStep = () => {  


        const currentBacteria = bacteriaTimeSeries[session.currentTimeStep];

        ({bacteriaDataUpdated, concentrations} = updateSimulation(currentBacteria,constants.fromStepToMinutes));
        globalParams = getGlobalSpeciesConcentrations(bacteriaDataUpdated);
        updateData();   
     
}

const updateData = () => {
    updateHistories(globalParams.mean, globalParams.standardDeviation);
    histories = getHistories();
    session.currentTimeStep++;
}

initGUI(guiActions);
