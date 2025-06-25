export const initSignallingTab = (tab, guiActions) => {
  // Signalling controls
  const equations = tab.pages[1].addFolder({ title: 'Equations' });
  tab.pages[1].addBlade({ view: 'separator' });
  const intracellular = tab.pages[1].addFolder({ title: 'Intracellular params' });
  tab.pages[1].addBlade({ view: 'separator' });
  const extracellular = tab.pages[1].addFolder({ title: 'Extracellular params' });
  const loadEquations = equations.addButton({ title: '📂', label: "Load Equations" });
  let parameterSettings = null;
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
          console.log("parameter loaded:", parameters);
          initiateSliders(parameters);
        };
        reader.readAsText(file);
      }
      
      // Clean up
      document.body.removeChild(fileInput);
    };
    
    fileInput.click();
  });

  const initiateParameterSettings = (parameters) => {
    const parameterSettings = {
      intracellular: {},
      extracellular: {}
    };
    
    Object.entries(parameters.intracellularParameters).forEach(([key, constant]) => {
      parameterSettings.intracellular[key] = constant.value;
      console.log(key, constant.value);
    });

    Object.entries(parameters.extracellularParameters).forEach(([key, constant]) => {
      parameterSettings.extracellular[key] = constant.value;
      console.log(key, constant.value);
    });

    return parameterSettings;
  };
  
  const initiateSliders = (parameters) => {
    parameterSettings = initiateParameterSettings(parameters);
    console.log("Parameter settings initialized:", parameterSettings);
    const bindings = {};
    console.log("We will create bindings for the following parameters:", parameterSettings);

    Object.keys(parameterSettings.intracellular).forEach(paramName => {
      const settings = parameterSettings.intracellular;
      bindings[paramName] = intracellular.addBinding(
        parameterSettings.intracellular,
        paramName,
        {
          label: paramName,
          min: parameters.intracellularParameters[paramName].minValue,
          max: parameters.intracellularParameters[paramName].maxValue,
        }
      );
      
      bindings[paramName].on('change', () => {
        guiActions.setIntracellularParameter(paramName, parameterSettings.intracellular[paramName]);
      });
    });
    
    Object.keys(parameterSettings.extracellular).forEach(paramName => {
      const settings = parameterSettings.extracellular;
      bindings[paramName] = extracellular.addBinding(
        settings,
        paramName,
        {
          label: paramName,
          min: parameters.extracellularParameters[paramName].minValue,
          max: parameters.extracellularParameters[paramName].maxValue,
        }
      );
      
      bindings[paramName].on('change', () => {
        guiActions.setExtracellularParameter(paramName, settings[paramName]);
      });
    });
  };
};