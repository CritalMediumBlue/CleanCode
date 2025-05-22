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
        initData = [[0], [1], [2], [3], [4]]; // Initialize with empty arrays for each series
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
    const height = plotContainer.clientHeight*0.8;
    
    const options = createPlotOptions({
        width,
        height,
        type
    });
    
    return new uPlot(options,initData, plotContainer);
}


export function updatePlot(data, plot, type) {
  
  if(type === 'phaseSpace') {
    data = scaleData(data,0);
    const AverageX = data[0].reduce((a, b) => a + b, 0) / data[0].length;
    const AverageY = data[1].reduce((a, b) => a + b, 0) / data[1].length;
    data[0].push(AverageX);
    data[1].push(AverageY);
    plot.setData(data);
  }
    else if(type === 'timeSeries') {
    let scaledData = scaleData(data,1);
    const end = scaledData[0].length;
    const start = Math.max(0, end - 500);

    const slicedData = sliceData(start, end, scaledData);
    
    plot.setData(slicedData);
    }
}

function sliceData(start, end, data) {
  let d = [];

  for (let i = 0; i < data.length; i++)
      d.push(data[i].slice(start, end));

  return d;
}

function scaleData(data, start) {
  const scaleFactor = 100+start*1000;

  // Create a deep copy of the data array
  const scaledData = [];
  for (let i = 0; i < data.length; i++) {
    scaledData[i] = [...data[i]]; // Create a copy of each sub-array
  }
  
  // Apply scaling to the copy
  for (let i = start; i < scaledData.length; i++) {
    for (let j = 0; j < scaledData[i].length; j++) {
      scaledData[i][j] = scaledData[i][j] * scaleFactor;
    }
  }
  
  return scaledData;
}