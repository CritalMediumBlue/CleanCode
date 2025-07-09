
import {setupNewScene, renderScene,meshVisibility,scaleMesh,translateMesh,setCapsuleVisibility, 
    setColorMultiplier,visibleGridAndAxes,takeScreenshot,
    selectSpecies, setBacterialColor} from './scene/graphicsManager.js';
import {createBacteriumSystem,updateSimulation, setParamFromGUI,getGlobalSpeciesConcentrations} from './simulation/simulationManager.js';
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
   

};


const init = (processedData) => {
    bacteriaTimeSeries = processedData.bacteriaTimeSeries;
    ({session} = createStates(CONFIG.GRID.WIDTH * CONFIG.GRID.HEIGHT));

    concentrationState = createBacteriumSystem(CONFIG, previusVars, previusParams,bacteriaTimeSeries[session.currentTimeStep]);
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
    //assignInitialConcentrations(bacteriaTimeSeries[session.currentTimeStep])
    animate();
    session.animationFrameId = requestAnimationFrame(animate);

    renderScene(histories, bacteriaDataUpdated, concentrations, CONFIG.BACTERIUM, session, constants);

};

const animate = () => {

    
    session.animationFrameId = requestAnimationFrame(animate);

    if (session.play) {
      singleStep();
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



























