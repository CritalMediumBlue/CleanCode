let scene2D = null;
let camera2D = null;
let renderer2D = null;
let totalPlotPoints = null;
let magentaPlotPoints = null;
let cyanPlotPoints = null;
let similarityPlotPoints = null;
let currentIndex = 0;
let offset = 0;

let PLOT = null

import { createPlot } from './plotMaterials.js';




/**
 * Initializes the plot visualization
 * @param {Object} THREE - Three.js library
 * @param {Object} userConfig - Configuration object
 * @returns {Object} - Functions for interacting with the plot
 */
export function setupPlot(THREE, config) {
    PLOT = config;
    const SIZE = PLOT.SIZE_RATIO;
    const plot = document.getElementById('plot-overlay');
    plot.innerHTML = '';
    
    scene2D = new THREE.Scene();
    camera2D = new THREE.OrthographicCamera(-2, 2, 1, -1, 0.1, 100);
    camera2D.position.z = 1;
    renderer2D = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer2D.setSize(window.innerWidth * SIZE, window.innerHeight * SIZE);
    renderer2D.domElement.style.position = 'absolute';
    document.getElementById('plot-overlay').appendChild(renderer2D.domElement);
   
    // Call createPlot with scene2D and assign the returned plot points
    const plotPoints = createPlot(THREE, PLOT, scene2D);
    totalPlotPoints = plotPoints.totalPlotPoints;
    magentaPlotPoints = plotPoints.magentaPlotPoints;
    cyanPlotPoints = plotPoints.cyanPlotPoints;
    similarityPlotPoints = plotPoints.similarityPlotPoints;
    
/*     return {
        updatePlot,
        render
    }; */
}





/**
 * Updates plot data with new history values
 * @param {Array} totalHistory - History of total bacteria counts
 * @param {Array} magentaHistory - History of magenta bacteria counts
 * @param {Array} cyanHistory - History of cyan bacteria counts
 * @param {Array} similarityHistory - History of similarity values
 */
export function updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
    
    updatePlotGeometry(totalPlotPoints.geometry, totalHistory);
    updatePlotGeometry(magentaPlotPoints.geometry, magentaHistory);
    updatePlotGeometry(cyanPlotPoints.geometry, cyanHistory);
    updatePlotGeometry(similarityPlotPoints.geometry, similarityHistory);
    
    currentIndex++;
    if (currentIndex > PLOT.MAX_POINTS) {
        offset++;
    }
}

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

/**
 * Renders the plot if needed
 */
export function renderPlot() {
   
    renderer2D.render(scene2D, camera2D);
    
}




