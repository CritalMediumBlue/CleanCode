import { createPlotOptions } from './plotOptions.js';
/**
 * Initializes the plot visualization
 * @param {Object} Chart - Chart.js library
 * @param {Object} previusVars - Variables containing species data
 * @returns {Object} - Reference to the created chart
 */



export function setupPlot(Chart, previusVars, coloringRule) {
  const Id = 'plot-overlay';
  const plotContainer = document.getElementById(Id);
  
  // Clear previous content
  plotContainer.innerHTML = '';
  
  // Create canvas element for Chart.js
  const canvas = document.createElement('canvas');
  canvas.width = plotContainer.clientWidth;
  canvas.height = plotContainer.clientHeight;
  plotContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Get chart options from plotOptions.js
  const options = createPlotOptions();
  
  // Create initial empty dataset with dynamic datasets based on species count
  const chartData = {
    labels: [], // x-axis data points (empty initially)
    datasets: generateDatasets(previusVars.int, coloringRule)
  };
  
  // Create and return the chart instance
  return new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: options
  });
}



  

/**
 * Generates datasets for each species with distinct colors
 */
function generateDatasets(intVars, colorRule) {
  const datasets = [];

  
  Object.keys(intVars).forEach(species =>{
  // Use colors from predefined array, or generate one if needed
    //const colorIndex = i % colors.length;
    let color = colorRule[species];

    const cssColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;

    console.log(colorRule)  //Object { AimP: {…}, AimR: {…} }
    console.log(species)  // AimP
    console.log(color)  // Object { r: 255, g: 0, b: 0, a: 0.9 }
    
    datasets.push({
      label: species + ' [nM]',
      data: [], // y-axis data points (empty initially)
      borderColor: cssColor,
      backgroundColor: cssColor,
      borderWidth: 2.5,
      fill: false,
      tension: 0.1,
      pointRadius: 0, // Hide points for cleaner look
      order: 0, // Draw mean lines on top of everything
      zIndex: 10 // Make sure lines appear on top
    });
  }

  )
  
  
  
  return datasets;
}

export function updatePlot(data, chart, colorRule) {
    if (!data) return;
    
    // Extract data
    let means = data[0];
    let stdDevs = data[1];
    
    const numberOfSpecies = means.length - 1; // First element is x-axis labels
    
    const endMean = means[0].length;
    const startMean = Math.max(0, endMean - 500); // Limit to last 500 points
    
    const slicedDataMean = sliceData(startMean, endMean, means);
    
    // Update chart data
    chart.data.labels = slicedDataMean[0]; // X-axis values
    
    // Update all datasets dynamically
    for (let i = 0; i < numberOfSpecies; i++) {
        if (slicedDataMean[i+1]) {
            chart.data.datasets[i].data = slicedDataMean[i+1];
        }
    }
    
    // Update colors based on colorRule
    if (colorRule) {
        for (let i = 0; i < numberOfSpecies; i++) {
            const dataset = chart.data.datasets[i];
            if (dataset && dataset.label) {
                // Extract species name from label (remove ' [nM]' suffix)
                const speciesName = dataset.label.replace(' [nM]', '');
                const colorObj = colorRule[speciesName];
                
                if (colorObj) {
                    const cssColor = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, 0.9)`;
                    dataset.borderColor = cssColor;
                    dataset.backgroundColor = cssColor;
                }
            }
        }
    }
    
        const slicedSD = sliceData(startMean, endMean, stdDevs);
        
        // Create arrays to hold upper and lower bounds for each species
        const upperBounds = [];
        const lowerBounds = [];
        
        // Calculate upper and lower bounds for each species
        for (let i = 0; i < numberOfSpecies; i++) {
            upperBounds[i] = [];
            lowerBounds[i] = [];
            
            if (slicedDataMean[i+1] && slicedSD[i+1]) {
                for (let j = 0; j < slicedDataMean[i+1].length; j++) {
                    upperBounds[i].push(slicedDataMean[i+1][j] + slicedSD[i+1][j]/2);
                    lowerBounds[i].push(Math.max(0, slicedDataMean[i+1][j] - slicedSD[i+1][j]/2)); // Prevent negative values
                }
            }
        }
        
        // Create filled area datasets for each species
        for (let i = 0; i < numberOfSpecies; i++) {
           
            const datasetIndex = numberOfSpecies + (i * 2);
            
            // Get the corresponding color for this species with reduced opacity
            let fillColor = chart.data.datasets[i].backgroundColor;
            
            // Create filled area datasets between the bounds
            createFilledAreaDataset(
                chart, 
                datasetIndex, 
                `${chart.data.datasets[i].label} (±SD)`, 
                fillColor, 
                upperBounds[i], 
                lowerBounds[i]
            );
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

  
  let d = [];

  for (let i = 0; i < data.length; i++) {
      d.push(data[i].slice(start, end));
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
  // Convert existing rgba string to have 0.5 alpha
  const cssColor = color.replace(/rgba?\([^)]+\)/, match => {
    const values = match.match(/[\d.]+/g);
    return `rgba(${values[0]}, ${values[1]}, ${values[2]}, 0.3)`;
  });

  // First, create the upper bound dataset with fill
  if (!chart.data.datasets[index]) {
    chart.data.datasets[index] = {
      label: label,
      data: upperData,
      borderColor: 'white', 
      backgroundColor: cssColor,
      fill: '+1', // Fill to the next dataset (which will be lowerData)
      tension: 0.1,
      pointRadius: 0,
      borderWidth: 1, 
      order: 2 // Draw behind the main lines
    };
  } else {
    chart.data.datasets[index].data = upperData;
    chart.data.datasets[index].backgroundColor = cssColor; // Update color for existing dataset
  }

  // Create or update the lower bound dataset that completes the filled area
  if (!chart.data.datasets[index + 1]) {
    chart.data.datasets[index + 1] = {
      label: '', 
      data: lowerData,
      borderColor: 'white', 
      pointRadius: 0,
      borderWidth: 1, // No border for the lower bound
      tension: 0.1,
      order: 2 // Draw behind the main lines
    };
  } else {
    chart.data.datasets[index + 1].data = lowerData;
  }
  
 
  
  
}
