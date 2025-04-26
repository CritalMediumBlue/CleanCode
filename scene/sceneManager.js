import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh,updateSurfaceMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { setupStage } from './sceneComponents/stage.js';
import { setupCapsulePool } from './sceneComponents/capsulePool.js';


let plotRendererInstance = null;
let mesh = null;
let stage = {};
let capsules = [];  
const capsuleGeometryCache = new Map();
const edgesGeometryCache = new Map();



export function setupNewScene(config) {

    const SCENE = config.SCENE;
    const BACTERIUM = config.BACTERIUM;
    const SIZE = BACTERIUM.INITIAL_POOL_SIZE;


    stage = setupStage(SCENE, THREE, OrbitControls, stage , mesh, capsules);
    capsules = setupCapsulePool(stage, SIZE, THREE, capsules);
    mesh = setupMesh(stage, THREE,config);



    plotRendererInstance = new PlotRenderer(config);
    plotRendererInstance.init(THREE);
        
}


export function renderScene(histories, bacteriaData, dataState, BACTERIUM, animationState) {
    updateScene(histories, dataState, animationState, mesh);
    if (plotRendererInstance.render) {
    plotRendererInstance.render();
    }
    stage.renderer.render(stage.scene, stage.camera);
    if (bacteriaData) {
        renderBacteria(bacteriaData, BACTERIUM, THREE);
    }
    
}


function updateScene(histories, dataState, animationState, mesh) {
    updateSurfaceMesh(mesh, dataState, 10);
    updateOverlay(animationState,dataState);

    plotRendererInstance.updatePlot(...histories)

}










function renderBacteria(bacteriaData, BACTERIUM, THREE) {
   // Reset active count and hide all capsules
   let activeCount = 0;
   capsules.forEach(capsule => {
        capsule.visible = false;
   });
   
   // Render each capsule
   bacteriaData.forEach(bacterium => {
       const capsule = capsules[activeCount++]
   
       const { position, angle, longAxis, phenotype, similarity } = bacterium;
   
       const threePosition = new THREE.Vector3(position.x, position.y, 0);

       
       
       capsule.position.set(threePosition.x, threePosition.y, 0);
       capsule.rotation.z = angle * Math.PI;  

       // Update geometry using the new function
       updateCapsuleGeometry(capsule, longAxis, BACTERIUM, THREE);
       
       // Update color
       updateBacteriumColor(capsule, phenotype,  BACTERIUM, THREE,similarity);
       
       // Set visibility
       capsule.visible = true;
   });
}

function updateBacteriumColor(bacterium, phenotype, BACTERIUM, THREE,similarity) {
    // Convert string phenotype to THREE.Color
    const color = phenotype === 'MAGENTA' ? 0xFF00FF : 0x00FFFF;


    const threeColor = new THREE.Color(color);

    switch (BACTERIUM.COLOR_BY_INHERITANCE) {
        case true:
            // Color by phenotype
            bacterium.material.color.copy(threeColor);
            bacterium.children[0].material.color.copy(threeColor.clone().multiplyScalar(0.3));
            break;
            
        case false:
            // Color by similarity
            const scalar = Math.round(similarity * 255);
                
            const similarityColor = new THREE.Color(`rgb(${scalar}, ${scalar}, ${255-scalar})`);
            bacterium.material.color.set(similarityColor);
            bacterium.children[0].material.color.set(similarityColor.clone().multiplyScalar(0.3));
            break;
        }
}

/**
 * Updates a capsule's geometry based on the specified length
 * @param {THREE.Mesh} capsule - The capsule mesh to update
 * @param {number} longAxis - The new length for the capsule
 */
function updateCapsuleGeometry(capsule, longAxis, BACTERIUM, THREE) {
    // Get or create geometry for this length
    let newGeometry = capsuleGeometryCache.get(longAxis);
    let newWireframeGeometry = edgesGeometryCache.get(longAxis);

    if (!newGeometry) {
        newGeometry = new THREE.CapsuleGeometry(
            0.5,
            longAxis,
            BACTERIUM.CAP_SEGMENTS,
            BACTERIUM.RADIAL_SEGMENTS
        );
        console.log("Creating new capsule geometry for length:", longAxis)

        capsuleGeometryCache.set(longAxis, newGeometry);
        newWireframeGeometry = new THREE.EdgesGeometry(newGeometry);
        edgesGeometryCache.set(longAxis, newWireframeGeometry);
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
