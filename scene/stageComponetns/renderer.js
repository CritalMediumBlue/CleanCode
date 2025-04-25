/**
 * Renderer creation and configuration module
 */

/**
 * Creates and configures a Three.js WebGL renderer
 * @param {Object} THREE - Three.js library
 * @returns {Object} - Configured Three.js renderer
 */
export function createRenderer(THREE) {
    const renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}

/**
 * Updates renderer size on window resize
 * @param {Object} renderer - Three.js renderer
 */
export function handleWindowResize(renderer, camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}