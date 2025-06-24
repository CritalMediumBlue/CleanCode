export const initSignallingTab = (tab, guiActions) => {
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


loadEquations.on('click', () => {
      
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


}