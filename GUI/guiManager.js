/**
 * guiManager.js
 * Handles all GUI-related event listeners and interactions.
 */

import { CONFIG } from './config.js';
import { handleFileInput } from './dataProcessor.js';
import { 
    sceneState, 
    animationState, 
    dataState, 
} from '../state/stateManager.js';
import { setSignalValue, setAlphaValue } from '../simulation/simulationManager.js';
import { renderPlot } from '../scene/sceneManager.js';

/**
 * Safely adds an event listener to a DOM element identified by its ID.
 * Logs a warning if the element is not found.
 * @param {string} id - The ID of the DOM element.
 * @param {string} event - The name of the event to listen for (e.g., 'click', 'input').
 * @param {Function} handler - The function to execute when the event occurs.
 */
const addSafeEventListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`Element with id '${id}' not found`);
    }
};

/**
 * Provides the current configuration to external modules.
 * Acts as a configuration provider to decouple direct dependencies.
 * @returns {Object} The current configuration object
 */
const getConfiguration = () => {
    return CONFIG;
};

/**
 * Attaches event listeners to various UI controls (buttons, sliders, dropdowns, file input)
 * to manage simulation playback, parameter adjustments, and data loading.
 * 
 * @param {Function} updateScene - Function to update the scene for single step operations
 * @param {Function} animate - Function to start the animation loop
 * @param {Function} resetAllData - Function to reset all data 
 * @param {Function} setBacteriaData - Function to set the bacteria data
 * @returns {Object} The configuration object for dependency injection
 */
const addEventListeners = (updateScene, animate, resetAllData, setBacteriaData) => {
    console.log("Adding event listeners...");
    // Simple toggle buttons with declarative configuration
    const toggleButtons = [
        { id: 'playButton', event: 'click', handler: () => { animationState.play = true; } },
        { id: 'pauseButton', event: 'click', handler: () => { animationState.play = false; } },
        {
            id: 'singleStepButton', event: 'click', handler: () => {
                animationState.play = false;
                updateScene(); // Perform one update
                // Manually render after single step if not playing
                if (sceneState.renderer && sceneState.scene && sceneState.camera) {
                    sceneState.renderer.render(sceneState.scene, sceneState.camera);
                }
                renderPlot();
            }
        },
        { id: 'visible', event: 'click', handler: () => { sceneState.visibleBacteria = !sceneState.visibleBacteria; } },
        { id: 'visibleMesh', event: 'click', handler: () => { if (sceneState.surfaceMesh) sceneState.surfaceMesh.visible = !sceneState.surfaceMesh.visible; } },

        // Select/dropdown controls
        {
            id: 'toggleColorButton', event: 'change', handler: (event) => {
                const selectedValue = event.target.value;
                CONFIG.BACTERIUM.COLOR_BY_INHERITANCE = (selectedValue === 'phenotype');
                CONFIG.BACTERIUM.COLOR_BY_SIMILARITY = (selectedValue === 'similarity');
            }
        },

        {
            id: 'toggleFeedbackButton', event: 'change', handler: (event) => {
                CONFIG.BACTERIUM.POSITIVE_FEEDBACK = (event.target.value === 'positive');
            }
        },

        // Slider controls
        {
            id: 'signalSlider', event: 'input', handler: (event) => {
                const value = parseFloat(event.target.value);
                const valueElement = document.getElementById('signalValue');
                if (valueElement) valueElement.textContent = value.toFixed(2);
                setSignalValue(sceneState.bacteriumSystem, value);
            }
        },

        {
            id: 'alphaSlider', event: 'input', handler: (event) => {
                const value = parseFloat(event.target.value);
                const valueElement = document.getElementById('alphaValue');
                if (valueElement) valueElement.textContent = value.toFixed(5);
                setAlphaValue(sceneState.bacteriumSystem, value);
            }
        },

        // File input
        {
            id: 'fileInput', event: 'change', handler: (event) => {
                // Pass animate function to start loop after data processing
                handleFileInput(event, resetAllData, animate, setBacteriaData);
            }
        }
    ];

    // Register all event listeners
    toggleButtons.forEach(({ id, event, handler }) => {
        addSafeEventListener(id, event, handler);
    });
    
    // Return configuration for dependency injection
    return CONFIG;
};

// Export functions
export { addEventListeners, addSafeEventListener, getConfiguration };