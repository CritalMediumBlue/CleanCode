/**
 * Renderer creation and configuration module for Three.js
 * Responsible for setting up a WebGL renderer with appropriate sizing and performance options.
 */

/**
 * Creates and configures a Three.js WebGL renderer
 * @param {Object} THREE - Three.js library instance
 * @returns {THREE.WebGLRenderer} - Configured Three.js WebGL renderer
 */
export function createRenderer(THREE, ratio=0.5) {
    // Create renderer with specified antialiasing option (default: false)
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        preserveDrawingBuffer: true, 
    });
    
    renderer.setSize(window.innerWidth*ratio, window.innerHeight*ratio, false);

    // Stretch the output to fill the screen
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.display = 'block'; // optional, but removes unwanted space
    
    document.body.appendChild(renderer.domElement);

    return renderer;
}
