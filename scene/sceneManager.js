import {THREE, OrbitControls} from './threeImports.js';
import { createMesh } from './sceneComponents/mesh.js';
import { PlotRenderer } from './sceneComponents/plotRenderer.js';
import { updateOverlay } from './overlay.js';

// Added grid constants that were previously in main.js
const GRID = { WIDTH: 100, HEIGHT: 60 };

/**
 * Sets up the scene, camera, renderer, and controls.
 * @returns {Object} An object containing the scene, camera, renderer, and controls.
 */
export function setupScene(CONFIG) {
    const scene = createScene(CONFIG);
    const camera = createCamera(CONFIG);
    const renderer = createRenderer();
    createControls(camera, renderer,CONFIG);
    const surfaceMesh = createMesh(scene, THREE);

    // Handle window resize to match viewport dimensions
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, surfaceMesh };
}

/**
 * Sets up a new scene with custom surface mesh for concentration visualization.
 * @param {Function} createBacteriumSystem - Function to create bacterium system
 * @returns {Object} An object containing the scene, camera, renderer, and bacteriumSystem
 */
export function setupNewScene(createBacteriumSystem, CONFIG) {
    console.log("Setting up new scene...");
    const setup = setupScene(CONFIG);
    const sceneState = setup; // Create local sceneState to be returned

    // Append renderer to document if not already done
    document.body.appendChild(sceneState.renderer.domElement);
    
    // Initialize the bacterium visualization system
    sceneState.bacteriumSystem = createBacteriumSystem(sceneState.scene);

    // Create the surface mesh geometry specifically for concentration visualization
    const geometry = new THREE.PlaneGeometry(GRID.WIDTH, GRID.HEIGHT, GRID.WIDTH - 1, GRID.HEIGHT - 1);
 
    // Initialize the color attribute buffer before creating the mesh
    // The size is num_vertices * 3 (r, g, b per vertex)
    const numVertices = geometry.attributes.position.count;
    const initialColors = new Float32Array(numVertices * 3); // Initialize with zeros
    geometry.setAttribute('color', new THREE.BufferAttribute(initialColors, 3)); // Add color attribute

    // Create material with wireframe enabled
    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        wireframe: true // Render as wireframe
    });
    
    // Create and position the surface mesh
    sceneState.surfaceMesh = new THREE.Mesh(geometry, material);
    sceneState.surfaceMesh.rotation.x = Math.PI;
    sceneState.scene.add(sceneState.surfaceMesh);
    
    console.log("Surface mesh created (wireframe) and added to scene with color attribute.");
    
    return sceneState;
}

let plotRendererInstance = null;

export function initPlotRenderer() {
    plotRendererInstance = new PlotRenderer();
    plotRendererInstance.init(THREE);
}

export function updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
    plotRendererInstance.updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory);
}

export function renderPlot() {
    plotRendererInstance.render();
}

/**
 * Creates and returns a new THREE.Scene object.
 * @returns {THREE.Scene} The created scene.
 */
function createScene(CONFIG) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(CONFIG.SCENE.FOG_COLOR, CONFIG.SCENE.FOG_NEAR, CONFIG.SCENE.FOG_FAR);
    return scene;
}

/**
 * Creates and returns a new THREE.PerspectiveCamera object.
 * @returns {THREE.PerspectiveCamera} The created camera.
 */
function createCamera(CONFIG) {
    const camera = new THREE.PerspectiveCamera(
        CONFIG.SCENE.CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        CONFIG.SCENE.CAMERA_NEAR,
        CONFIG.SCENE.CAMERA_FAR
    );
    camera.position.set(
        CONFIG.SCENE.CAMERA_POSITION.x,
        CONFIG.SCENE.CAMERA_POSITION.y,
        CONFIG.SCENE.CAMERA_POSITION.z
    );
    camera.lookAt(
        CONFIG.SCENE.CAMERA_LOOKAT.x,
        CONFIG.SCENE.CAMERA_LOOKAT.y,
        CONFIG.SCENE.CAMERA_LOOKAT.z
    );
    return camera;
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
 * @returns {OrbitControls} The created controls.
 */
function createControls(camera, renderer,CONFIG) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.screenSpacePanning = true;
    controls.maxDistance = CONFIG.SCENE.CONTROLS_MAX_DISTANCE;
    controls.minDistance = CONFIG.SCENE.CONTROLS_MIN_DISTANCE;
    controls.target.set(
        CONFIG.SCENE.CAMERA_LOOKAT.x,
        CONFIG.SCENE.CAMERA_LOOKAT.y,
        CONFIG.SCENE.CAMERA_LOOKAT.z
    );
    
}

/**
 * Updates the geometry (vertex heights) and color attributes of the surface mesh
 * based on the given concentration data.
 * 
 * @param {THREE.Mesh} surfaceMesh - The mesh representing the concentration surface
 * @param {Float32Array} concentrationData - Array of concentration values
 * @param {Function} calculateColor - Function to calculate color based on concentration
 * @param {number} heightMultiplier - Optional multiplier for height values (default: 5)
 */
export function updateSurfaceMesh(surfaceMesh, concentrationData, calculateColor, heightMultiplier = 5) {
    if (!surfaceMesh) {
        console.warn("updateSurfaceMesh called before surfaceMesh is initialized.");
        return;
    }
    
    // Get direct access to the position and color buffer arrays
    const positions = surfaceMesh.geometry.attributes.position.array; // x, y, z for each vertex
    const colorsAttribute = surfaceMesh.geometry.attributes.color; // r, g, b for each vertex

    // Iterate through each point in the grid
    for (let y = 0; y < GRID.HEIGHT; y++) {
        for (let x = 0; x < GRID.WIDTH; x++) {
            const idx = y * GRID.WIDTH + x; // Calculate 1D index
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

export { updateOverlay };

