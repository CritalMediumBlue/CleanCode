import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { setupStage } from './setupStage.js';
import { updateSurfaceMesh } from './sceneComponents/mesh.js';
import { setupBacteriaPool } from './sceneComponents/capsulePool.js';


let plotRendererInstance = null;
let mesh = null;
let stage = {};
let capsules = [];  
let activeCount = 0;
const capsuleGeometryCache = new Map();
const edgesGeometryCache = new Map();



export function setupNewScene(config) {

    stage = setupStage(config.SCENE, THREE, OrbitControls,stage,mesh);


    plotRendererInstance = new PlotRenderer(config);
    plotRendererInstance.init(THREE);

    const size = config.BACTERIUM.INITIAL_POOL_SIZE;

    mesh = setupMesh(stage, THREE,config);
    capsules = setupBacteriaPool(stage, size, THREE,capsules);

        
}


export function renderScene(sceneState, bacteriaData, dataState, appConfig, animationState) {
    updateScene(sceneState, dataState, appConfig, animationState, mesh);
    if (plotRendererInstance.render) {
    plotRendererInstance.render();
    }
    stage.renderer.render(stage.scene, stage.camera);
    if (bacteriaData) {
        renderBacteria(bacteriaData, appConfig, THREE);
    }
    
}


function updateScene(sceneState, dataState, appConfig, animationState, mesh) {
    updateSurfaceMesh(mesh, dataState, appConfig.GRID);
    updateOverlay(animationState,dataState);

    const histories = Object.values(sceneState.historyManager.getHistories());
    plotRendererInstance.updatePlot(...histories)

}










function renderBacteria(bacteriaData, config, THREE) {
   // Reset active count and hide all capsules
   activeCount = 0;
   capsules.forEach(capsule => {
        capsule.visible = false;
   });
   
   // Render each bacterium
   bacteriaData.forEach(data => {
       const bacterium = capsules[activeCount++]
   
       const { position, angle, longAxis, phenotype, magentaProportion, cyanProportion, visible = true } = data;
   
       const threePosition = new THREE.Vector3(position.x, position.y, 0);
       
       bacterium.position.set(threePosition.x, threePosition.y, 0);
       bacterium.rotation.z = angle * Math.PI;  

       // Update geometry using the new function
       updateCapsuleGeometry(bacterium, longAxis, config.BACTERIUM, THREE);
       
       // Update color
       updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion, config, THREE);
       
       // Set visibility
       bacterium.visible = visible;
   });
}

function updateBacteriumColor(bacterium, phenotype, magentaProportion, cyanProportion, config, THREE) {
    // Convert string phenotype to THREE.Color
    const threeColor = new THREE.Color(config.COLORS[phenotype]);

    switch (config.BACTERIUM.COLOR_BY_INHERITANCE) {
        case true:
            // Color by phenotype
            bacterium.material.color.copy(threeColor);
            bacterium.children[0].material.color.copy(threeColor.clone().multiplyScalar(0.3));
            break;
            
        case false:
            // Color by similarity
            const isMagenta = phenotype === config.PHENOTYPES.MAGENTA;
            const scalar = isMagenta
                ? Math.round(magentaProportion * 255) 
                : Math.round(cyanProportion * 255);
                
            const similarityColor = new THREE.Color(`rgb(${scalar}, ${scalar}, ${255-scalar})`);
            bacterium.material.color.set(similarityColor);
            bacterium.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.3));
            break;
        }
}

/**
 * Updates a capsule's geometry based on the specified length
 * @param {THREE.Mesh} capsule - The capsule mesh to update
 * @param {number} adjustedLength - The new length for the capsule
 */
function updateCapsuleGeometry(capsule, adjustedLength, BACTERIUM, THREE) {
    // Get or create geometry for this length
    let newGeometry = capsuleGeometryCache.get(adjustedLength);
    let newWireframeGeometry = edgesGeometryCache.get(adjustedLength);

    if (!newGeometry) {
        newGeometry = new THREE.CapsuleGeometry(
            0.5,
            adjustedLength,
            BACTERIUM.CAP_SEGMENTS,
            BACTERIUM.RADIAL_SEGMENTS
        );
        capsuleGeometryCache.set(adjustedLength, newGeometry);
        newWireframeGeometry = new THREE.EdgesGeometry(newGeometry);
        edgesGeometryCache.set(adjustedLength, newWireframeGeometry);
    }

    // Update geometry if different from current
    if (capsule.geometry !== newGeometry) {
        capsule.geometry.dispose();
        capsule.geometry = newGeometry;

        const wireframe = capsule.children[0];
        wireframe.geometry.dispose();
        wireframe.geometry = newWireframeGeometry;
        wireframe.scale.set(
            BACTERIUM.WIREFRAME_SCALE, 
            BACTERIUM.WIREFRAME_SCALE, 
            BACTERIUM.WIREFRAME_SCALE
        );
    }
}
