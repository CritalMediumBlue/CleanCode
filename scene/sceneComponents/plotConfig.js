/**
 * Plot configuration module
 * Contains functions to create and configure uPlot options
 */

/**
 * Creates uPlot configuration options
 * @param {Object} params - Parameters needed for plot configuration
 * @param {number} params.width - Plot width
 * @param {number} params.height - Plot height
 * @param {number} params.maxYValue - Maximum Y-axis value
 * @returns {Object} uPlot configuration object
 */
export function createPlotOptions({ width, height, maxYValue = 100 }) {
  // Define text color for axis labels and values
  const axisTextColor = "rgb(255, 255, 255)";

  return {
    width,
    height,
    // Prevent uPlot from growing with each update by setting fixed size
    autoSize: false,
    scales: {
      x: {
        time: false,
        auto: false,
        // Fix x-axis range to prevent expanding
        range: (self, min, max) => {
          const buffer = 500;
          // Keep a fixed width of points
          return [0, buffer];
        }
      },
      y: {
        auto: true,
        range: [0, maxYValue]
      }
    },
    axes: [
      {
        // X-axis styling
        stroke: "rgb(255, 255, 255)", // Axis line color
        grid: {
          show: true,
          stroke: 'rgba(255, 255, 255,0.5)', // Grid line color
        },
        ticks: {
          show: true,
          stroke: "rgb(255, 255, 255)", // Tick color
        },
        font: "12px Arial",
        color: axisTextColor, // X-axis label text color
      },
      {
        // Y-axis styling
        stroke: "rgb(255, 255, 255)", // Axis line color
        grid: {
          show: true,
          stroke: 'rgba(255, 255, 255,0.5)', // Grid line color
        },
        ticks: {
          show: true,
          stroke: "rgb(255, 255, 255)", // Tick color
        },
        font: "12px Arial",
        color: axisTextColor, // Y-axis label text color
      }
    ],
    legend: {
      show: true
    },
    padding: [10, 10, 10, 10], // [top, right, bottom, left]
    series: [
      {}, // X values (time/iterations)
      {
        label: "Total",
        stroke: "white",
        width: 2,
      },
      {
        label: "Magenta",
        stroke: "magenta",
        width: 2,
      },
      {
        label: "Cyan",
        stroke: "cyan",
        width: 2,
      },
      {
        label: "Similarity",
        stroke: "yellow",
        width: 2,
      }
    ]
  };
}