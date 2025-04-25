/**
 * Scene creation and configuration module
 */

/**
 * Creates and configures a Three.js scene
 * @param {Object} config - Configuration object containing scene settings
 * @param {Object} THREE - Three.js library
 * @returns {Object} - Configured Three.js scene
 */
export function createScene(config, THREE) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(config.SCENE.FOG_COLOR, config.SCENE.FOG_NEAR, config.SCENE.FOG_FAR);
    return scene;
}