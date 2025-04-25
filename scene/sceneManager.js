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
let stage = {};



export function setupNewScene(config) {

    stage = setupStage(config.SCENE, THREE, OrbitControls,stage,mesh);

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