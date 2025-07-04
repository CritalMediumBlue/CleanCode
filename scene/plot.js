import { createPlotOptions } from './plotOptions.js';

/**
 * Initializes the plot visualization
 * @param {Object} Chart - Chart.js library
 * @returns {Object} - Reference to the created chart
 */
export function setupPlot(Chart, previusVars) {
  const nameOfSpecies = Object.keys(previusVars.int);

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
    const options = createPlotOptions();
    
    // Create initial empty dataset with mean lines and SD bounds
    const chartData = {
        labels: [], // x-axis data points (empty initially)
        datasets: [
        {
            label: nameOfSpecies[0] + ' [nM]', // Use the first species name for the label
            data: [], // y-axis data points (empty initially)
            borderColor: 'magenta',
            backgroundColor: 'rgba(255, 0, 255, 1)',
            borderWidth: 2.5,
            fill: false,
            tension: 0.1,
            pointRadius: 0, // Hide points for cleaner look
            order: 0, // Draw mean lines on top of everything
            zIndex: 10 // Make sure lines appear on top
        },{
            label: nameOfSpecies[1] + ' [nM]', // Use the second species name for the label
            data: [], // y-axis data points (empty initially)
            borderColor: 'cyan',
            backgroundColor: 'rgba(0, 255, 255, 1)',
            borderWidth: 2.5,
            fill: false,
            tension: 0.1,
            pointRadius: 0, // Hide points for cleaner look
            order: 0, // Draw mean lines on top of everything
            zIndex: 10 // Make sure lines appear on top
        }]
    };
    
    
    // Create and return the chart instance
    return new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options
    });
}

export function updatePlot(data, chart) {
    if (!data) return;
    

    // Check the structure of the data to handle both old and new formats
    let means, stdDevs;
    
    if (Array.isArray(data)) {
        // Old format: data is an array
        means = data[0];
        stdDevs = data[1];
    } else if (data.mean && data.standardDeviation) {
        // New format: data is an object with mean and standardDeviation properties
        means = data.mean;
        stdDevs = data.standardDeviation;
    } else {
        console.error("Unknown data format:", data);
        return; // Exit if the data format is unrecognized
    }
    
    // Safety check for means
    if (!means || !Array.isArray(means)) {
        console.error("Invalid means data:", means);
        return;
    }
    
   
    
    // Safety check for scaled data
    if (!means || !means.length || !means[0]) {
        console.error("Invalid scaled means:", means);
        return;
    }

    const endMean = means[0].length;
    const startMean = Math.max(0, endMean - 500); // Limit to last 500 points
    
    const slicedDataMean = sliceData(startMean, endMean, means);
    
    // Update chart data
    chart.data.labels = slicedDataMean[0]; // X-axis values
    
    // For Y values, set the mean values
    if (slicedDataMean[1]) chart.data.datasets[0].data = slicedDataMean[1];
    if (slicedDataMean[2]) chart.data.datasets[1].data = slicedDataMean[2];
    
    // Only create standard deviation bounds if stdDevs is available
    if (stdDevs && Array.isArray(stdDevs)) {
        // Create upper and lower bound datasets
        const upperBound1 = [];
        const lowerBound1 = [];
        const upperBound2 = [];
        const lowerBound2 = [];
        
        const slicedSD = sliceData(startMean, endMean, stdDevs);
        
        // Calculate upper and lower bounds for first species
        if (slicedDataMean[1] && slicedSD[1]) {
            for (let i = 0; i < slicedDataMean[1].length; i++) {
                upperBound1.push(slicedDataMean[1][i] + slicedSD[1][i]);
                lowerBound1.push(Math.max(0, slicedDataMean[1][i] - slicedSD[1][i])); // Prevent negative values
            }
        }
        
        // Calculate upper and lower bounds for second species
        if (slicedDataMean[2] && slicedSD[2]) {
            for (let i = 0; i < slicedDataMean[2].length; i++) {
                upperBound2.push(slicedDataMean[2][i] + slicedSD[2][i]);
                lowerBound2.push(Math.max(0, slicedDataMean[2][i] - slicedSD[2][i])); // Prevent negative values
            }
        }
        
        // Create filled area datasets between the bounds (with dashed lines)
        // Each call uses 4 dataset slots: 2 for filled area, 2 for dashed lines
        createFilledAreaDataset(chart, 2, `${chart.data.datasets[0].label} (±SD)`, 'rgba(255, 0, 255, 0.35)', upperBound1, lowerBound1);
        createFilledAreaDataset(chart, 6, `${chart.data.datasets[1].label} (±SD)`, 'rgba(0, 255, 255, 0.35)', upperBound2, lowerBound2);
    
      }
    
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
  // Safety checks
  if (!data || !Array.isArray(data)) {
    console.error("sliceData received invalid data:", data);
    return [[]]; // Return empty 2D array as fallback
  }
  
  let d = [];

  for (let i = 0; i < data.length; i++) {
    if (Array.isArray(data[i])) {
      d.push(data[i].slice(start, end));
    } else {
      console.warn(`sliceData: data[${i}] is not an array, pushing empty array`);
      d.push([]); // Push an empty array as fallback
    }
  }

  return d;
}



