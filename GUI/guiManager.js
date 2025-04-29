/**
 * guiManager.js
 * Handles all GUI-related event listeners and interactions.
 */

import { CONFIG } from './config.js';
import { handleFileInput as processFileInput } from './dataProcessor.js';


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
 * Handles file input processing, decoupling main.js from dataProcessor.js
 * @param {Event} event - The file input event
 * @param {Function} resetCallback - Function to reset all data
 * @param {Function} animateCallback - Function to start animation
 */
const handleFileInput = (event, resetCallback, animateCallback,setBacteriaDataCallback) => {
    // Forward to the dataProcessor's handleFileInput but intercept the data callback
    processFileInput(event, resetCallback, animateCallback, (data, processedData) => {
        // Process the data through our internal function before sending to main
        setBacteriaDataCallback(data, processedData);
    });
};



/**
 * Attaches event listeners to various UI controls (buttons, sliders, dropdowns, file input)
 * to manage simulation playback, parameter adjustments, and data loading.
 * 
 * @param {Function} animate - Function to start the animation loop
 * @param {Function} resetAllData - Function to reset all data 
 * @param {Function} externalSetBacteriaData - Function to set the bacteria data
 * @param {Function} renderPlot - Function to render the plot from sceneManager
 * @param {Object} guiActions - Object containing functions for simulation operations
 * @returns {Object} The configuration object for dependency injection
 */
export const addEventListeners = ( animate, resetAllData, externalSetBacteriaData, guiActions) => {
    console.log("Adding event listeners...");
    
    
    // Simple toggle buttons with declarative configuration
    const toggleButtons = [
        { id: 'playButton', event: 'click', handler: () => guiActions.setPlayState(true) },
        { id: 'pauseButton', event: 'click', handler: () => guiActions.setPlayState(false) },
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
                guiActions.setValue(value, 'signal');
            }
        },

        {
            id: 'alphaSlider', event: 'input', handler: (event) => {
                const value = parseFloat(event.target.value);
                const valueElement = document.getElementById('alphaValue');
                if (valueElement) valueElement.textContent = value.toFixed(5);
                guiActions.setValue(value, 'alpha');
            }
        },

        // File input
        {
            id: 'fileInput', event: 'change', handler: (event) => {
                // Use our own handleFileInput which wraps dataProcessor's function
                handleFileInput(event, resetAllData, animate,externalSetBacteriaData);
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

