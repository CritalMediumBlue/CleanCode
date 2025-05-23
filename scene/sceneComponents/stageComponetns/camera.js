/**
 * Camera creation and configuration module for Three.js
 * Responsible for creating a perspective camera and attaching orbit controls to it.
 */

/**
 * Creates and configures a Three.js perspective camera with orbit controls
 * @param {Object} SCENE - Configuration object containing camera settings
 * @param {number} SCENE.CAMERA_FOV - Field of view in degrees
 * @param {number} SCENE.CAMERA_NEAR - Near clipping plane distance
 * @param {number} SCENE.CAMERA_FAR - Far clipping plane distance
 * @param {Object} SCENE.CAMERA_POSITION - Initial camera position
 * @param {number} SCENE.CAMERA_POSITION.x - X coordinate of camera position
 * @param {number} SCENE.CAMERA_POSITION.y - Y coordinate of camera position
 * @param {number} SCENE.CAMERA_POSITION.z - Z coordinate of camera position
 * @param {Object} SCENE.CAMERA_LOOKAT - Target point for camera to look at
 * @param {number} SCENE.CAMERA_LOOKAT.x - X coordinate of look-at point
 * @param {number} SCENE.CAMERA_LOOKAT.y - Y coordinate of look-at point
 * @param {number} SCENE.CAMERA_LOOKAT.z - Z coordinate of look-at point
 * @param {number} SCENE.CONTROLS_MAX_DISTANCE - Maximum distance for orbit controls
 * @param {number} SCENE.CONTROLS_MIN_DISTANCE - Minimum distance for orbit controls
 * @param {Object} THREE - Three.js library instance
 * @param {Function} OrbitControlsClass - Three.js OrbitControls class constructor
 * @param {HTMLElement} domElement - DOM element to bind controls to (typically the renderer's DOM element)
 * @returns {THREE.PerspectiveCamera} - Configured Three.js camera with orbit controls attached
 */
export function createCamera(SCENE, THREE, OrbitControlsClass, domElement) {
    // Create a perspective camera with configured parameters
    const camera = new THREE.PerspectiveCamera(
        SCENE.CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        SCENE.CAMERA_NEAR,
        SCENE.CAMERA_FAR
    );
    
    // Set initial camera position
    camera.position.set(
        SCENE.CAMERA_POSITION.x,
        SCENE.CAMERA_POSITION.y,
        SCENE.CAMERA_POSITION.z
    );
    
    // Set camera look-at target
    camera.lookAt(
        SCENE.CAMERA_LOOKAT.x,
        SCENE.CAMERA_LOOKAT.y,
        SCENE.CAMERA_LOOKAT.z
    );

    // Attach orbit controls to the camera
    camera.controls = createControls(camera, domElement, SCENE, OrbitControlsClass);

    return camera;
}

/**
 * Creates and configures orbit controls for a camera
 * @param {THREE.PerspectiveCamera} camera - The camera to attach controls to
 * @param {HTMLElement} domElement - DOM element to bind controls to
 * @param {Object} SCENE - Configuration object containing control settings
 * @param {number} SCENE.CONTROLS_MAX_DISTANCE - Maximum distance for orbit controls zoom
 * @param {number} SCENE.CONTROLS_MIN_DISTANCE - Minimum distance for orbit controls zoom
 * @param {Object} SCENE.CAMERA_LOOKAT - Target point for camera controls to orbit around
 * @param {number} SCENE.CAMERA_LOOKAT.x - X coordinate of orbit center
 * @param {number} SCENE.CAMERA_LOOKAT.y - Y coordinate of orbit center
 * @param {number} SCENE.CAMERA_LOOKAT.z - Z coordinate of orbit center
 * @param {Function} OrbitControlsClass - Three.js OrbitControls class constructor
 * @returns {Object} - The configured orbit controls object
 */
function createControls(camera, domElement, SCENE, OrbitControlsClass) {
    // Initialize orbit controls with the camera and DOM element
    const controls = new OrbitControlsClass(camera, domElement);
    
    // Configure control behavior
    controls.enableDamping = false;      // Disable inertial damping
    controls.autoRotate = false;         // Disable auto-rotation
    controls.screenSpacePanning = true;  // Enable screen-space panning mode
    
    // Set zoom distance limits
    controls.maxDistance = SCENE.CONTROLS_MAX_DISTANCE;
    controls.minDistance = SCENE.CONTROLS_MIN_DISTANCE;
    
    // Set the orbit center to match camera's initial look-at point
    controls.target.set(
        SCENE.CAMERA_LOOKAT.x,
        SCENE.CAMERA_LOOKAT.y,
        SCENE.CAMERA_LOOKAT.z
    );
    
    return controls;
}