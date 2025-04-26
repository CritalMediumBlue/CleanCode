import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh,updateSurfaceMesh } from './sceneComponents/mesh.js';
import { setupCapsulePool, updateCapsules } from './sceneComponents/capsulePool.js';
import { setupPlot } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { setupStage } from './sceneComponents/stage.js';


let mesh = null;
let stage = {};
let capsules = [];  
let plot = null;



export function setupNewScene(config) {

    const SCENE = config.SCENE;
    const BACTERIUM = config.BACTERIUM;


    stage = setupStage(SCENE, THREE, OrbitControls, stage , mesh, capsules);
    capsules = setupCapsulePool(stage, BACTERIUM, THREE, capsules);
    mesh = setupMesh(stage, THREE,config);
    plot = setupPlot(THREE, config);

}


export function renderScene(histories, bacteriaData, dataState, BACTERIUM, animationState) {
    updateScene(histories, dataState, animationState, bacteriaData, BACTERIUM);


    plot.render();
    stage.renderer.render(stage.scene, stage.camera);
}



function updateScene(histories, dataState, animationState, bacteriaData, BACTERIUM) {

    const concentration = dataState.currentConcentrationData;

    updateSurfaceMesh(mesh, concentration, 10);
    updateOverlay(animationState,dataState);
    updateCapsules(bacteriaData, BACTERIUM, THREE, capsules);

    plot.updatePlot(...histories)

}




