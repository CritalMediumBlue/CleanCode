/**
 * guiManager.js
 * Handles all GUI-related event listeners and interactions.
 */

import { CONFIG } from './config.js';
import { handleFileInput } from './dataProcessor.js';

const addSafeEventListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`Element with id '${id}' not found`);
    }
};

export const addEventListeners = ( init, guiActions) => {
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
                handleFileInput( init , event);
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

