/**
 * Renderer creation and configuration module for Three.js
 * Responsible for setting up a WebGL renderer with appropriate sizing and performance options.
 */

/**
 * Creates and configures a Three.js WebGL renderer
 * @param {Object} THREE - Three.js library instance
 * @returns {THREE.WebGLRenderer} - Configured Three.js WebGL renderer
 */
export function createRenderer(THREE, ratio=1) {
    // Create renderer with specified antialiasing option (default: false)
    const renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    
    renderer.setSize(window.innerWidth*ratio, window.innerHeight*ratio);
    
    document.body.appendChild(renderer.domElement);

    return renderer;
}
