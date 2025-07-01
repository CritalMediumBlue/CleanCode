import {THREE, OrbitControls, Chart} from './graphycLibrariesImports.js';
import { setupMesh, updateSurfaceMesh } from './sceneComponents/mesh.js';
import { setupCapsulePool, updateCapsules } from './sceneComponents/capsulePool.js';
import { setupPlot, updatePlot } from './plot.js';
import { updateOverlay } from './overlay.js';
import { setupStage } from './sceneComponents/stage.js';



let mesh = null;
let stage = {};
let capsules = []; 
let plot = null; 
let meshScale = 15;
let meshTranslationZ = -10;
let colorMultiplier = 1; 
let capsuleVisibility = true;
let currentBacteriaData = null;
let BACTERIUM = null;
let currentnextSlices = null;
let helperGrid = null;
let helperAxes = null;
let species = "AimP";


export function setupNewScene(config) {


    const SCENE = config.SCENE;
    BACTERIUM = config.BACTERIUM;
    const GRID = config.GRID;


    stage = setupStage(SCENE, THREE, OrbitControls, stage, mesh, capsules);
    capsules = setupCapsulePool(stage, BACTERIUM, THREE, capsules);
    mesh = setupMesh(stage, THREE, GRID);
    plot = setupPlot(Chart);
    helperAxes = new THREE.AxesHelper(100);
    helperGrid = new THREE.GridHelper(200, 200, 0xFFFFFF, 0xFFFFFF);
    helperGrid.material.transparent = true;
    helperGrid.material.opacity = 0.50;
    helperGrid.rotation.x = Math.PI / 2; 
    

    stage.scene.add(helperAxes);
    stage.scene.add(helperGrid);
    
    stage.scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
}


export function renderScene(histories, bacteriaData, concentrationState, BACTERIUM, session, constants, nextSlices) {
    
    if (session.currentTimeStep % 1 === 0 ) {

        

        const concentration = concentrationState[species].conc;
     
        updateSurfaceMesh(mesh, concentration, meshScale, meshTranslationZ, colorMultiplier);
        
        if(bacteriaData) {
            currentBacteriaData = bacteriaData;
            currentnextSlices = nextSlices;
            updateCapsules(bacteriaData, BACTERIUM, THREE, capsules,nextSlices, capsuleVisibility);
        }
        
         if (histories && session.currentTimeStep % 5 ===0){
            updatePlot(histories, plot);
        } 
        updateOverlay(session, constants);
        stage.renderer.render(stage.scene, stage.camera);
    }
}

export function meshVisibility(boolean) {
    mesh.visible = boolean;
}
export function selectSpecies(speciesName) {
    species = speciesName;
    console.log(`Selected species: ${species}`);
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
export function setColorMultiplier(multiplier) {
    colorMultiplier = multiplier;
}
export function visibleGridAndAxes(visible) {
    helperGrid.visible = visible;
    helperAxes.visible = visible;
}


export function takeScreenshot(filename = 'screenshot') {
  const canvas = stage.renderer.domElement;
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${filename}.png`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  }


