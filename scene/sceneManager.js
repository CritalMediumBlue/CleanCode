import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh, updateSurfaceMesh } from './sceneComponents/mesh.js';
import { setupCapsulePool, updateCapsules } from './sceneComponents/capsulePool.js';
import { setupPlot, updatePlot } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { setupStage } from './sceneComponents/stage.js';



let mesh = null;
let stage = {};
let capsules = []; 
let plot = null; 


export function setupNewScene(config) {

    const SCENE = config.SCENE;
    const BACTERIUM = config.BACTERIUM;
    const GRID = config.GRID;
    const PLOT = config.PLOT;


    stage = setupStage(SCENE, THREE, OrbitControls, stage, mesh, capsules);
    capsules = setupCapsulePool(stage, BACTERIUM, THREE, capsules);
    mesh = setupMesh(stage, THREE, GRID);
    plot = setupPlot(PLOT);

    stage.scene.add(new THREE.AxesHelper(10));
    stage.scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
}


export function renderScene(histories, bacteriaData, dataState, BACTERIUM, animationState) {
    updateScene( dataState, animationState, bacteriaData, BACTERIUM);
    updatePlot(histories, plot);
    
    stage.renderer.render(stage.scene, stage.camera);
}


function updateScene(dataState, animationState, bacteriaData, BACTERIUM) {

    const concentration = dataState.currentConcentrationData;
    const bacteriaCount = bacteriaData ? bacteriaData.length : 0;

    updateSurfaceMesh(mesh, concentration, 10);
    updateOverlay(animationState, bacteriaCount);
    updateCapsules(bacteriaData, BACTERIUM, THREE, capsules);
}