/**
 * Creates a filled area dataset between upper and lower bounds with dashed lines at bounds
 * @param {Object} chart - Chart.js instance
 * @param {number} index - Index for the dataset
 * @param {string} label - Dataset label
 * @param {string} color - Dataset color
 * @param {Array} upperData - Upper bound values
 * @param {Array} lowerData - Lower bound values
 */
function createFilledAreaDataset(chart, index, label, color, upperData, lowerData) {
  // Extract the solid color from the transparent color for dashed lines
  const dashColor = color.replace('0.35', '0.7'); // Make dashed lines more visible
  
  // Create or update the filled area between bounds (this takes 2 dataset slots)
  // First, create the upper bound dataset with fill
  if (!chart.data.datasets[index]) {
    chart.data.datasets[index] = {
      label: label,
      data: upperData,
      borderColor: 'transparent', // No border for the fill area
      backgroundColor: color,
      fill: '+1', // Fill to the next dataset (which will be lowerData)
      tension: 0.1,
      pointRadius: 0,
      order: 2 // Draw behind the main lines
    };
  } else {
    // Update existing dataset
    chart.data.datasets[index].data = upperData;
  }

  // Create or update the lower bound dataset that completes the filled area
  if (!chart.data.datasets[index + 1]) {
    chart.data.datasets[index + 1] = {
      label: '', // Empty label to hide from legend
      data: lowerData,
      borderColor: 'transparent', // No border for the fill area
      pointRadius: 0,
      tension: 0.1,
      order: 2 // Draw behind the main lines
    };
  } else {
    // Update existing dataset
    chart.data.datasets[index + 1].data = lowerData;
  }
  
  // Now add two more datasets for the dashed lines (these take 2 more slots)
  // Upper bound dashed line
  if (!chart.data.datasets[index + 2]) {
    chart.data.datasets[index + 2] = {
      label: '', // Empty label to hide from legend
      data: upperData,
      borderColor: dashColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      borderDash: [7, 7], // Add dashed line style
      order: 1 // Draw on top of filled area but below mean lines
    };
  } else {
    chart.data.datasets[index + 2].data = upperData;
  }
  
  // Lower bound dashed line
  if (!chart.data.datasets[index + 3]) {
    chart.data.datasets[index + 3] = {
      label: '', // Empty label to hide from legend
      data: lowerData,
      borderColor: dashColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      borderDash: [7, 7], // Add dashed line style
      order: 1 // Draw on top of filled area but below mean lines
    };
  } else {
    chart.data.datasets[index + 3].data = lowerData;
  }
}