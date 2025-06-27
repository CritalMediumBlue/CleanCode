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

          const eqs = window.eqs; 
          const vars = window.vars;
          const params = window.params;

          console.log('Equations loaded:', eqs);
          console.log('Variables loaded:', vars);
          console.log('Parameters loaded:', params);

          guiActions.setModel(vars, params, eqs);
          initiateSliders(params);
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

    console.log(parameters.int)
    
    Object.entries(parameters.int).forEach(([key, constant]) => {
      parameterSettings.intracellular[key] = constant.val;
    });

    console.log(parameters.ext)

    Object.entries(parameters.ext).forEach(([key, constant]) => {
      parameterSettings.extracellular[key] = constant.val;
    });

    return parameterSettings;
  };
  
  const initiateSliders = (params) => {
   
    const parameters = {
      int: params.int,
      ext: params.ext
    };
    parameterSettings = initiateParameterSettings(parameters);
    const bindings = {};

Object.keys(parameterSettings.intracellular).forEach(paramName => {
  // Only add binding if value is a number
  console.log("Adding bindings")
  console.log(parameterSettings.intracellular)
  if (typeof parameterSettings.intracellular[paramName] === 'number') {
    bindings[paramName] = intracellularFolder.addBinding(
      parameterSettings.intracellular,
      paramName,
      {
        label: paramName,
        min: parameters.int[paramName].min,
        max: parameters.int[paramName].max,
      }
    );
    bindings[paramName].on('change', () => {
      guiActions.setIntracellularParameter(paramName, parameterSettings.intracellular[paramName]);
    console.log("parameters Set!")
    });
  }
});

Object.keys(parameterSettings.extracellular).forEach(paramName => {
  // Only add binding if value is a number
  if (typeof parameterSettings.extracellular[paramName] === 'number') {
    bindings[paramName] = extracellularFolder.addBinding(
      parameterSettings.extracellular,
      paramName,
      {
        label: paramName,
        min: parameters.ext[paramName].min,
        max: parameters.ext[paramName].max,
      }
    );
    bindings[paramName].on('change', () => {
      guiActions.setExtracellularParameter(paramName, parameterSettings.extracellular[paramName]);
    });
  }
});
  };
};