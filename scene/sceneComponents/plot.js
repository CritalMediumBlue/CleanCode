let scene2D = null;
let camera2D = null;
let renderer2D = null;
let totalPlotPoints = null;
let magentaPlotPoints = null;
let cyanPlotPoints = null;
let similarityPlotPoints = null;
let yTicks = null;
let needsRender = false;
let currentIndex = 0;
let offset = 0;

let PLOT = null


// Private geometries and materials
let totalGeometry, magentaGeometry, cyanGeometry, similarityGeometry;
let totalMaterial, magentaMaterial, cyanMaterial, similarityMaterial;

/**
 * Initializes the plot visualization
 * @param {Object} THREE - Three.js library
 * @param {Object} userConfig - Configuration object
 * @returns {Object} - Functions for interacting with the plot
 */
export function setupPlot(THREE, config) {
    PLOT = config;
    const plot = document.getElementById('plot-overlay');
    plot.innerHTML = '';
    
    scene2D = new THREE.Scene();
    camera2D = new THREE.OrthographicCamera(-2, 2, 1, -1, 0.1, 100);
    camera2D.position.z = 1;
    renderer2D = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer2D.setSize(
        window.innerWidth * PLOT.PLOT_WIDTH_RATIO, 
        window.innerHeight * PLOT.PLOT_HEIGHT_RATIO
    );
    renderer2D.domElement.style.position = 'absolute';
    document.getElementById('plot-overlay').appendChild(renderer2D.domElement);
   
    createPlot(THREE);
    
    return {
        updatePlot,
        render
    };
}

/**
 * Create all plot components
 * @param {Object} THREE - Three.js library
 */
function createPlot(THREE) {
    createPlotGeometries(THREE);
    createPlotMaterials(THREE);
    createPlotPoints(THREE);
    createTicks(THREE);
}

/**
 * Create geometries for plot lines
 * @param {Object} THREE - Three.js library
 */
function createPlotGeometries(THREE) {
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
 */
function createPlotPoints(THREE) {
    totalPlotPoints = new THREE.Points(totalGeometry, totalMaterial);
    magentaPlotPoints = new THREE.Points(magentaGeometry, magentaMaterial);
    cyanPlotPoints = new THREE.Points(cyanGeometry, cyanMaterial);
    similarityPlotPoints = new THREE.Points(similarityGeometry, similarityMaterial);

    scene2D.add(totalPlotPoints, magentaPlotPoints, cyanPlotPoints, similarityPlotPoints);
}

/**
 * Create tick marks for the plot axes
 * @param {Object} THREE - Three.js library
 */
function createTicks(THREE) {
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

/**
 * Updates plot data with new history values
 * @param {Array} totalHistory - History of total bacteria counts
 * @param {Array} magentaHistory - History of magenta bacteria counts
 * @param {Array} cyanHistory - History of cyan bacteria counts
 * @param {Array} similarityHistory - History of similarity values
 */
function updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
   
    
    const updatePlotGeometry = (geometry, history) => {
        const positions = geometry.attributes.position.array;
        const xStep = 4 / PLOT.MAX_POINTS;
        
        for (let i = 0; i < PLOT.MAX_POINTS; i++) {
            const historyIndex = offset + i;
            const x = -2 + i * xStep;
            const y = historyIndex < history.length ? 
                (history[historyIndex] / PLOT.MAX_Y_VALUE) * 2 - 0.999 : -1;
            const index = i * 3;
            positions[index] = x;
            positions[index + 1] = y;
            positions[index + 2] = 0;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.setDrawRange(0, Math.min(currentIndex, PLOT.MAX_POINTS));
    };
    
    updatePlotGeometry(totalPlotPoints.geometry, totalHistory);
    updatePlotGeometry(magentaPlotPoints.geometry, magentaHistory);
    updatePlotGeometry(cyanPlotPoints.geometry, cyanHistory);
    updatePlotGeometry(similarityPlotPoints.geometry, similarityHistory);
    
    currentIndex++;
    if (currentIndex > PLOT.MAX_POINTS) {
        offset++;
    }
    needsRender = true;
}

/**
 * Renders the plot if needed
 */
function render() {
   
    
    if (needsRender) {
        renderer2D.render(scene2D, camera2D);
        needsRender = false;
    }
}




