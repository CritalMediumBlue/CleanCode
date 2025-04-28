import uPlot from 'uplot';
import {createPlotOptions} from './options.js';


/**
 * Initializes the plot visualization
 * @param {Object} _ - Unused parameter (was THREE library)
 * @param {Object} config - Configuration options for the plot
 * @returns {Object} - Reference to the created plot
 */
export function setupPlot() {
    const plotContainer = document.getElementById('plot-overlay');
    
    // Clear previous content
    plotContainer.innerHTML = '';
    
    // Calculate fixed dimensions (using container size)
    const width = plotContainer.clientWidth;
    const height = plotContainer.clientHeight*0.7;
    
    const plotOptions = createPlotOptions({
        width,
        height,
        maxYValue: 1600
    });
    
    return new uPlot(plotOptions, [], plotContainer);
}

/**
 * Updates plot data with new history values
 * @param {Array} totalHistory - History of total bacteria counts
 * @param {Array} magentaHistory - History of magenta bacteria counts
 * @param {Array} cyanHistory - History of cyan bacteria counts
 * @param {Array} similarityHistory - History of similarity values
 */
export function updatePlot(data, plot) {
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('Invalid data provided to updatePlot');
        return;
    }
    
    // Ensure plot is defined
    if (!plot) {
        console.warn('Plot reference is undefined in updatePlot');
        return;
    }
    
    // Create a new array with time series as the first element
    let processedData = [];
    
    // First determine the length of the data arrays
    let dataLength = 0;
    
    // Find the first valid data array and get its length
    for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i]) && data[i].length > 0) {
            dataLength = data[i].length;
            break;
        }
    }
    
    if (dataLength === 0) {
        console.warn('No valid data arrays found');
        return;
    }
    
    // Generate time series (0, 1, 2, ...) for x-axis
    const timeSeriesData = Array.from({ length: dataLength }, (_, index) => index);
    processedData.push(timeSeriesData);
    
    // Add the rest of the data arrays
    for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i])) {
            processedData.push(data[i]);
        }
    }
    
    const totalHistoryLength = processedData[0].length;
    const start = Math.max(0, totalHistoryLength - 500);

    const slicedData = sliceData(start, totalHistoryLength, processedData);
    
    // Use setData to update the chart
    plot.setData(slicedData);
}

function sliceData(start, end, data) {
  let d = [];

  for (let i = 0; i < data.length; i++)
      d.push(data[i].slice(start, end));

  return d;
}