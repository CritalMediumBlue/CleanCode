/**
 * Scene creation and configuration module for Three.js
 * Responsible for creating and configuring a scene with fog effects.
 */

/**
 * Creates and configures a Three.js scene with fog settings
 * @param {Object} SCENE - Configuration object containing scene settings
 * @param {number} SCENE.FOG_COLOR - Fog color in hexadecimal format
 * @param {number} SCENE.FOG_NEAR - Near distance for fog effect (where fog begins)
 * @param {number} SCENE.FOG_FAR - Far distance for fog effect (where fog is at maximum density)
 * @param {Object} THREE - Three.js library instance
 * @returns {THREE.Scene} - Configured Three.js scene object with fog
 */
export function createScene(SCENE, THREE) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(SCENE.FOG_COLOR, SCENE.FOG_NEAR, SCENE.FOG_FAR);
    return scene;
}