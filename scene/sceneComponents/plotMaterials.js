let yTicks = null;
// Private geometries and materials
let totalGeometry, magentaGeometry, cyanGeometry, similarityGeometry;
let totalMaterial, magentaMaterial, cyanMaterial, similarityMaterial;

/**
 * Create all plot components
 * @param {Object} THREE - Three.js library
 * @param {Object} PLOT - Plot configuration
 * @param {Object} scene - 2D scene to add elements to
 * @returns {Object} - Plot points objects
 */
export function createPlot(THREE, PLOT, scene2D) {
    createPlotGeometries(THREE, PLOT);
    createPlotMaterials(THREE);
    const plotPoints = createPlotPoints(THREE, scene2D);
    createTicks(THREE, PLOT, scene2D);
    return plotPoints;
}

/**
 * Create geometries for plot lines
 * @param {Object} THREE - Three.js library
 */
function createPlotGeometries(THREE,PLOT) {
    const positions = new Float32Array(PLOT.MAX_POINTS * 3);
    const createGeometry = () => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
        return geometry;
    };
    
    totalGeometry = createGeometry();
    magentaGeometry = createGeometry();
    cyanGeometry = createGeometry();
    similarityGeometry = createGeometry();
}

/**
 * Create materials for plot lines
 * @param {Object} THREE - Three.js library
 */
 function createPlotMaterials(THREE) {
    totalMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    magentaMaterial = new THREE.PointsMaterial({ color: 0xff00ff, size: 2 });
    cyanMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: 2 });
    similarityMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 2 });
}

/**
 * Create point objects for plot visualization
 * @param {Object} THREE - Three.js library
 * @param {Object} scene - 2D scene to add elements to
 * @returns {Object} - Plot points objects
 */
function createPlotPoints(THREE, scene2D) {
    const totalPlotPoints = new THREE.Points(totalGeometry, totalMaterial);
    const magentaPlotPoints = new THREE.Points(magentaGeometry, magentaMaterial);
    const cyanPlotPoints = new THREE.Points(cyanGeometry, cyanMaterial);
    const similarityPlotPoints = new THREE.Points(similarityGeometry, similarityMaterial);

    scene2D.add(totalPlotPoints, magentaPlotPoints, cyanPlotPoints, similarityPlotPoints);
    
    return {
        totalPlotPoints,
        magentaPlotPoints,
        cyanPlotPoints,
        similarityPlotPoints
    };
}

/**
 * Create tick marks for the plot axes
 * @param {Object} THREE - Three.js library
 * @param {Object} PLOT - Plot configuration
 * @param {Object} scene - 2D scene to add elements to
 */
function createTicks(THREE,PLOT, scene2D) {
    const tickMaterial = new THREE.LineBasicMaterial({ color: PLOT.AXIS_COLOR });
    yTicks = new THREE.Group();
    const points = [];
    for (let i = 0; i <= PLOT.MAX_Y_VALUE; i += PLOT.Y_TICK_STEP) {
        const y = (i / PLOT.MAX_Y_VALUE) * 2 - 0.999;
        points.push(new THREE.Vector3(-2, y, 0), new THREE.Vector3(2, y, 0));
    }
    const tickGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const ticks = new THREE.LineSegments(tickGeometry, tickMaterial);
    yTicks.add(ticks);
    scene2D.add(yTicks);
}
