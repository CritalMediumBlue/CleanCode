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
     
        {
            id:'MeshVisibleButton', event: 'click', handler: () => {guiActions.setMeshVisible()}
        },
        

      

     
    ];

    toggleButtons.forEach(({ id, event, handler }) => {
        addSafeEventListener(id, event, handler);
    });
    
    return CONFIG;
};

