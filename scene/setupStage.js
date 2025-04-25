/**
 * Stage setup module that coordinates scene, camera, and renderer creation
 */

import { createScene } from './stageComponetns/scene.js';
import { createCamera } from './stageComponetns/camera.js';
import { createRenderer } from './stageComponetns/renderer.js';

/**
 * Sets up a complete Three.js stage with scene, camera, and renderer
 * @param {Object} SCENE - Configuration object containing scene settings (fog, camera parameters, etc.)
 * @param {Object} THREE - Three.js library instance
 * @param {Function} OrbitControls - Three.js OrbitControls class constructor
 * @param {Object} stage - The stage object to update or clear
 * @param {Object} mesh - Optional mesh to clear when resetting the stage
 * @returns {Object} - Object containing {stage: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}
 */
export function setupStage(SCENE, THREE, OrbitControls, stage, mesh) {
    if (stage && Object.keys(stage).length > 0) {
        clearStage(stage, mesh);
    }

    stage.scene = createScene(SCENE, THREE);
    stage.renderer = createRenderer(THREE);
    stage.camera = createCamera(SCENE, THREE, OrbitControls, stage.renderer.domElement);

    document.body.appendChild(stage.renderer.domElement);

    return stage ;
}


function clearStage(stage, mesh) {
    if (mesh) {
        stage.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose(); // Ensure material is disposed too
        mesh = null; // Nullify the reference
        console.log("Surface mesh removed and disposed.");
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