export const initSignallingTab = (tab, guiActions) => {

  const loadEquationsBtn = tab.pages[1].addButton({ title: '📂', label: "Load Equations" });
  tab.pages[1].addBlade({ view: 'separator' });
  const parametersFolder = tab.pages[1].addFolder({ title: 'Parameters' });

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
          initiateSliders(params, parametersFolder, guiActions);
        };
        reader.readAsText(file); 
      }
      
      document.body.removeChild(fileInput);
    };
    
    fileInput.click();
  });

};






  const initiateSliders = (params, parametersFolder, guiActions) => {

   
    
    const parameterSettings = initiateParameterSettings(params);
    const bindings = {};

Object.keys(parameterSettings).forEach(paramName => {

    bindings[paramName] = parametersFolder.addBinding(
      parameterSettings,
      paramName,
      {
        label: paramName,
        min: params[paramName].min,
        max: params[paramName].max,
      }
    );
    bindings[paramName].on('change', () => {
      guiActions.setParam(paramName, parameterSettings[paramName]);
    });
  
});


  };



// Helper function to initiate parameter settings


const initiateParameterSettings = (parameters) => {
    const newParameterSettings = {
    };

    
    Object.entries(parameters).forEach(([species, param]) => {
      newParameterSettings[species] = param.val;
    });


   
    
    Object.seal(newParameterSettings);
    Object.preventExtensions(newParameterSettings);

    return newParameterSettings;
};