/**
 * guiManager.js
 * Handles all GUI-related event listeners and interactions.
 */

import { CONFIG } from './config.js';
import { processFileData } from './dataProcessor.js';
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';


const pane = new Pane();
const tab = pane.addTab({
  pages: [
    {title: 'General'},
    {title: 'Concentration'},
  ],
});

// Create a folder called "Time" in the "General" tab
const timeFolder = tab.pages[0].addFolder({
  title: 'Time'
});

const stateFolder = tab.pages[0].addFolder({
  title: 'State'
});




// Add a "Step" button to the "Time" folder
timeFolder.addButton({title: 'Run'});
timeFolder.addButton({title: 'Stop'});
timeFolder.addButton({title: 'Reset'});
timeFolder.addButton({title: 'Single Step'});
stateFolder.addButton({title: 'upload State'})





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