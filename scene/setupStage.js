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
 * @returns {Object} - Object containing {scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}
 */
export function setupStage(SCENE, THREE, OrbitControls) {
    const scene = createScene(SCENE, THREE);
    const renderer = createRenderer(THREE);
    const camera = createCamera(SCENE, THREE, OrbitControls, renderer.domElement);

    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}