import { createPlotOptions } from './plotOptions.js';

/**
 * Initializes the plot visualization
 * @param {Object} _ - Unused parameter (was THREE library)
 * @param {Object} config - Configuration options for the plot
 * @returns {Object} - Reference to the created plot
 */
export function setupPlot(uPlot) {
    const plotContainer = document.getElementById('plot-overlay');
    
    // Clear previous content
    plotContainer.innerHTML = '';
    
    // Calculate fixed dimensions (using container size)
    const width = plotContainer.clientWidth;
    const height = plotContainer.clientHeight*0.9;
    
    const options = createPlotOptions({
        width,
        height
    });
    
    return new uPlot(options, [0,0,0,0,0], plotContainer);
}

/**
 * Updates plot data with new history values
 * @param {Array} totalHistory - History of total bacteria counts
 * @param {Array} magentaHistory - History of magenta bacteria counts
 * @param {Array} cyanHistory - History of cyan bacteria counts
 * @param {Array} similarityHistory - History of similarity values
 */
export function updatePlot(data, plot) {
  
    const end = data[0].length;
    const start = Math.max(2, end - 500);

    const slicedData = sliceData(start, end, data);
    
    plot.setData(slicedData);
}

function sliceData(start, end, data) {
  let d = [];

  for (let i = 0; i < data.length; i++)
      d.push(data[i].slice(start, end));

  return d;
}


