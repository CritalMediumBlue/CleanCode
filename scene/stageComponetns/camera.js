/**
 * Camera creation and configuration module
 */


/**
 * Creates and configures a Three.js camera
 * @param {Object} config - Configuration object containing camera settings
 * @param {Object} THREE - Three.js library
 * @returns {Object} - Configured Three.js camera
 */
export function createCamera(SCENE, THREE, OrbitControlsClass, domElement) {
    const camera = new THREE.PerspectiveCamera(
        SCENE.CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        SCENE.CAMERA_NEAR,
        SCENE.CAMERA_FAR
    );
    camera.position.set(
        SCENE.CAMERA_POSITION.x,
        SCENE.CAMERA_POSITION.y,
        SCENE.CAMERA_POSITION.z
    );
    camera.lookAt(
        SCENE.CAMERA_LOOKAT.x,
        SCENE.CAMERA_LOOKAT.y,
        SCENE.CAMERA_LOOKAT.z
    );

    createControls(camera, domElement, SCENE, OrbitControlsClass);

    return camera;
}

function createControls(camera, domElement, SCENE, OrbitControlsClass) {
    if (!(domElement instanceof HTMLElement)) {
        console.error("Invalid domElement passed to OrbitControls. Ensure it is a valid DOM element.");
        return;
    }

    const controls = new OrbitControlsClass(camera, domElement);
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.screenSpacePanning = true;
    controls.maxDistance = SCENE.CONTROLS_MAX_DISTANCE;
    controls.minDistance = SCENE.CONTROLS_MIN_DISTANCE;
    controls.target.set(
        SCENE.CAMERA_LOOKAT.x,
        SCENE.CAMERA_LOOKAT.y,
        SCENE.CAMERA_LOOKAT.z
    );
}