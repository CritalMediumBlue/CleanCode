import uPlot from 'uplot';

/**
 * PlotManager - Handles the creation, updating and rendering of plot visualizations
 * Encapsulates all plot-related functionality in a clean, reusable class
 */
export class PlotManager {
    /**
     * Create a new PlotManager
     */
    constructor() {
        this.chart = null;
        this.xData = [];        // Time/iterations data
        this.totalData = [];    // Total bacteria data
        this.magentaData = [];  // Magenta bacteria data
        this.cyanData = [];     // Cyan bacteria data
        this.similarityData = []; // Similarity data
        this.config = null;
       
    }

    /**
     * Initializes the plot visualization
     * @param {Object} _ - Unused parameter (was THREE library)
     * @param {Object} config - Configuration object for the plot
     * @returns {PlotManager} - This instance for method chaining
     */
    initialize(_, config) {
      

        this.config = config;
        
        const plotContainer = document.getElementById('plot-overlay');
     
        
        // Clear previous content
        plotContainer.innerHTML = '';
        
        // Calculate fixed dimensions (using container size)
        const width = plotContainer.clientWidth;
        const height = plotContainer.clientHeight;
        
        // Initialize empty data arrays with zero values
        this.xData = [0];
        this.totalData = [0];
        this.magentaData = [0];
        this.cyanData = [0];
        this.similarityData = [0];
        
        // Define text color for axis labels and values
        const axisTextColor = "rgb(255, 255, 255)"; // White with slight transparency
        
        // Configure uPlot options
        const opts = {
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
                    range: [0, this.config?.MAX_Y_VALUE || 100]
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
        
        // Create the uPlot chart with initial empty data
        this.chart = new uPlot(opts, [
            this.xData,          // X values
            this.totalData,      // Total bacteria
            this.magentaData,    // Magenta bacteria
            this.cyanData,       // Cyan bacteria
            this.similarityData  // Similarity
        ], plotContainer);
        

    }
    
    /**
     * Updates plot data with new history values
     * @param {Array} totalHistory - History of total bacteria counts
     * @param {Array} magentaHistory - History of magenta bacteria counts
     * @param {Array} cyanHistory - History of cyan bacteria counts
     * @param {Array} similarityHistory - History of similarity values
     * @returns {PlotManager} - This instance for method chaining
     */
    update(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
    
        
        const maxHistoryLength = Math.min(totalHistory.length, 490); // Limit to max points
        this.xData = Array.from({ length: maxHistoryLength }, (_, i) => i); // Create x-axis points
        this.totalData = totalHistory.slice(-maxHistoryLength); // Get last 500 data points
        this.magentaData = magentaHistory.slice(-maxHistoryLength); // Get last 500 data points
        this.cyanData = cyanHistory.slice(-maxHistoryLength); // Get last 500 data points
        this.similarityData = similarityHistory.slice(-maxHistoryLength); // Get last 500 data points
        // Update the x-axis data to match the length of the history
        
        // Prepare data in the format uPlot expects
        const data = [
            this.xData,
            this.totalData,
            this.magentaData,
            this.cyanData,
            this.similarityData
        ];
        
        // Update the chart with new data
        this.chart.setData(data);
        
    }

  

}




