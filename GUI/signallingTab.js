export const initSignallingTab = (tab, guiActions) => {

  const loadEquationsBtn = tab.pages[1].addButton({ title: '📂', label: "Load Equations" });
  tab.pages[1].addBlade({ view: 'separator' });
  const intracellularFolder = tab.pages[1].addFolder({ title: 'Intracellular params' });
  tab.pages[1].addBlade({ view: 'separator' });
  const extracellularFolder = tab.pages[1].addFolder({ title: 'Extracellular params' });
  let parameterSettings = null;

  loadEquationsBtn.on('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.js'; 
    document.body.appendChild(fileInput);
    
    // Set up the file handling
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          eval(e.target.result); 
          const equationsObject = window.equations; 
          guiActions.setEquations(equationsObject);
          initiateSliders(equationsObject);
        };
        reader.readAsText(file); 
      }
      
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
    });

    Object.entries(parameters.extracellularParameters).forEach(([key, constant]) => {
      parameterSettings.extracellular[key] = constant.value;
    });

    return parameterSettings;
  };
  
  const initiateSliders = (equations) => {
    
    const intracellularParameters = equations.intracellularConstants;
    const extracellularParameters = equations.extracellularConstants;
    const parameters = {
      intracellularParameters: intracellularParameters,
      extracellularParameters: extracellularParameters
    };
    parameterSettings = initiateParameterSettings(parameters);
    const bindings = {};

    Object.keys(parameterSettings.intracellular).forEach(paramName => {
      bindings[paramName] = intracellularFolder.addBinding(
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
      bindings[paramName] = extracellularFolder.addBinding(
        parameterSettings.extracellular,
        paramName,
        {
          label: paramName,
          min: parameters.extracellularParameters[paramName].minValue,
          max: parameters.extracellularParameters[paramName].maxValue,
        }
      );

      bindings[paramName].on('change', () => {
        guiActions.setExtracellularParameter(paramName, parameterSettings.extracellular[paramName]);
      });
    });
  };
};