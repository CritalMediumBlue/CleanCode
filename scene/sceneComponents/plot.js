import uPlot from 'uplot';
import {createPlotOptions} from './options.js';

// Maintain a reference to the chart instance
let chart = null;

/**
 * Initializes the plot visualization
 * @param {Object} _ - Unused parameter (was THREE library)
 * @param {Object} config - Configuration options for the plot
 * @returns {Object} - Reference to the created plot
 */
export function setupPlot(_, config) {
    const plotContainer = document.getElementById('plot-overlay');
    
    // Clear previous content
    plotContainer.innerHTML = '';
    
    // Calculate fixed dimensions (using container size)
    const width = plotContainer.clientWidth;
    const height = plotContainer.clientHeight;
    
    const plotOptions = createPlotOptions({
        width,
        height,
        maxYValue: 1600
    });
    
    // Create the uPlot chart with initial empty data
    chart = new uPlot(plotOptions, [], plotContainer);
    
    return chart;
}

/**
 * Updates plot data with new history values
 * @param {Array} totalHistory - History of total bacteria counts
 * @param {Array} magentaHistory - History of magenta bacteria counts
 * @param {Array} cyanHistory - History of cyan bacteria counts
 * @param {Array} similarityHistory - History of similarity values
 */
export function updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
    if (!chart) return;
    
    const totalHistoryLength = totalHistory.length;
    const maxHistoryLength = Math.min(totalHistoryLength, 490);
    const difference = totalHistoryLength - maxHistoryLength;
    
    // Create data arrays directly without storing as properties
    const xData = Array.from({ length: maxHistoryLength }, (_, i) => i + difference);
    const totalData = totalHistory.slice(-maxHistoryLength);
    const magentaData = magentaHistory.slice(-maxHistoryLength);
    const cyanData = cyanHistory.slice(-maxHistoryLength);
    const similarityData = similarityHistory.slice(-maxHistoryLength);
    
    // Use setData to update the chart - uPlot doesn't have an addData method
    chart.setData([
        xData,
        totalData,
        magentaData,
        cyanData,
        similarityData
    ]);
}

/**
 * Cleans up plot resources
 */
export function disposePlot() {
    if (chart) {
        chart.destroy();
        chart = null;
    }
}


