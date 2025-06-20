import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { CONFIG } from './config.js';
import { processFileData } from './dataProcessor.js';


export const initGUI =  ( init, guiActions) => {
const pane = new Pane({ title:"control", container: document.getElementById('pane'),});

const tab = pane.addTab({pages: [{title: 'Session'},{title: 'Signaling'},{title: 'Visualization'}]});

// Session controls
const stateFolder = tab.pages[0].addFolder({title: 'State'});
const timeFolder = tab.pages[0].addFolder({title: 'Execution'});
const recordFolder = tab.pages[0].addFolder({title: 'Record Screen'});


const loadButton = stateFolder.addButton({title: '📂',label:"Load state"});
const savebutton = stateFolder.addButton({title: '💾', label:"Save state"});
const newSimulationButton = stateFolder.addButton({title: '➕', label:"New Simulation"});

const runButton=timeFolder.addButton({title: '▶', label:"Run "});
const pauseButton=timeFolder.addButton({title: '⏸', label:"Pause "});
const stopButton=timeFolder.addButton({title: '⏹', label:"Stop "});
const resetButton=timeFolder.addButton({title: '↺', label:"Reset "});
const stepBackButton = timeFolder.addButton({title: '⏮', label:"Step Backward"});
const stepForwardButton = timeFolder.addButton({title: '⏭', label:"Step Forward"});
const speedBlade = timeFolder.addBlade({view: 'slider',label: 'Speed',min: 0,max: 1,value: 0.5});
const PARAMS = {
  time: new Date().toLocaleTimeString(),
};

const timeBinding = timeFolder.addBinding(PARAMS, 'time', {readonly: true,});
setInterval(() => {PARAMS.time = new Date().toLocaleTimeString();timeBinding.refresh();}, 100);

const screenShotButton = recordFolder.addButton({title: '📸', label: "Screenshot"});
const recordButton = recordFolder.addButton({title: '⏺', label: "Start "});
const pauseRecordButton = recordFolder.addButton({title: '⏸', label: "Pause "});
const stopRecordButton = recordFolder.addButton({title: '⏹', label: "Stop "});


runButton.on('click', () => {guiActions.setPlayState(true);});
loadButton.on('click', () => {
  
  
  // Create a temporary file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json'; // Specify acceptable file types if needed
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  // Set up the file handling
  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
        
    const reader = new FileReader();
    reader.onload = (e) => {
        const processedData = processFileData(e.target.result);
        init(processedData);
    };
    reader.readAsText(event.target.files[0]);
    }
    
    // Clean up
    document.body.removeChild(fileInput);
  };
  
  // Trigger file selection dialog
  fileInput.click();
  // Show the relevant folders
  timeFolder.hidden = false;
  recordFolder.hidden = false;
});
pauseButton.on('click', () => {guiActions.setPlayState(false);});

timeFolder.hidden = true;
recordFolder.hidden = true;


// Signalling controls
const equations = tab.pages[1].addFolder({title: 'Equations'});
const intracellular = tab.pages[1].addFolder({title: 'Cytoplasm params'});
const extracellular = tab.pages[1].addFolder({title: 'Extracellular params'});

const loadEquations = equations.addButton({title: '📂',label:"Load Equations"});

const sliderK1 = intracellular.addBlade({view: 'slider',label: 'k1',min: 0,max: 1,value: 0.5});
const sliderK2 = intracellular.addBlade({view: 'slider',label: 'k2',min: 0,max: 1,value: 0.5});
const diffusionCoefficient = extracellular.addBlade({view: 'slider',label: 'Diff Coeff',min: 0,max: 1,value: 0.5});
const kout = extracellular.addBlade({view: 'slider',label: 'kout',min: 0,max: 1,value: 0.5    });
const Kin = extracellular.addBlade({view: 'slider',label: 'Kin',min: 0,max: 1,value: 0.5});


// Visualization controls
const visualizationFolder = tab.pages[2].addFolder({title: 'Visualization'});
// More descriptive naming
const visualSettings = {
  bacteria: true,
  mesh: true,
  plot1: true,
  plot2: true,
};

// Add bindings with better formatting and labels
const bacteriaBinding = visualizationFolder.addBinding(visualSettings, 'bacteria', {
  label: 'Bacteria'
});

const meshBinding = visualizationFolder.addBinding(visualSettings, 'mesh', {
  label: 'Mesh'
});

const plot1Binding = visualizationFolder.addBinding(visualSettings, 'plot1', {
  label: 'Phase Space'
});

const plot2Binding = visualizationFolder.addBinding(visualSettings, 'plot2', {
  label: 'Concentration'
});


}



