
import {setupNewScene, renderScene,meshVisibility} from './scene/graphicsManager.js';
import { addEventListeners } from './GUI/guiManager.js';
import {
    createBacteriumSystem,
    updateSimulation
    } from './simulation/simulationManager.js';
import { 
    createStates,
    createConstants,
    updateHistories,
    getHistories,
    resetHistories} from './state/stateManager.js';


let appConfig;
let animationState;
let constants;
let concentrationState;
let bacteriaTimeSeries;

let histories;
let globalParams;
const nextSlices = [];
let storedProcessedData;




const guiActions = {
    setPlayState: (isPlaying) => {animationState.play = isPlaying;},
    setMeshVisible: () => {meshVisibility();},
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
    if (animationState) { 
        cancelAnimationFrame(animationState.animationFrameId);
    }
    
    ({animationState,concentrationState} = createStates(appConfig.GRID.WIDTH * appConfig.GRID.HEIGHT));

    setupNewScene(appConfig);
    createBacteriumSystem(appConfig);
    
    animate();
};

const animate = () => {

    
    let bacteriaDataUpdated;

    animationState.animationFrameId = requestAnimationFrame(animate);

    if (animationState.play) {

        const currentBacteria = bacteriaTimeSeries[animationState.currentTimeStep];

        ({bacteriaDataUpdated,globalParams} = updateSimulation(currentBacteria, concentrationState,constants.fromStepToMinutes));

        updateData();

        const stepsInTheFuture = 100;
        nextSlices.length = 0;
        for (let i = 0; i < stepsInTheFuture; i++) {
            if (animationState.currentTimeStep + i < constants.numberOfTimeSteps) {
                const nextBacteria = bacteriaTimeSeries[animationState.currentTimeStep + i];
                nextSlices.push(nextBacteria);
            }
        }

    }
    
   

    renderScene(histories, bacteriaDataUpdated, concentrationState, appConfig.BACTERIUM, animationState, constants, nextSlices);

    if (animationState.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        init(storedProcessedData);
    }
};

const updateData = () => {
    updateHistories(...globalParams);
    histories = getHistories();
    animationState.currentTimeStep++;
}

appConfig = addEventListeners(
    init,
    guiActions  // Pass simulation actions for GUI to use
);


console.log("Initial setup complete. Waiting for data file...");

























