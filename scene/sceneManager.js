import {THREE, OrbitControls} from './threeImports.js';
import { createMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plot.js';
import { updateOverlay } from './sceneComponents/overlay.js';
import { BacteriumRenderer } from './sceneComponents/bacteria.js';

// Removed local GRID constant as it will now be passed to functions
let plotRendererInstance = null;
 
function setupScene(config) {
    const scene = createScene(config);
    const camera = createCamera(config);
    const renderer = createRenderer();
    createControls(camera, renderer, config);

    // Handle window resize to match viewport dimensions
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}



/**
 * Sets up a new scene with custom surface mesh for concentration visualization.
 * @param {Object} config - Configuration object
 * @returns {Object} An object containing the scene components
 */
export function setupNewScene(config) {
    console.log("Setting up new scene...");
    const sceneState = setupScene(config);

    // Append renderer to document if not already done
    document.body.appendChild(sceneState.renderer.domElement);
    
    // Initialize the bacterium visualization system
    sceneState.bacteriumRenderer = createBacteriumRenderer(sceneState.scene, config);

    // Setup the concentration visualization mesh
    setupMesh(sceneState, config);
    
    // Setup the plot renderer
    setupPlot(config);
    
    return sceneState;
}


function setupMesh(sceneState, config) {
    
    // Create and position the surface mesh
    sceneState.surfaceMesh = createMesh(sceneState.scene, THREE, config);
    sceneState.surfaceMesh.rotation.x = Math.PI;
    sceneState.scene.add(sceneState.surfaceMesh);
    
    console.log("Surface mesh created (wireframe) and added to scene with color attribute.");
}

function setupPlot(config) {
    plotRendererInstance = new PlotRenderer(config);
    plotRendererInstance.init(THREE);
    console.log("Plot renderer initialized.");
}

export function updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
    plotRendererInstance.updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory);
}

export function renderScene(sceneState,bacteriaData) {
    plotRendererInstance.render();
    if (sceneState.renderer && sceneState.scene && sceneState.camera) {
        sceneState.renderer.render(sceneState.scene, sceneState.camera);
    }
     // Render bacteria using the dedicated renderer
     if (sceneState.bacteriumRenderer && bacteriaData) {
        sceneState.bacteriumRenderer.renderBacteria(bacteriaData);
    }
}



/**
 * Creates and returns a new THREE.Scene object.
 * @param {Object} config - Configuration object
 * @returns {THREE.Scene} The created scene.
 */
function createScene(config) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(config.SCENE.FOG_COLOR, config.SCENE.FOG_NEAR, config.SCENE.FOG_FAR);
    return scene;
}

/**
 * Creates and returns a new THREE.PerspectiveCamera object.
 * @param {Object} config - Configuration object
 * @returns {THREE.PerspectiveCamera} The created camera.
 */
function createCamera(config) {
    const camera = new THREE.PerspectiveCamera(
        config.SCENE.CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        config.SCENE.CAMERA_NEAR,
        config.SCENE.CAMERA_FAR
    );
    camera.position.set(
        config.SCENE.CAMERA_POSITION.x,
        config.SCENE.CAMERA_POSITION.y,
        config.SCENE.CAMERA_POSITION.z
    );
    camera.lookAt(
        config.SCENE.CAMERA_LOOKAT.x,
        config.SCENE.CAMERA_LOOKAT.y,
        config.SCENE.CAMERA_LOOKAT.z
    );
    return camera;
}

export const updateScene = (sceneState,dataState,appConfig,animationState) => {

    updateSurfaceMesh(sceneState, dataState, appConfig.GRID);
    updateOverlay( 
        animationState,
        dataState
    );
}

/**
 * Creates and returns a new THREE.WebGLRenderer object.
 * @returns {THREE.WebGLRenderer} The created renderer.
 */
function createRenderer() {
    const renderer = new THREE.WebGLRenderer( {antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}

/**
 * Creates and returns a new OrbitControls object.
 * @param {THREE.Camera} camera - The camera to control.
 * @param {THREE.WebGLRenderer} renderer - The renderer to control.
 * @param {Object} config - Configuration object
 * @returns {OrbitControls} The created controls.
 */
function createControls(camera, renderer, config) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.screenSpacePanning = true;
    controls.maxDistance = config.SCENE.CONTROLS_MAX_DISTANCE;
    controls.minDistance = config.SCENE.CONTROLS_MIN_DISTANCE;
    controls.target.set(
        config.SCENE.CAMERA_LOOKAT.x,
        config.SCENE.CAMERA_LOOKAT.y,
        config.SCENE.CAMERA_LOOKAT.z
    );
    
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

/**
 * Updates the geometry (vertex heights) and color attributes of the surface mesh
 * based on the given concentration data.
 * 
 * @param {THREE.Mesh} surfaceMesh - The mesh representing the concentration surface
 * @param {Float32Array} concentrationData - Array of concentration values
 * @param {Object} grid - Grid dimensions object with WIDTH and HEIGHT properties
 * @param {number} heightMultiplier - Optional multiplier for height values (default: 5)
 */
export function updateSurfaceMesh(sceneState, dataState, grid, heightMultiplier = 10) {
    const histories = Object.values(sceneState.historyManager.getHistories());



    plotRendererInstance.updatePlot(...histories)

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

/**
 * Creates and returns a new BacteriumRenderer instance
 * @param {THREE.Scene} scene - The scene to add bacteria to
 * @param {Object} config - Configuration object containing BACTERIUM and PHENOTYPES values
 * @returns {BacteriumRenderer} The created bacterium renderer
 */
export function createBacteriumRenderer(scene, config) {
    // Pass THREE to BacteriumRenderer to implement dependency injection
    return new BacteriumRenderer(scene, config, THREE);
}

export { updateOverlay };

