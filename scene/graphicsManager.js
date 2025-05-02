import {THREE, OrbitControls, uPlot} from './graphycLibrariesImports.js';
import { setupMesh, updateSurfaceMesh } from './sceneComponents/mesh.js';
import { setupCapsulePool, updateCapsules } from './sceneComponents/capsulePool.js';
import { setupPlot, updatePlot } from './plot.js';
import { updateOverlay } from './overlay.js';
import { setupStage } from './sceneComponents/stage.js';



let mesh = null;
let stage = {};
let capsules = []; 
let plot = null; 


export function setupNewScene(config) {

    const SCENE = config.SCENE;
    const BACTERIUM = config.BACTERIUM;
    const GRID = config.GRID;


    stage = setupStage(SCENE, THREE, OrbitControls, stage, mesh, capsules);
    capsules = setupCapsulePool(stage, BACTERIUM, THREE, capsules);
    mesh = setupMesh(stage, THREE, GRID);
    plot = setupPlot( uPlot);

    stage.scene.add(new THREE.AxesHelper(10));
    stage.scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
}


export function renderScene(histories, bacteriaData, concentrationState, BACTERIUM, animationState, constants, nextSlices) {
    const concentration = concentrationState.concentrationField;
    if(bacteriaData) {
    updateScene( concentration, bacteriaData, BACTERIUM,nextSlices);
    }
    if (histories) {
        updatePlot(histories, plot);
    }
    updateOverlay(animationState, constants);
    stage.renderer.render(stage.scene, stage.camera);
}


function updateScene(concentration, bacteriaData, BACTERIUM,nextSlices) {


    updateSurfaceMesh(mesh, concentration, 10);
    updateCapsules(bacteriaData, BACTERIUM, THREE, capsules,nextSlices);
}






