/**
 * Stage setup module that coordinates scene, camera, and renderer creation
 */

import { createScene } from './stageComponetns/scene.js';
import { createCamera, createControls } from './stageComponetns/camera.js';
import { createRenderer } from './stageComponetns/renderer.js';

/**
 * Sets up a complete Three.js stage with scene, camera, and renderer
 * @param {Object} config - Configuration object containing stage settings
 * @param {Object} THREE - Three.js library
 * @param {Object} OrbitControls - Three.js OrbitControls class
 * @returns {Object} - Object containing scene, camera, and renderer
 */
export function setupStage(config, THREE, OrbitControls) {
    const scene = createScene(config, THREE);
    const camera = createCamera(config, THREE);
    const renderer = createRenderer(THREE);
    const controls = createControls(camera, renderer.domElement, config, OrbitControls);

    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer, controls };
}