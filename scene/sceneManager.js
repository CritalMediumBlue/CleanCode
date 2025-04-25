import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { BacteriaPool} from './sceneComponents/bacteriaPool.js';
import { setupStage } from './setupStage.js';
import { updateSurfaceMesh } from './sceneComponents/mesh.js';

let plotRendererInstance = null;
let mesh = null;
let stage = {};
let bacteriaPool = null;



export function setupNewScene(config) {

    stage = setupStage(config.SCENE, THREE, OrbitControls,stage,mesh);


    plotRendererInstance = new PlotRenderer(config);
    plotRendererInstance.init(THREE);

    // Setup the concentration visualization mesh
    mesh = setupMesh(stage, THREE,config);
    bacteriaPool = setupBacteriaPool(stage, config, THREE);



        
}


export function renderScene(sceneState, bacteriaData, dataState, appConfig, animationState) {
    updateScene(sceneState, dataState, appConfig, animationState, mesh)
    if (plotRendererInstance.render) {
    plotRendererInstance.render();
    }
    stage.renderer.render(stage.scene, stage.camera);
    if (bacteriaData) {
        renderBacteria(bacteriaData, appConfig);
    }
    
}


function updateScene(sceneState, dataState, appConfig, animationState, mesh) {
    updateSurfaceMesh(mesh, dataState, appConfig.GRID);
    updateOverlay( animationState,dataState);

    const histories = Object.values(sceneState.historyManager.getHistories());
    plotRendererInstance.updatePlot(...histories)

}







function setupBacteriaPool(stage, config, THREE) {
    return new BacteriaPool(stage.scene, config.BACTERIUM.INITIAL_POOL_SIZE, config, THREE);
}





function setBacteriumTransform(bacterium, position, angle, zPosition) {
    bacterium.position.set(position.x, position.y, zPosition);
    bacterium.rotation.z = angle * Math.PI; // 0 or PI means vertical, PI/2 means horizontal
}



const phenotypeColors = {
    'MAGENTA': new THREE.Color(0xFF00FF),
    'CYAN': new THREE.Color(0x00FFFF)
};


function renderBacteria(bacteriaData, config) {


   // Reset the pool for new render
   bacteriaPool.reset();
   
   // Render each bacterium
   bacteriaData.forEach(data => {
       const bacterium = bacteriaPool.getBacterium();
   
       const { position, angle, longAxis, phenotype, magentaProportion, cyanProportion, visible } = data;
   
       // Convert plain position to THREE.Vector3
       const threePosition = new THREE.Vector3(position.x, position.y, position.z || 0);
       
       // Set position and rotation
       setBacteriumTransform(bacterium, threePosition, angle, position.z || 0);
       
       // Update geometry using THREE
       bacteriaPool.updateGeometry(bacterium, longAxis);
       
       // Update color
       updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion, phenotypeColors, config, THREE);
       
       // Set visibility
       bacterium.visible = visible;
   });
}

function updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion, phenotypeColors, config, THREE) {
    // Convert string phenotype to THREE.Color
    const threeColor = phenotypeColors[phenotype];

    if (config.BACTERIUM.COLOR_BY_INHERITANCE) {
        // Color by phenotype
        bacterium.material.color.copy(threeColor);
        bacterium.children[0].material.color.copy(threeColor.clone().multiplyScalar(0.5));
    } else {
        // Color by similarity
        const isMagenta = phenotype === config.PHENOTYPES.MAGENTA;
        const scalar = isMagenta
            ? Math.round(magentaProportion * 255) 
            : Math.round(cyanProportion * 255);
            
        const similarityColor = new THREE.Color(`rgb(${scalar}, ${scalar}, ${255-scalar})`);
        bacterium.material.color.set(similarityColor);
        bacterium.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.5));
    }
}
