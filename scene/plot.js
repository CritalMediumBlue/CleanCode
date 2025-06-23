import { createPlotOptions } from './plotOptions.js';

/**
 * Initializes the plot visualization
 * @param {Object} _ - Unused parameter (was THREE library)
 * @param {Object} config - Configuration options for the plot
 * @returns {Object} - Reference to the created plot
 */
export function setupPlot(uPlot) {
    let Id = null;
    let initData = null;
      Id = 'plot-overlay';
      initData = [[0], [1], [2], [3], [4]]; // Initialize with empty arrays for each series
    
        
    const plotContainer = document.getElementById(Id);
    
    // Clear previous content
    plotContainer.innerHTML = '';
    
    // Calculate fixed dimensions (using container size)
    const width = plotContainer.clientWidth;
    const height = plotContainer.clientHeight*0.8;
    
    const options = createPlotOptions({
        width,
        height
    });
    console.log("New plot created");
    
    return new uPlot(options,initData, plotContainer);
}


export function updatePlot(data, plot) {
  
    let scaledData = scaleData(data,1);
    const end = scaledData[0].length;
    const start = Math.max(0, end - 500);

    const slicedData = sliceData(start, end, scaledData);
    
    plot.setData(slicedData);
    
}

function sliceData(start, end, data) {
  let d = [];

  for (let i = 0; i < data.length; i++)
      d.push(data[i].slice(start, end));

  return d;
}

function scaleData(data, start) {
  //const scaleFactor = 100+start*1000;
  const scaleFactor = 1;

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