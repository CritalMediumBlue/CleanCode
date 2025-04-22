import * as THREE from 'three';
import { CONFIG } from '../config.js';


class PlotRenderer {
    constructor() {
        this.scene2D = null;
        this.camera2D = null;
        this.renderer2D = null;
        this.totalPlotPoints = null;
        this.magentaPlotPoints = null;
        this.cyanPlotPoints = null;
        this.similarityPlotPoints = null;
        this.yTicks = null;
        this.needsRender = false;
        this.currentIndex = 0;
        this.offset = 0;
        this.loadedFont = null; // Cache the font
        this.textMesh = null;   // Hold the current text mesh
    }

    init() {
        const plot = document.getElementById('plot-overlay');
        plot.innerHTML = '';
        this.scene2D = new THREE.Scene();
        this.camera2D = new THREE.OrthographicCamera(-2, 2, 1, -1, 0.1, 100);
        this.camera2D.position.z = 1;
        this.renderer2D = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        this.renderer2D.setSize(window.innerWidth * CONFIG.PLOT_RENDERER.PLOT_WIDTH_RATIO, window.innerHeight * CONFIG.PLOT_RENDERER.PLOT_HEIGHT_RATIO);
        this.renderer2D.domElement.style.position = 'absolute';
        document.getElementById('plot-overlay').appendChild(this.renderer2D.domElement);
   
        this.createPlot();
    }


   
    createPlot() {
        this.createPlotGeometries();
        this.createPlotMaterials();
        this.createPlotPoints();
        this.createTicks();
    }

    createPlotGeometries() {
        const positions = new Float32Array(CONFIG.PLOT_RENDERER.MAX_POINTS * 3);
        const createGeometry = () => {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
            return geometry;
        };
        
        this.totalGeometry = createGeometry();
        this.magentaGeometry = createGeometry();
        this.cyanGeometry = createGeometry();
        this.similarityGeometry = createGeometry();
    }

    createPlotMaterials() {
        this.totalMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: CONFIG.PLOT_RENDERER.POINT_SIZE });
        this.magentaMaterial = new THREE.PointsMaterial({ color: 0xff00ff, size: CONFIG.PLOT_RENDERER.POINT_SIZE });
        this.cyanMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: CONFIG.PLOT_RENDERER.POINT_SIZE });
        this.similarityMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: CONFIG.PLOT_RENDERER.POINT_SIZE });
    }

    createPlotPoints() {
        this.totalPlotPoints = new THREE.Points(this.totalGeometry, this.totalMaterial);
        this.magentaPlotPoints = new THREE.Points(this.magentaGeometry, this.magentaMaterial);
        this.cyanPlotPoints = new THREE.Points(this.cyanGeometry, this.cyanMaterial);
        this.similarityPlotPoints = new THREE.Points(this.similarityGeometry, this.similarityMaterial);

        this.scene2D.add(this.totalPlotPoints, this.magentaPlotPoints, this.cyanPlotPoints, this.similarityPlotPoints);
    }

    createTicks() {
        const tickMaterial = new THREE.LineBasicMaterial({ color: CONFIG.PLOT_RENDERER.AXIS_COLOR });
        this.yTicks = new THREE.Group();
        const points = [];
        for (let i = 0; i <= CONFIG.PLOT_RENDERER.MAX_Y_VALUE; i += CONFIG.PLOT_RENDERER.Y_TICK_STEP) {
            const y = (i / CONFIG.PLOT_RENDERER.MAX_Y_VALUE) * 2 - 0.999;
            points.push(new THREE.Vector3(-2, y, 0), new THREE.Vector3(2, y, 0));
        }
        const tickGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const ticks = new THREE.LineSegments(tickGeometry, tickMaterial);
        this.yTicks.add(ticks);
        this.scene2D.add(this.yTicks);
    }

    updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
        const updateGeometry = (geometry, history) => {
            const positions = geometry.attributes.position.array;
            const xStep = 4 / CONFIG.PLOT_RENDERER.MAX_POINTS;
            
            for (let i = 0; i < CONFIG.PLOT_RENDERER.MAX_POINTS; i++) {
                const historyIndex = this.offset + i;
                const x = -2 + i * xStep;
                const y = historyIndex < history.length ? (history[historyIndex] / CONFIG.PLOT_RENDERER.MAX_Y_VALUE) * 2 - 0.999 : -1;
                const index = i * 3;
                positions[index] = x;
                positions[index + 1] = y;
                positions[index + 2] = 0;
            }
            
            geometry.attributes.position.needsUpdate = true;
            geometry.setDrawRange(0, Math.min(this.currentIndex, CONFIG.PLOT_RENDERER.MAX_POINTS));
        };
        
        updateGeometry(this.totalPlotPoints.geometry, totalHistory);
        updateGeometry(this.magentaPlotPoints.geometry, magentaHistory);
        updateGeometry(this.cyanPlotPoints.geometry, cyanHistory);
        updateGeometry(this.similarityPlotPoints.geometry, similarityHistory);
        
        this.currentIndex++;
        if (this.currentIndex > CONFIG.PLOT_RENDERER.MAX_POINTS) {
            this.offset++;
        }
        this.needsRender = true;

    }

    render() {
        if (this.needsRender) {
            this.renderer2D.render(this.scene2D, this.camera2D);
            this.needsRender = false;
        }
    }
}

let plotRendererInstance = new PlotRenderer();

export function initPlotRenderer() {
    plotRendererInstance = new PlotRenderer();
    plotRendererInstance.init();
}

export function updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory) {
    plotRendererInstance.updatePlot(totalHistory, magentaHistory, cyanHistory, similarityHistory);
}

export function renderPlot() {
    plotRendererInstance.render();
}