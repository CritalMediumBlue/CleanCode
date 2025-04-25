import {THREE, OrbitControls} from './threeImports.js';
import { setupMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { BacteriumRenderer } from './sceneComponents/bacteria.js';
import { setupScene } from './scene.js';

let plotRendererInstance = null;
let bacteriumRendererInstance = null;

export function renderScene(sceneState,bacteriaData, dataState, appConfig,animationState) {
    updateScene(sceneState, dataState, appConfig, animationState)
    if (plotRendererInstance.render) {
    plotRendererInstance.render();
    }
    if (sceneState.renderer && sceneState.scene && sceneState.camera) {
        sceneState.renderer.render(sceneState.scene, sceneState.camera);
    }
     if (bacteriumRendererInstance&& bacteriaData) {
        bacteriumRendererInstance.renderBacteria(bacteriaData);
    }
}


/**
 * Sets up a new scene with custom surface mesh for concentration visualization.
 * @param {Object} config - Configuration object
 * @returns {Object} An object containing the scene components
 */
export function setupNewScene(config) {
    console.log("Setting up new scene...");
    const stage = setupScene(config, THREE, OrbitControls);

    // Append renderer to document if not already done
    document.body.appendChild(stage.renderer.domElement);
    
    // Initialize the bacterium visualization system
    bacteriumRendererInstance = new BacteriumRenderer(stage.scene, config, THREE);
    plotRendererInstance = new PlotRenderer(config);
    plotRendererInstance.init(THREE);

    // Setup the concentration visualization mesh
    setupMesh(stage, THREE,config);
    
    // Setup the plot renderer
    
    return stage;
}



function updateScene(sceneState, dataState, appConfig, animationState) {
    updateSurfaceMesh(sceneState, dataState, appConfig.GRID);
    updateOverlay( animationState,dataState);
    const histories = Object.values(sceneState.historyManager.getHistories());
    plotRendererInstance.updatePlot(...histories)

}




const calculateColor = (concentration) => {
    // Normalize concentration value
    const normalizedConcentration = concentration ; 

    // Calculate the phase for the sine wave
    const phase = normalizedConcentration * 2 * Math.PI;

    // Calculate RGB components using sine waves with phase shifts, scaled to [0, 1]
    const red = (Math.sin(phase) + 1) / 2;
    const green = (Math.sin(phase - (2 * Math.PI / 3)) + 1) / 2;
    const blue = (Math.sin(phase - (4 * Math.PI / 3)) + 1) / 2;

    // Return RGB values, ensuring they are not NaN
    return {
        r: isNaN(red) ? 0 : red,
        g: isNaN(green) ? 0 : green,
        b: isNaN(blue) ? 0 : blue
    };
};

function updateSurfaceMesh(sceneState, dataState, grid, heightMultiplier = 10) {
  

    const surfaceMesh = sceneState.surfaceMesh;
    const concentrationData = dataState.currentConcentrationData;
    if (!surfaceMesh) {
        console.warn(" called before surfaceMesh is initialized.");
        return;
    }

    // Get direct access to the position and color buffer arrays
    const positions = surfaceMesh.geometry.attributes.position.array; // x, y, z for each vertex
    const colorsAttribute = surfaceMesh.geometry.attributes.color; // r, g, b for each vertex

    // Iterate through each point in the grid
    for (let y = 0; y < grid.HEIGHT; y++) {
        for (let x = 0; x < grid.WIDTH; x++) {
            const idx = y * grid.WIDTH + x; // Calculate 1D index
            const bufferIndex = 3 * idx; // Base index for position and color arrays

            // --- Update Height (Z-position) ---
            let concentration = concentrationData[idx];
            if (isNaN(concentration)) {
                concentration = 0.0;
                // Note: We don't modify the original data array here, as that should be handled
                // by the calling code if needed
            }
            const height = concentration; // Direct mapping
            positions[bufferIndex + 2] = isNaN(height) ? 0 : height * heightMultiplier; // Set Z value

            // --- Update Color ---
            const color = calculateColor(concentration);
            colorsAttribute.array[bufferIndex] = color.r;
            colorsAttribute.array[bufferIndex + 1] = color.g;
            colorsAttribute.array[bufferIndex + 2] = color.b;
        }
    }

    // Mark attributes as needing update for Three.js
    surfaceMesh.geometry.attributes.position.needsUpdate = true;
    surfaceMesh.geometry.attributes.color.needsUpdate = true;
}

function createBacteriumRenderer(scene, config) {
    // Pass THREE to BacteriumRenderer to implement dependency injection
    return new BacteriumRenderer(scene, config, THREE);
}


