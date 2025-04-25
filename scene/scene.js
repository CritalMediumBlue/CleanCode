
 
export function setupScene(config,THREE, OrbitControls) {
    const scene = createScene(config,THREE);
    const camera = createCamera(config,THREE);
    const renderer = createRenderer(THREE);
    createControls(camera, renderer, config, OrbitControls);

    // Handle window resize to match viewport dimensions
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}




function createScene(config,THREE) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(config.SCENE.FOG_COLOR, config.SCENE.FOG_NEAR, config.SCENE.FOG_FAR);
    return scene;
}

function createCamera(config,THREE) {
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


function createRenderer(THREE) {
    const renderer = new THREE.WebGLRenderer( {antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}


function createControls(camera, renderer, config, OrbitControls) {
    const controls = new OrbitControls(camera, renderer.domElement);
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
    
}
