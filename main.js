
import {setupNewScene, renderScene} from './scene/graphicsManager.js';
import { addEventListeners } from './GUI/guiManager.js';



import {createBacteriumSystem,diffuse,setValue,
    updateBacteria,getPositions,getAdjustedCoordinates,
getGlobalParams
} from './simulation/simulationManager.js';
import { 
    createStates,createConstants,
    updateHistories,getHistories} from './state/stateManager.js';


let appConfig;
let animationState;
let constants;
let concentrationState;
let bacteriaTimeSeries;


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
    let bacteriaDataUpdated = null;

    if (animationState.play) {

        const currentBacteria = bacteriaTimeSeries[animationState.currentTimeStep];

        bacteriaDataUpdated = updateBacteria(currentBacteria, concentrationState.concentrationField);
        updateHistories(...getGlobalParams(bacteriaDataUpdated));
        diffusionStep(currentBacteria,concentrationState);
        animationState.currentTimeStep++;

    }
    const histories = getHistories();
    const concentration = concentrationState.concentrationField;

    renderScene(histories,bacteriaDataUpdated, concentration, appConfig.BACTERIUM, animationState, constants);

    if (animationState.currentTimeStep >= constants.numberOfTimeSteps) {
        console.log('Simulation finished.');
        animationState.currentTimeStep = 1;
        animationState.play = false;
    }
};

appConfig = addEventListeners(
    init,
    guiActions  // Pass simulation actions for GUI to use
);


console.log("Initial setup complete. Waiting for data file...");

































const diffusionStep = (currentBacteria,concentrationState) => {
    
    const positions = getPositions();
    updateSourcesAndSinks(currentBacteria,...positions);
    [concentrationState.concentrationField] = diffuse(
        appConfig,
        concentrationState,
        1, // Time step duration in minutes (dt)
        1 // Number of substeps for ADI
    ); 

}


const updateSourcesAndSinks = (currentBacteria,magentaIDsRaw,cyanIDsRaw) => {
    const MagentaIDs = new Set(magentaIDsRaw);
    const CyanIDs = new Set(cyanIDsRaw);

    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);

    // Iterate through each bacterium in the current time step
    for (const bacterium of currentBacteria) {
        // Convert bacterium's position to grid coordinates and index using appConfig.GRID
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, appConfig.GRID);

        // Skip if the bacterium is outside the valid grid area
        if (!coords) console.warn(`Bacterium ${bacterium.ID} is out of bounds `)

        // Increment source count if the bacterium is Magenta
        if (MagentaIDs.has(bacterium.ID)) {
            concentrationState.sources[coords.idx] += 1; // Simple count for now
        }

        // Increment sink count if the bacterium is Cyan
        if (CyanIDs.has(bacterium.ID)) {
            concentrationState.sinks[coords.idx] += 1; // Simple count for now
        }
    }
};




