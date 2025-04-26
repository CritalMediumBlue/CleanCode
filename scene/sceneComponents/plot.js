import { createPlot, setup2DStage } from './plotUtils.js';

/**
 * PlotManager - Handles the creation, updating and rendering of plot visualizations
 * Encapsulates all plot-related functionality in a clean, reusable class
 */
export class PlotManager {
    /**
     * Create a new PlotManager
     */
    constructor() {
        this.stage2D = {};
        this.currentIndex = 0;
        this.offset = 0;
        this.plotPoints = null;
        this.config = null;
        this.isInitialized = false;
    }

    /**
     * Initializes the plot visualization
     * @param {Object} THREE - Three.js library
     * @param {Object} config - Configuration object for the plot
     * @returns {PlotManager} - This instance for method chaining
     */
    initialize(THREE, config) {
        if (this.isInitialized) {
            this.dispose();
        }

        this.config = config;
        this.currentIndex = 0;
        this.offset = 0;

        const plot = document.getElementById('plot-overlay');
      
        
        plot.innerHTML = '';
        
        // Set up the 2D stage and create plot components
        this.stage2D = setup2DStage(THREE, this.config.SIZE_RATIO);
        this.plotPoints = createPlot(THREE, this.config, this.stage2D.scene);
        
        this.isInitialized = true;
        return this;
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
        if (!this.isInitialized) {
            console.warn("Plot not initialized. Call initialize() first.");
            return this;
        }
        
        // Update each plot point geometry with its corresponding history
        this._updateGeometry(this.plotPoints.totalPlotPoints.geometry, totalHistory);
        this._updateGeometry(this.plotPoints.magentaPlotPoints.geometry, magentaHistory);
        this._updateGeometry(this.plotPoints.cyanPlotPoints.geometry, cyanHistory);
        this._updateGeometry(this.plotPoints.similarityPlotPoints.geometry, similarityHistory);
        
        this.currentIndex++;
        if (this.currentIndex > this.config.MAX_POINTS) {
            this.offset++;
        }
        
        return this;
    }

    /**
     * Updates a single plot geometry with history data
     * @private
     * @param {Object} geometry - Three.js geometry to update
     * @param {Array} history - History data array
     */
    _updateGeometry(geometry, history) {
        const positions = geometry.attributes.position.array;
        const xStep = 4 / this.config.MAX_POINTS;
        
        for (let i = 0; i < this.config.MAX_POINTS; i++) {
            const historyIndex = this.offset + i;
            const x = -2 + i * xStep;
            const y = historyIndex < history.length ? 
                (history[historyIndex] / this.config.MAX_Y_VALUE) * 2 - 0.999 : -1;
            const index = i * 3;
            positions[index] = x;
            positions[index + 1] = y;
            positions[index + 2] = 0;
        }
        
        geometry.attributes.position.needsUpdate = true;
        const drawRange = Math.min(this.currentIndex, this.config.MAX_POINTS);
        geometry.setDrawRange(0, drawRange);
    }

    /**
     * Renders the plot
     * @returns {PlotManager} - This instance for method chaining
     */
    render() {
        if (!this.isInitialized || !this.stage2D.renderer) {
            console.warn("Plot not initialized or missing renderer.");
            return this;
        }
        
        this.stage2D.renderer.render(this.stage2D.scene, this.stage2D.camera);
        return this;
    }
    
    /**
     * Cleans up resources used by the plot
     */
    dispose() {
        if (!this.isInitialized) return;
        
        // Clean up Three.js resources
        if (this.plotPoints) {
            Object.values(this.plotPoints).forEach(points => {
                if (points.geometry) points.geometry.dispose();
                if (points.material) points.material.dispose();
            });
            this.plotPoints = null;
        }
        
        // Clean up renderer if it exists
        if (this.stage2D.renderer) {
            const domElement = this.stage2D.renderer.domElement;
            if (domElement && domElement.parentNode) {
                domElement.parentNode.removeChild(domElement);
            }
            this.stage2D.renderer.dispose();
        }
        
        this.stage2D = {};
        this.isInitialized = false;
    }
}




