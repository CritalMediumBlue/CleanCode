
import {setupNewScene, renderScene} from './scene/graphicsManager.js';
import { addEventListeners } from './GUI/guiManager.js';



import {createBacteriumSystem,setValue,updateSimulation} from './simulation/simulationManager.js';
import { 
    createStates,createConstants,
    updateHistories,getHistories} from './state/stateManager.js';


let appConfig;
let animationState;
let constants;
let concentrationState;
let bacteriaTimeSeries;

let bacteriaDataUpdated;
let histories;
let globalParams




const guiActions = {
    setValue: (value,param) => {setValue(value,param);},
    setPlayState: (isPlaying) => {animationState.play = isPlaying;}
};


const init = (processedData) => {

    if (animationState) { 
        cancelAnimationFrame(animationState.animationFrameId);
    }
    
    ({animationState,concentrationState} = createStates(appConfig.GRID.WIDTH * appConfig.GRID.HEIGHT));
    constants = createConstants();

    setupNewScene(appConfig);
    createBacteriumSystem(appConfig);
    bacteriaTimeSeries = processedData.bacteriaTimeSeries;
    constants.numberOfTimeSteps = bacteriaTimeSeries.length;
    constants.fromStepToMinutes = constants.doublingTime / processedData.averageLifetime;
    Object.freeze(constants); 
    animate();
};


const animate = () => {
    animationState.animationFrameId = requestAnimationFrame(animate);

    if (animationState.play) {

        const currentBacteria = bacteriaTimeSeries[animationState.currentTimeStep];

        ({ bacteriaDataUpdated, globalParams } = updateSimulation(
            currentBacteria, concentrationState, appConfig
        ));

        updateData();

    }

    renderScene(histories, bacteriaDataUpdated, concentrationState, appConfig.BACTERIUM, animationState, constants);

    if (animationState.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        animationState.currentTimeStep = 1;
        animationState.play = false;
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

























