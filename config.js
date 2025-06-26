export const CONFIG = {
    SCENE: {
        FOG_COLOR: 0x0f0000,
        FOG_NEAR: 5,
        FOG_FAR: 120,
        CAMERA_FOV: 75,
        CAMERA_NEAR: 5,
        CAMERA_FAR: 1000,
        CAMERA_POSITION: { x: 0, y: 0, z: 70 },
        CAMERA_LOOKAT: { x: 0, y: 0, z: 0 },
        CONTROLS_MAX_DISTANCE: 100,
        CONTROLS_MIN_DISTANCE: 20
    },
    BACTERIUM: {
        CAP_SEGMENTS: 2,
        RADIAL_SEGMENTS: 5,
        INITIAL_POOL_SIZE: 2000,
        POOL_GROWTH_FACTOR: 1.1,
        WIREFRAME_SCALE: 1.03,
        COLOR_BY_INHERITANCE: true,
        SIGNAL: {
            DEFAULT: 0,
            MIN: 0,
            MAX: 0.005
        }
    },
    COLORS: {
        MIN_COLOR: 0x0000FF,
        MAX_COLOR: 0xFF0000,
        MAGENTA: 0xFF00FF,
        CYAN: 0x00FFFF,
        DEFAULT_PHENOTYPE: 0xFFFFFF
    },
    PLOT: {
        MAX_POINTS: 1000,
        AXIS_COLOR: 0x808080,
        SIZE_RATIO: 1 / 4,
        MAX_Y_VALUE: 1600,
        Y_TICK_STEP: 200,
        UPDATE_PLOT_INTERVAL: 10
    },
    PHENOTYPES: {
        MAGENTA: 'MAGENTA',
        CYAN: 'CYAN'
    },
    GRID: {
        WIDTH: 100,
        HEIGHT: 60,
        DIFFUSION_RATE: 100
    }
};