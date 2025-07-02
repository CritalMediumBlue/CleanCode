import { createPlotOptions } from './plotOptions.js';

/**
 * Initializes the plot visualization
 * @param {Object} Chart - Chart.js library
 * @returns {Object} - Reference to the created chart
 */
export function setupPlot(Chart) {
    const Id = 'plot-overlay';
    const plotContainer = document.getElementById(Id);
    
    // Clear previous content
    plotContainer.innerHTML = '';
    
    // Create canvas element for Chart.js
    const canvas = document.createElement('canvas');
    canvas.width = plotContainer.clientWidth;
    canvas.height = plotContainer.clientHeight * 0.8;
    plotContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Get chart options from plotOptions.js
    const options = createPlotOptions({
        width: canvas.width,
        height: canvas.height
    });
    
    // Create initial empty dataset
    const chartData = {
        labels: [], // x-axis data points (empty initially)
        datasets: [{
            label: 'AimP [nM]',
            data: [], // y-axis data points (empty initially)
            borderColor: 'yellow',
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            borderWidth: 1,
            fill: false,
            tension: 0.1,
            pointRadius: 0, // Hide points for cleaner look
        }]
    };
    
    console.log("New chart created");
    
    // Create and return the chart instance
    return new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options
    });
}

export function updatePlot(data, chart) {
    if (!data) return;
    
    let scaledData = scaleData(data, 1);
    const end = scaledData[0].length;
    const start = Math.max(0, end - 500); // Limit to last 500 points
    
    const slicedData = sliceData(start, end, scaledData);
    
    // Update chart data
    chart.data.labels = slicedData[0]; // X-axis values
    
    // For Y values, we just need the array of values
    chart.data.datasets[0].data = slicedData[1];
    
    // Ensure update doesn't animate for performance
    chart.update();
}

/**
 * Slices a specific range of data points from arrays
 * @param {number} start - Start index to slice from
 * @param {number} end - End index to slice to
 * @param {Array} data - 2D array of data to slice
 * @returns {Array} - Sliced data
 */
function sliceData(start, end, data) {
  let d = [];

  for (let i = 0; i < data.length; i++)
      d.push(data[i].slice(start, end));

  return d;
}

/**
 * Scales data values by a scaling factor
 * @param {Array} data - 2D array of data to scale
 * @param {number} start - Index to start scaling from
 * @returns {Array} - Scaled data
 */
function scaleData(data, start) {
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