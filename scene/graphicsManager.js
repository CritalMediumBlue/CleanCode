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
let phaseSpace = null;
let meshScale = 15;
let meshTranslationZ = -10;
let capsuleVisibility = true;
let currentBacteriaData = null;
let BACTERIUM = null;
let currentnextSlices = null;


export function setupNewScene(config) {

    const SCENE = config.SCENE;
    BACTERIUM = config.BACTERIUM;
    const GRID = config.GRID;


    stage = setupStage(SCENE, THREE, OrbitControls, stage, mesh, capsules);
    capsules = setupCapsulePool(stage, BACTERIUM, THREE, capsules);
    mesh = setupMesh(stage, THREE, GRID);
    plot = setupPlot(uPlot, "timeSeries");
    phaseSpace = setupPlot(uPlot, "phaseSpace");

    stage.scene.add(new THREE.AxesHelper(10));
    
    stage.scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
}


export function renderScene(histories, bacteriaData, concentrationState, BACTERIUM, session, constants, nextSlices) {
    
    if (session.currentTimeStep % 1 === 0 || !session.play) {
        
        const concentration = concentrationState.concentrationField;
        const cytoplasmicconcentrations = getCytoConcentration(bacteriaData);
        updateSurfaceMesh(mesh, concentration, meshScale, meshTranslationZ);
        
        if(bacteriaData) {
            currentBacteriaData = bacteriaData;
            currentnextSlices = nextSlices;
            updateCapsules(bacteriaData, BACTERIUM, THREE, capsules,nextSlices, capsuleVisibility);
        }
        
         if (cytoplasmicconcentrations && histories) {
            updatePlot(cytoplasmicconcentrations, phaseSpace, "phaseSpace");
            updatePlot(histories, plot, "timeSeries");
        } 
        updateOverlay(session, constants);
        stage.renderer.render(stage.scene, stage.camera);
    }
}

export function meshVisibility(boolean) {
    mesh.visible = boolean;
}
export function scaleMesh(scale) {
    meshScale = scale;
}
export function translateMesh(z){
    meshTranslationZ = z;
}
export function setCapsuleVisibility(visible) {
    capsuleVisibility = visible;
    updateCapsules(currentBacteriaData, BACTERIUM, THREE, capsules, currentnextSlices, capsuleVisibility);
}


const getCytoConcentration = (bacteriaData) => {
    if (!bacteriaData || bacteriaData.length === 0) {
        return;
    }
    const numOfBacteria = bacteriaData.length;
    const aimP = new Float64Array(numOfBacteria);
    const aimR = new Float64Array(numOfBacteria);

    bacteriaData.forEach((bacterium, index) => {
        const cytoplasmConcentrations = bacterium.cytoplasmConcentrations;
        aimP[index] = cytoplasmConcentrations.p;
        aimR[index] = cytoplasmConcentrations.r;
    });
    
    // Sort the indices based on aimP values
    const sortedIndices = Array.from(aimP.keys()).sort((a, b) => aimP[a] - aimP[b]);
    const sortedAimP = sortedIndices.map(i => aimP[i]);
    const sortedAimR = sortedIndices.map(i => aimR[i]);

    return [sortedAimP, sortedAimR]; // Return the sorted arrays
}


