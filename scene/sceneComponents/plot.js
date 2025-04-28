import uPlot from 'uplot';


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


function createPlotOptions({ width, height }) {
  // Define text color for axis labels and values
  const axisTextColor = "rgb(255, 255, 255)";
  const strokeColor = "rgba(255, 255, 255, 0.5)"; 
  let makeFmt = (suffix) => (u, v, sidx) => {
   
      let d = u.data[sidx];
      if (d && d.length > 0) {
        v = d[d.length - 1];
        if (suffix == '%') {
          v = v.toFixed(2);
        }
      }
      
    
    return v == null ? null : v + suffix;
  };
  return {
    width,
    height,
    cursor: {
      focus: { prox: 10, }
    },
    series: [
      {
          label: "Time step",
          value: (u, v, sidx, didx) => {
              if (didx == null) {
                  let d = u.data[sidx];
                  v = d[d.length - 1];
              }

              return v;
          }
      },
      {
          label: "Total",
          scale: "count",
          value: makeFmt(" Bacteria"),
          stroke: "white",
          width: 2,
          fill: "rgba(255, 255, 255, 0.2)",
      },
      {
          label: "Magenta",
          scale: "%",
          value: makeFmt('%'),
          stroke: "magenta",
          width: 2,
      },
      {
          label: "Cyan",
          scale: "%",
          value: makeFmt('%'),
          stroke: "cyan",
          width: 2,
      },
      {
          label: "Similarity",
          scale: "%",
          value: makeFmt('%'),
          stroke: "yellow",
          width: 2,
      }
      
  ],
    scales: {
      x: {
        time: false, 
      }
    }, 
    axes: [
      {
        stroke: axisTextColor, // Axis line color
        grid: {
          show: true,
          stroke: strokeColor, // Grid line color
        },
        font: "12px Arial",
      },
      {
        stroke: axisTextColor, // Axis line color
        grid: {
          stroke: strokeColor, // Grid line color
        },
        scale: 'count',
        font: "12px Arial"
      },
      { 
        side: 1,
        stroke: axisTextColor, // Axis line color
        grid: {
          show: false,
          stroke: strokeColor, // Grid line color
        },
        font: "12px Arial",
        color: axisTextColor, // Y-axis label text color
        scale: '%'
      }
    ]
  };
}