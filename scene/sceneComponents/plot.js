import uPlot from 'uplot';
import { createPlotOptions } from './plotConfig.js';

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
       
    }

    /**
     * Initializes the plot visualization
     * @param {Object} _ - Unused parameter (was THREE library)
     * @returns {PlotManager} - This instance for method chaining
     */
    initialize(_) {
      

        
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
        
        const plotOptions = createPlotOptions({
            width,
            height,
            maxYValue: 1600
        });
        
        // Create the uPlot chart with initial empty data
        this.chart = new uPlot(plotOptions, [
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




