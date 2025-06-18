/**
 * guiManager.js
 * Handles all GUI-related event listeners and interactions.
 */

import { CONFIG } from './config.js';
import { processFileData } from './dataProcessor.js';
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';


const pane = new Pane({
  title: 'Panel 1',
  position: 'fixed',
  x: 10,
  y: 10
});


const tab = pane.addTab({
  pages: [
    {title: 'General'},
    {title: 'Concentration'},
    {title: 'Initialization'}
  ],
});

// Create a folder called "Time" in the "General" tab
const timeFolder = tab.pages[0].addFolder({
  title: 'Time'
});

const stateFolder = tab.pages[0].addFolder({
  title: 'State'
});

const scaleConcentration = tab.pages[1].addFolder({
  title: 'Scales'
});

const visibleConcentration = tab.pages[1].addFolder({
  title: 'Visibility'
});

const pane2 = new Pane({
  title: 'Panel 2',
  position: 'fixed',
  x: 300,
  y: 10
});



const tab2 = pane2.addTab({
  pages: [
    {title: 'General'},
    {title: 'Concentration'},
    {title: 'Initialization'}
  ],
});

// Create a folder called "Time" in the "General" tab
const timeFolder2 = tab2.pages[0].addFolder({
  title: 'Time'
});

const stateFolder2 = tab2.pages[0].addFolder({
  title: 'State'
});

const scaleConcentration2 = tab2.pages[1].addFolder({
  title: 'Scales'
});

const visibleConcentration2 = tab2.pages[1].addFolder({
  title: 'Visibility'
});

 
// Get the DOM element of each pane
const pane1Elem = pane.element;
const pane2Elem = pane2.element;

// Set their positions using CSS
pane1Elem.style.position = 'fixed'; 
pane1Elem.style.right = '10px';
pane1Elem.style.top = '10px';

pane2Elem.style.position = 'fixed';
pane2Elem.style.right = '300px';
pane2Elem.style.top = '10px';

// Add a "Step" button to the "Time" folder
timeFolder.addButton({title: 'Run'});
timeFolder.addButton({title: 'Stop'});
timeFolder.addButton({title: 'Reset'});
timeFolder.addButton({title: 'Single Step'});
stateFolder.addButton({title: 'Load State'})
stateFolder.addButton({title: 'Save State'});
const PARAMS = {
  scale: 50,
};
scaleConcentration.addBinding(PARAMS, 'scale', {
  min: 0,
  max: 100,
});




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