/**
 * Renderer creation and configuration module for Three.js
 */

/**
 * Creates and configures a Three.js WebGL renderer
 * @param {Object} THREE - Three.js library instance
 * @returns {THREE.WebGLRenderer} - Configured Three.js WebGL renderer with correct size and pixel ratio
 */
export function createRenderer(THREE) {
    const renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}
