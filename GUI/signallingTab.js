export const initSignallingTab = (tab, guiActions) => {

  const loadEquationsBtn = tab.pages[1].addButton({ title: '📂', label: "Load Equations" });
  tab.pages[1].addBlade({ view: 'separator' });
  const intracellularFolder = tab.pages[1].addFolder({ title: 'Intracellular params' });
  tab.pages[1].addBlade({ view: 'separator' });
  const extracellularFolder = tab.pages[1].addFolder({ title: 'Extracellular params' });

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
          
          const vars = window.vars;
          const params = window.params;

          guiActions.setModel(vars, params);
          initiateSliders(params, intracellularFolder, extracellularFolder, guiActions);
        };
        reader.readAsText(file); 
      }
      
      document.body.removeChild(fileInput);
    };
    
    fileInput.click();
  });

};






  const initiateSliders = (params, intracellularFolder, extracellularFolder, guiActions) => {

   
    
    const parameterSettings = initiateParameterSettings(params);
    const bindings = {};

Object.keys(parameterSettings.intracellular).forEach(paramName => {

    bindings[paramName] = intracellularFolder.addBinding(
      parameterSettings.intracellular,
      paramName,
      {
        label: paramName,
        min: params.int[paramName].min,
        max: params.int[paramName].max,
      }
    );
    bindings[paramName].on('change', () => {
      guiActions.setParam(paramName, parameterSettings.intracellular[paramName]);
    });
  
});

Object.keys(parameterSettings.extracellular).forEach(paramName => {
  // Only add binding if value is a number
  if (typeof parameterSettings.extracellular[paramName] === 'number') {
    bindings[paramName] = extracellularFolder.addBinding(
      parameterSettings.extracellular,
      paramName,
      {
        label: paramName,
        min: params.ext[paramName].min,
        max: params.ext[paramName].max,
      }
    );
    bindings[paramName].on('change', () => {
      guiActions.setParam(paramName, parameterSettings.extracellular[paramName]);
    });
  }
});
  };



// Helper function to initiate parameter settings


const initiateParameterSettings = (parameters) => {
    const newParameterSettings = {
      intracellular: {},
      extracellular: {}
    };

    
    Object.entries(parameters.int).forEach(([species, param]) => {
      newParameterSettings.intracellular[species] = param.val;
    });


    Object.entries(parameters.ext).forEach(([species, param]) => {
      newParameterSettings.extracellular[species] = param.val;
    });
    
    Object.seal(newParameterSettings.intracellular);
    Object.seal(newParameterSettings.extracellular);
    Object.preventExtensions(newParameterSettings.intracellular);
    Object.preventExtensions(newParameterSettings.extracellular);

    return newParameterSettings;
};