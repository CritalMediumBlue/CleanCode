/**
 * Camera creation and configuration module
 */


/**
 * Creates and configures a Three.js camera
 * @param {Object} config - Configuration object containing camera settings
 * @param {Object} THREE - Three.js library
 * @returns {Object} - Configured Three.js camera
 */
export function createCamera(config, THREE) {
    const camera = new THREE.PerspectiveCamera(
        config.SCENE.CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        config.SCENE.CAMERA_NEAR,
        config.SCENE.CAMERA_FAR
    );
    camera.position.set(
        config.SCENE.CAMERA_POSITION.x,
        config.SCENE.CAMERA_POSITION.y,
        config.SCENE.CAMERA_POSITION.z
    );
    camera.lookAt(
        config.SCENE.CAMERA_LOOKAT.x,
        config.SCENE.CAMERA_LOOKAT.y,
        config.SCENE.CAMERA_LOOKAT.z
    );
    return camera;
}

/**
 * Creates and configures orbit controls for the camera
 * @param {Object} camera - Three.js camera
 * @param {HTMLElement} domElement - DOM element to attach controls to
 * @param {Object} config - Configuration object containing control settings
 * @param {Object} OrbitControls - Three.js OrbitControls
 * @returns {Object} - Configured orbit controls
 */
export function createControls(camera, domElement, config, OrbitControlsClass) {
    const controls = new OrbitControlsClass(camera, domElement);
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.screenSpacePanning = true;
    controls.maxDistance = config.SCENE.CONTROLS_MAX_DISTANCE;
    controls.minDistance = config.SCENE.CONTROLS_MIN_DISTANCE;
    controls.target.set(
        config.SCENE.CAMERA_LOOKAT.x,
        config.SCENE.CAMERA_LOOKAT.y,
        config.SCENE.CAMERA_LOOKAT.z
    );
    
    return controls;
}