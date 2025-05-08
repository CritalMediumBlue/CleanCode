import { createPlotOptions } from './plotOptions.js';

/**
 * Initializes the plot visualization
 * @param {Object} _ - Unused parameter (was THREE library)
 * @param {Object} config - Configuration options for the plot
 * @returns {Object} - Reference to the created plot
 */
export function setupPlot(uPlot,type) {
    let Id = null;
    let initData = null;
    if (type === 'timeSeries') {
        Id = 'plot-overlay';
        initData = [0,0,0,0];
    } else if (type === 'phaseSpace') {
        Id = 'plot-overlay2';
        initData = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // x values
            [2, 8, 6, 4, 1, 3, 9, 5, 7, 10]  // y values
          ];
    }
        
    const plotContainer = document.getElementById(Id);
    
    // Clear previous content
    plotContainer.innerHTML = '';
    
    // Calculate fixed dimensions (using container size)
    const width = plotContainer.clientWidth;
    const height = plotContainer.clientHeight*0.9;
    
    const options = createPlotOptions({
        width,
        height,
        type
    });
    
    return new uPlot(options,initData, plotContainer);
}

/**
 * Updates plot data with new history values
 * @param {Array} totalHistory - History of total bacteria counts
 * @param {Array} magentaHistory - History of magenta bacteria counts
 * @param {Array} cyanHistory - History of cyan bacteria counts
 * @param {Array} similarityHistory - History of similarity values
 */
export function updatePlot(data, plot, type) {
  if(type === 'phaseSpace') {
    plot.setData(data);
  }
    else if(type === 'timeSeries') {
    const end = data[0].length;
    const start = Math.max(0, end - 500);

    const slicedData = sliceData(start, end, data);
    
    plot.setData(slicedData);
    }
}

function sliceData(start, end, data) {
  let d = [];

  for (let i = 0; i < data.length; i++)
      d.push(data[i].slice(start, end));

  return d;
}


