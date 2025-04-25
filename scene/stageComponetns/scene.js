/**
 * Scene creation and configuration module
 */

/**
 * Creates and configures a Three.js scene
 * @param {Object} config - Configuration object containing scene settings
 * @param {Object} THREE - Three.js library
 * @returns {Object} - Configured Three.js scene
 */
export function createScene(SCENE, THREE) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
    return scene;
}