import { processFileData } from './dataProcessor.js';

export const initSessionTab = (tab, guiActions) => {

    // ############################################ Session Buttons ############################################
    // ############### Simulation State controls
    const stateFolder = tab.pages[0].addFolder({title: 'Simulation state'});
    
    const loadButton = stateFolder.addButton({title: '📂',label:"Load state"});
    const savebutton = stateFolder.addButton({title: '💾', label:"Save state"});
    const newSimulationButton = stateFolder.addButton({title: '➕', label:"New Simulation"});
    
    tab.pages[0].addBlade({view: 'separator',  });
    // ############### Simulation execution controls
    const executionfolder = tab.pages[0].addFolder({title: 'Simulation execution'});
    executionfolder.hidden = true;

    const runPauseButton=executionfolder.addButton({title: '▶/⏸', label:"Run/Pause"});
    const stopButton=executionfolder.addButton({title: '⏹', label:"Stop "});
    const resetButton=executionfolder.addButton({title: '↺', label:"Reset "});
    const stepBackButton = executionfolder.addButton({title: '⏮', label:"Step Backward"});
    const stepForwardButton = executionfolder.addButton({title: '⏭', label:"Step Forward"});
    const speedBlade = executionfolder.addBlade({view: 'slider',label: 'Speed',min: 0,max: 1,value: 0.5});
    
    tab.pages[0].addBlade({view: 'separator',  });

    // ############### Simulation recording controls
    const recordFolder = tab.pages[0].addFolder({title: 'Record Screen'});
    recordFolder.hidden = true;
    
    const screenShotButton = recordFolder.addButton({title: '📸', label: "Screenshot"});
    const recordButton = recordFolder.addButton({title: '⏺', label: "Start "});
    const stopRecordButton = recordFolder.addButton({title: '⏹', label: "Stop "});
    
    
    
    // ############################################# Event handlers for buttons #############################################
    
    // ############### Simulation State controls
    loadButton.on('click', () => {
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json'; 
      document.body.appendChild(fileInput);
      
      // Set up the file handling
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            
        const reader = new FileReader();
        reader.onload = (e) => {
            const processedData = processFileData(e.target.result);
            guiActions.init(processedData);
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
    
    // ################ Simulation execution controls
    runPauseButton.on('click', () => {guiActions.setPlayState();});
    resetButton.on('click', () => {guiActions.reset();});
    stepForwardButton.on('click', () => {guiActions.stepForward();});
    
    
    // ################ Simulation recording controls
    screenShotButton.on('click', () => {guiActions.takeScreenshot();});
    
}