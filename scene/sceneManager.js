import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { setupStage } from './setupStage.js';
import { updateSurfaceMesh } from './sceneComponents/mesh.js';


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

    // Setup the concentration visualization mesh
    mesh = setupMesh(stage, THREE,config);
    capsules = setupBacteriaPool(stage, config, THREE,capsules);

        
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
    updateOverlay( animationState,dataState);

    const histories = Object.values(sceneState.historyManager.getHistories());
    plotRendererInstance.updatePlot(...histories)

}







function   expandPool(Size,config, THREE, capsules) {
        while (capsules.length < Size) {
            const capsule = createCapsule(config, THREE);
            capsules.push(capsule);
        }
        return capsules;
}

function createCapsule(config, THREE) {
        const capsuleGeometry = new THREE.CapsuleGeometry(
            0.4,
            1,
            config.BACTERIUM.CAP_SEGMENTS,
            config.BACTERIUM.RADIAL_SEGMENTS
        );
        const capsuleMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(0xffffff),
            transparent: true,
            opacity: 1
        });
        
        const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
        
        // Add wireframe
        const wireframeGeometry = new THREE.EdgesGeometry(capsuleGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: new THREE.Color(config.BACTERIUM.WIREFRAME_COLOR) 
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        
        capsule.add(wireframe);
        
        return capsule;
    }



function getCapsule(config, THREE) {
    if (activeCount >= capsules.length) {
        const newSize = Math.ceil(capsules.length * config.BACTERIUM.POOL_GROWTH_FACTOR);
        console.log(`Expanding pool from ${capsules.length} to ${newSize}`);
        capsules = expandPool(newSize, config, THREE, capsules);
    }
    return capsules[activeCount++];
}







function setupBacteriaPool(stage, config, THREE, capsules) {
    const initialSize = config.BACTERIUM.INITIAL_POOL_SIZE;
    
    // Expand the pool to the initial size
    capsules = expandPool(initialSize, config, THREE, capsules);

    // Add all capsules to the scene
    capsules.forEach(capsule => {
        stage.scene.add(capsule);
    });
    return capsules;

}





function setBacteriumTransform(bacterium, position, angle, zPosition) {
    bacterium.position.set(position.x, position.y, zPosition);
    bacterium.rotation.z = angle * Math.PI; // 0 or PI means vertical, PI/2 means horizontal
}



const phenotypeColors = {
    'MAGENTA': new THREE.Color(0xFF00FF),
    'CYAN': new THREE.Color(0x00FFFF)
};


function renderBacteria(bacteriaData, config, THREE) {
   // Reset active count and hide all capsules
   activeCount = 0;
   capsules.forEach(capsule => {
        capsule.visible = false;
   });
   
   // Render each bacterium
   bacteriaData.forEach(data => {
       const bacterium = getCapsule(config, THREE); // Get a capsule from the pool
   
       const { position, angle, longAxis, phenotype, magentaProportion, cyanProportion, visible = true } = data;
   
       const threePosition = new THREE.Vector3(position.x, position.y, position.z || 0);
       
       // Set position and rotation
       setBacteriumTransform(bacterium, threePosition, angle, position.z || 0);
       
       // Update geometry using the new function
       updateCapsuleGeometry(bacterium, longAxis, config, THREE);
       
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

/**
 * Updates a capsule's geometry based on the specified length
 * @param {THREE.Mesh} capsule - The capsule mesh to update
 * @param {number} adjustedLength - The new length for the capsule
 */
function updateCapsuleGeometry(capsule, adjustedLength, config, THREE) {
    // Get or create geometry for this length
    let newGeometry = capsuleGeometryCache.get(adjustedLength);
    let newWireframeGeometry = edgesGeometryCache.get(adjustedLength);

    if (!newGeometry) {
        newGeometry = new THREE.CapsuleGeometry(
            0.4,
            adjustedLength,
            config.BACTERIUM.CAP_SEGMENTS,
            config.BACTERIUM.RADIAL_SEGMENTS
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
            config.BACTERIUM.WIREFRAME_SCALE, 
            config.BACTERIUM.WIREFRAME_SCALE, 
            config.BACTERIUM.WIREFRAME_SCALE
        );
    }
}
