
import {setupNewScene, renderScene,meshVisibility,scaleMesh,translateMesh,setCapsuleVisibility} from './scene/graphicsManager.js';
import {createBacteriumSystem,updateSimulation} from './simulation/simulationManager.js';
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



const guiActions = {
    setPlayState: (isPlaying) => {session.play = isPlaying;},
    setMeshVisible: (boolean) => {meshVisibility(boolean);},
    setMeshScale: (scale) => {scaleMesh(scale);},
    translateMesh: (z) => {translateMesh(z);},
    setCapsuleVisibility: (visible) => {setCapsuleVisibility(visible);},
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
    createBacteriumSystem(CONFIG);
    
    animate();
};

const animate = () => {

    
    let bacteriaDataUpdated;

    session.animationFrameId = requestAnimationFrame(animate);

    if (session.play) {

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
    
   

    renderScene(histories, bacteriaDataUpdated, concentrationState, CONFIG.BACTERIUM, session, constants, nextSlices);

    if (session.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        init(storedProcessedData);
    }
};

const updateData = () => {
    updateHistories(...globalParams);
    histories = getHistories();
    session.currentTimeStep++;
}

initGUI(init, guiActions);


console.log("Initial setup complete. Waiting for data file...");

























