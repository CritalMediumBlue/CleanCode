import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { processFileData } from './dataProcessor.js';


export const initGUI =  ( init, guiActions) => {
const pane = new Pane({ title:"control", container: document.getElementById('pane'),});



const tab = pane.addTab({pages: [{title: 'Session'},{title: 'Signaling'},{title: 'Visualization'}]});

//Simulation State controls
const stateFolder = tab.pages[0].addFolder({title: 'Simulation state'});

const loadButton = stateFolder.addButton({title: '📂',label:"Load state"});
const savebutton = stateFolder.addButton({title: '💾', label:"Save state"});
const newSimulationButton = stateFolder.addButton({title: '➕', label:"New Simulation"});


//Simulation execution controls
const executionfolder = tab.pages[0].addFolder({title: 'Simulation execution'});

const runButton=executionfolder.addButton({title: '▶', label:"Run "});
const pauseButton=executionfolder.addButton({title: '⏸', label:"Pause "});
const stopButton=executionfolder.addButton({title: '⏹', label:"Stop "});
const resetButton=executionfolder.addButton({title: '↺', label:"Reset "});
const stepBackButton = executionfolder.addButton({title: '⏮', label:"Step Backward"});
const stepForwardButton = executionfolder.addButton({title: '⏭', label:"Step Forward"});
const speedBlade = executionfolder.addBlade({view: 'slider',label: 'Speed',min: 0,max: 1,value: 0.5});
const PARAMS = {
  time: new Date().toLocaleTimeString(),
};
const timeBinding = executionfolder.addBinding(PARAMS, 'time', {readonly: true,});
setInterval(() => {PARAMS.time = new Date().toLocaleTimeString();timeBinding.refresh();}, 100);


//Simulation recording controls
const recordFolder = tab.pages[0].addFolder({title: 'Record Screen'});

const screenShotButton = recordFolder.addButton({title: '📸', label: "Screenshot"});
const recordButton = recordFolder.addButton({title: '⏺', label: "Start "});
const pauseRecordButton = recordFolder.addButton({title: '⏸', label: "Pause "});
const stopRecordButton = recordFolder.addButton({title: '⏹', label: "Stop "});


runButton.on('click', () => {guiActions.setPlayState(true);});
loadButton.on('click', () => {
  
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
        executionfolder.hidden = false;
        recordFolder.hidden = false;
    };
    reader.readAsText(event.target.files[0]);
    }
    
    // Clean up
    document.body.removeChild(fileInput);
  };
  
  fileInput.click();

});
pauseButton.on('click', () => {guiActions.setPlayState(false);});
resetButton.on('click', () => {guiActions.reset();});

executionfolder.hidden = true;
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
const scalesFolder = tab.pages[2].addFolder({title: 'Mesh rendering'});
// More descriptive naming
const visualSettings = {
  bacteria: true,
  mesh: true,
  helperCoordinates: true,
  plot1: true,
  plot2: true,
};
const MeshScalesSettings = {
  meshHeightScale: 15,
  meshTranslationZ: -10,
  colorMultiplier: 1,
}
const meshBinding = visualizationFolder.addBinding(visualSettings, 'mesh', {
  label: 'Mesh'
});
meshBinding.on('change', () => {
  guiActions.setMeshVisible(visualSettings.mesh);
});

// Add bindings with better formatting and labels
const bacteriaBinding = visualizationFolder.addBinding(visualSettings, 'bacteria', {
  label: 'Bacteria'
});
bacteriaBinding.on('change', () => {
  guiActions.setCapsuleVisibility(visualSettings.bacteria);
});

const helperCoordinatesBinding = visualizationFolder.addBinding(visualSettings, 'helperCoordinates', {
  label: 'Helper Coordinates'
});
helperCoordinatesBinding.on('change', () => {
  guiActions.visibleGridAndAxes(visualSettings.helperCoordinates);
});

const plot1Binding = visualizationFolder.addBinding(visualSettings, 'plot1', {
  label: 'Phase Space'
});

const plot2Binding = visualizationFolder.addBinding(visualSettings, 'plot2', {
  label: 'Concentration'
});

const meshHeightScaleBinding = scalesFolder.addBinding(MeshScalesSettings, 'meshHeightScale', {
  label: 'Mesh Height Scale',
  min: 0,
  max: 60,
  step: 1
});
const meshTranslationZBinding = scalesFolder.addBinding(MeshScalesSettings, 'meshTranslationZ', {
  label: 'Mesh offset',
  min: -50,
  max: 30,
  step: 1
});
const colorMultiplierBinding = scalesFolder.addBinding(MeshScalesSettings, 'colorMultiplier', {
  label: 'Color Multiplier',
  min: 0,
  max: 100,
  step: 1
});
meshHeightScaleBinding.on('change', () => {
  guiActions.setMeshScale(MeshScalesSettings.meshHeightScale);
});
meshTranslationZBinding.on('change', () => {
  guiActions.translateMesh(MeshScalesSettings.meshTranslationZ);
});
colorMultiplierBinding.on('change', () => {
  guiActions.setColorMultiplier(MeshScalesSettings.colorMultiplier);
});
}


