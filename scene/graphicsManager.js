import {THREE, OrbitControls, Chart} from './graphycLibrariesImports.js';
import { setupMesh, updateSurfaceMesh } from './sceneComponents/mesh.js';
import { setupCapsulePool, updateCapsules, setBacterialColor , coloringRule} from './sceneComponents/capsulePool.js';
import { setupPlot, updatePlot } from './plot.js';
import { updateOverlay } from './overlay.js';
import { setupStage } from './sceneComponents/stage.js';
export {setBacterialColor}


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
let helperGrid = null;
let helperAxes = null;
let species = null; // Default species, can be changed


export function setupNewScene(config,previusVars) {


    const SCENE = config.SCENE;
    BACTERIUM = config.BACTERIUM;
    const GRID = config.GRID;
  

    stage = setupStage(SCENE, THREE, OrbitControls, stage, mesh, capsules);
    capsules = setupCapsulePool(stage, BACTERIUM, THREE, capsules);
    mesh = setupMesh(stage, THREE, GRID);
    plot = setupPlot(Chart,previusVars, coloringRule);
    helperAxes = new THREE.AxesHelper(100);
    helperGrid = new THREE.GridHelper(200, 200, 0xFFFFFF, 0xFFFFFF);
    helperGrid.material.transparent = true;
    helperGrid.material.opacity = 0.50;
    helperGrid.rotation.x = Math.PI / 2; 
    

    stage.scene.add(helperAxes);
    stage.scene.add(helperGrid);
    
    stage.scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
}


export function renderScene(histories, bacteriaData, concentrationState, BACTERIUM, session, constants) {
    

        
        if(species !== null) {
        const concentration = concentrationState[species].conc;
       
        updateSurfaceMesh(mesh, concentration, meshScale, meshTranslationZ, colorMultiplier);
        }
        
        if(bacteriaData) {
            currentBacteriaData = bacteriaData;
            updateCapsules(bacteriaData, BACTERIUM, THREE, capsules, capsuleVisibility);
        }
        
        if (histories && session.currentTimeStep % 10 === 0 && session.play) {
            // Check and log the structure of histories to debug
            updatePlot(histories, plot, coloringRule);
        } 
        updateOverlay(session, constants);
        stage.renderer.render(stage.scene, stage.camera);

   

}

export function meshVisibility(boolean) {
    mesh.visible = boolean;
}
export function selectSpecies(speciesName) {
    species = speciesName;
}
export function scaleMesh(scale) {
    meshScale = scale;
}
export function translateMesh(z){
    meshTranslationZ = z;
}
export function setCapsuleVisibility(visible) {
    capsuleVisibility = visible;
    updateCapsules(currentBacteriaData, BACTERIUM, THREE, capsules, capsuleVisibility);
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


