export const initSignallingTab = (tab, guiActions) => {
// Signalling controls
const equations = tab.pages[1].addFolder({title: 'Equations'});
tab.pages[1].addBlade({view: 'separator',  });
const intracellular = tab.pages[1].addFolder({title: 'Intracellular params'});
tab.pages[1].addBlade({view: 'separator',  });
const extracellular = tab.pages[1].addFolder({title: 'Extracellular params'});
const loadEquations = equations.addButton({title: '📂',label:"Load Equations"});


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
            const equations = e.target.result;
            const parameters = guiActions.setEquations(equations);
            console.log('parameter names loaded:', parameters); 

/* The log looks like this:
parameter names loaded: 
Object { intracellularParameters: (6) […], extracellularParameters: (4) […] }
signallingTab.js:28:21
 */

            initiateSliders(parameters);

        };
        reader.readAsText(event.target.files[0]);
        }
        
        // Clean up
        document.body.removeChild(fileInput);

      };
      
      fileInput.click();


    });

    const initiateSliders = (parameters) => {
      

      const parameterSettings = initiateParameterSettings( parameters );

      console.log("Parameter settings initialized:", parameterSettings);

      for ( let i = 0; i < parameters.intracellularParameters.length; i++) {
        const parameter = parameters.intracellularParameters[i];
        console.log("Creating slider for parameter:", parameter);
        // Create a slider for each species in the intracellular folder
        intracellular.addBlade({
          view: 'slider',
          label: parameter,
          min: 0,
          max: 1,
          value: 0.5
        });
      }
      
      for ( let i = 0; i < parameters.extracellularParameters.length; i++) {
        const parameter = parameters.extracellularParameters[i];
        console.log("Creating slider for parameter:", parameter);
        // Create a slider for each species in the extracellular folder
        extracellular.addBlade({
          view: 'slider',
          label: parameter,
          min: 0,
          max: 1,
          value: 0.5
        });
      }

    }

    const initiateParameterSettings = (parameters) => {
    const parameterSettings = {
      intracellular: {},
      extracellular: {}
    };
    parameters.intracellularParameters.forEach(constant => {
      parameterSettings.intracellular[constant] = constant.value;
    });

    parameters.extracellularParameters.forEach(constant => {
      parameterSettings.extracellular[constant] = constant.value;
    });
    return parameterSettings;
    
  }

/* const MeshScalesSettings = {
  meshHeightScale: 15,
  meshTranslationZ: -10,
  colorMultiplier: 1,
}
colorMultiplierBinding.on('change', () => {
  guiActions.setColorMultiplier(MeshScalesSettings.colorMultiplier);
});
 */



}