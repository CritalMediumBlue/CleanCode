/**
 * Stage setup module that coordinates scene, camera, and renderer creation for Three.js applications
 */

import { createScene } from './stageComponetns/scene.js';
import { createCamera } from './stageComponetns/camera.js';
import { createRenderer } from './stageComponetns/renderer.js';

/**
 * Sets up a complete Three.js stage with scene, camera, and renderer
 * @param {Object} SCENE - Configuration object containing scene settings (fog, camera parameters, controls settings, etc.)
 * @param {Object} THREE - Three.js library instance
 * @param {Function} OrbitControls - Three.js OrbitControls class constructor
 * @param {Object} stage - The stage object to update or clear (will be modified by reference)
 * @param {Object} [mesh] - Optional mesh to clear when resetting the stage
 * @returns {Object} - Updated stage object containing {scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}
 */
export function setupStage(SCENE, THREE, OrbitControls, stage, mesh) {
    if (stage && Object.keys(stage).length > 0) {
        clearStage(stage, mesh);
    }

    stage.scene = createScene(SCENE, THREE);
    stage.renderer = createRenderer(THREE);
    stage.camera = createCamera(SCENE, THREE, OrbitControls, stage.renderer.domElement);

    document.body.appendChild(stage.renderer.domElement);

    return stage;
}

/**
 * Cleans up and disposes of resources from the existing stage
 * @param {Object} stage - The stage object containing scene, camera, and renderer to be cleared
 * @param {Object} [mesh] - Optional mesh to clear from the scene and dispose its resources
 * @returns {void}
 */
function clearStage(stage, mesh) {
    if (mesh) {
        stage.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose(); // Ensure material is disposed too
        mesh = null; // Nullify the reference
    }

    if (stage.renderer && stage.renderer.domElement && stage.renderer.domElement.parentNode) {
        stage.renderer.domElement.parentNode.removeChild(stage.renderer.domElement);
        stage.renderer.dispose();
    }

    // Clear the stage properties but don't set stage itself to null
    stage.camera = null;
    stage.scene = null;
    stage.renderer = null;
}