/**
 * guiManager.js
 * Handles all GUI-related event listeners and interactions.
 */

import { CONFIG } from './config.js';
import { processFileData } from './dataProcessor.js';

const addSafeEventListener = (id, event, handler) => {
  
    document.getElementById(id).addEventListener(event, handler);
    
};

export const addEventListeners = ( init, guiActions) => {
    
    const toggleButtons = [
        { id: 'playButton', event: 'click', handler: () => guiActions.setPlayState(true) },
        { id: 'pauseButton', event: 'click', handler: () => guiActions.setPlayState(false) },
        {
            id: 'toggleColorButton', event: 'change', handler: (event) => {
                const selectedValue = event.target.value;
                CONFIG.BACTERIUM.COLOR_BY_INHERITANCE = (selectedValue === 'phenotype');
                CONFIG.BACTERIUM.COLOR_BY_SIMILARITY = (selectedValue === 'similarity');
            }
        },
        {
            id:'MeshVisibleButton', event: 'click', handler: () => {guiActions.setMeshVisible()}
        },
        

        {
            id: 'toggleFeedbackButton', event: 'change', handler: (event) => {
                CONFIG.BACTERIUM.POSITIVE_FEEDBACK = (event.target.value === 'positive');
            }
        },

      

     

        {
            id: 'fileInput', event: 'change', handler: (event) => {
                handleFileInput( init , event);
            }
        }
    ];

    toggleButtons.forEach(({ id, event, handler }) => {
        addSafeEventListener(id, event, handler);
    });
    
    return CONFIG;
};



const handleFileInput = (init,event) => {
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const processedData = processFileData(e.target.result);
        init(processedData);
    };
    reader.readAsText(event.target.files[0]);
};