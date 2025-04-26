/**
 * Renderer creation and configuration module for Three.js
 * Responsible for setting up a WebGL renderer with appropriate sizing and performance options.
 */

/**
 * Creates and configures a Three.js WebGL renderer
 * @param {Object} THREE - Three.js library instance
 * @param {Object} [options] - Optional rendering configuration options
 * @param {boolean} [options.antialias=false] - Whether to enable antialiasing
 * @returns {THREE.WebGLRenderer} - Configured Three.js WebGL renderer
 */
export function createRenderer(THREE, options = {}) {
    // Create renderer with specified antialiasing option (default: false)
    const renderer = new THREE.WebGLRenderer({
        antialias: options.antialias || false
    });
    
    // Configure renderer display properties
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Add renderer canvas to the DOM
    document.body.appendChild(renderer.domElement);

    return renderer;
}
