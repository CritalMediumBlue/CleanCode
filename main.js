
import {setupNewScene, renderScene,meshVisibility,scaleMesh,translateMesh,setCapsuleVisibility, 
    setColorMultiplier,visibleGridAndAxes,takeScreenshot} from './scene/graphicsManager.js';
import {createBacteriumSystem,updateSimulation, setParamFromGUI,assignInitialConcentrations} from './simulation/simulationManager.js';
import { createStates,createConstants,updateHistories,getHistories,resetHistories} from './state/stateManager.js';
import { initGUI } from './GUI/controlManager.js';    
import { CONFIG } from './config.js';



let session;
let constants;
let concentrationState;
let bacteriaTimeSeries;

let histories;
let globalParams;
const nextSlices = [];
let storedProcessedData;
let bacteriaDataUpdated;


const guiActions = {
    setPlayState: () => {session.play = !session.play;},
    setMeshVisible: (boolean) => {meshVisibility(boolean);},
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
    setModel: (vars, params, eqs) => {createBacteriumSystem(CONFIG, vars, params, eqs); }

};


const init = (processedData) => {
    constants = createConstants();
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
    
    ({session,concentrationState} = createStates(CONFIG.GRID.WIDTH * CONFIG.GRID.HEIGHT));

    setupNewScene(CONFIG);
    assignInitialConcentrations(bacteriaTimeSeries[session.currentTimeStep])
    animate();
};

const animate = () => {

    
    session.animationFrameId = requestAnimationFrame(animate);

    if (session.play) {
      singleStep();
    }
    
   
    renderScene(histories, bacteriaDataUpdated, concentrationState, CONFIG.BACTERIUM, session, constants, nextSlices);

    if (session.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        init(storedProcessedData);
    }

};

const singleStep = () => {  
     const currentBacteria = bacteriaTimeSeries[session.currentTimeStep];

        ({bacteriaDataUpdated,globalParams} = updateSimulation(currentBacteria, concentrationState,constants.fromStepToMinutes));

        updateData();

        const stepsInTheFuture = 100;
        nextSlices.length = 0;
        for (let i = 0; i < stepsInTheFuture; i++) {
            if (session.currentTimeStep + i < constants.numberOfTimeSteps) {
                const nextBacteria = bacteriaTimeSeries[session.currentTimeStep + i];
                nextSlices.push(nextBacteria);
            }
        }
}

const updateData = () => {
    updateHistories(...globalParams);
    histories = getHistories();
    session.currentTimeStep++;
}

initGUI(guiActions);


console.log("Initial setup complete. Waiting for data file...");

























