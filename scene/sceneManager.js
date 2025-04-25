import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { BacteriumRenderer } from './sceneComponents/bacteria.js';
import { setupStage } from './setupStage.js';
import { updateSurfaceMesh } from './sceneComponents/mesh.js';

let plotRendererInstance = null;
let bacteriumRendererInstance = null;
let mesh = null;
let stage = null;



export function setupNewScene(config) {

        if (mesh && stage) {
            stage.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose(); // Ensure material is disposed too
            mesh = null; // Nullify the reference
            console.log("Surface mesh removed and disposed.");
        }

       // Clean up renderer
        if (stage) {
            stage.renderer.domElement.parentNode.removeChild(stage.renderer.domElement);
            stage.renderer.dispose();
        }


    stage = setupStage(config.SCENE, THREE, OrbitControls);

    
    // Initialize the bacterium visualization system
    bacteriumRendererInstance = new BacteriumRenderer(stage.scene, config, THREE);
    plotRendererInstance = new PlotRenderer(config);
    plotRendererInstance.init(THREE);

    // Setup the concentration visualization mesh
    mesh = setupMesh(stage, THREE,config);
        
}


export function renderScene(sceneState,bacteriaData, dataState, appConfig,animationState) {
    updateScene(sceneState, dataState, appConfig, animationState, mesh)
    if (plotRendererInstance.render) {
    plotRendererInstance.render();
    }
    if (stage.renderer && stage.scene && stage.camera) {
        stage.renderer.render(stage.scene, stage.camera);
    }
     if (bacteriumRendererInstance&& bacteriaData) {
        bacteriumRendererInstance.renderBacteria(bacteriaData);
    }
}


function updateScene(sceneState, dataState, appConfig, animationState, mesh) {
    updateSurfaceMesh(mesh, dataState, appConfig.GRID);
    updateOverlay( animationState,dataState);
    const histories = Object.values(sceneState.historyManager.getHistories());
    plotRendererInstance.updatePlot(...histories)

}