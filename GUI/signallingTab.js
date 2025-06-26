// --- Helper Functions ---

/**
 * Initializes the parameter settings object from given parameters.
 */
function createParameterSettings(parameters) {
  return {
    intracellular: Object.fromEntries(
      Object.entries(parameters.intracellularParameters).map(([key, constant]) => [key, constant.value])
    ),
    extracellular: Object.fromEntries(
      Object.entries(parameters.extracellularParameters).map(([key, constant]) => [key, constant.value])
    ),
  };
}

/**
 * Adds parameter sliders to the given folder and sets up change listeners.
 */
function addParameterBindings(folder, params, paramDefs, onChange) {
  const bindings = {};
  Object.keys(params).forEach(paramName => {
    bindings[paramName] = folder.addBinding(
      params,
      paramName,
      {
        label: paramName,
        min: paramDefs[paramName].minValue,
        max: paramDefs[paramName].maxValue,
      }
    );
    bindings[paramName].on('change', () => onChange(paramName, params[paramName]));
  });
  return bindings;
}

/**
 * Handles loading and evaluating the equations file.
 */
function handleLoadEquations(guiActions, initiateSliders) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.js';
  document.body.appendChild(fileInput);

  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        eval(e.target.result); // Assumes equations are set on window.equations
        const equations = window.equations;
        guiActions.setEquations(equations);
        initiateSliders(equations);
      };
      reader.readAsText(file);
    }
    document.body.removeChild(fileInput);
  };

  fileInput.click();
}

// --- Main Tab Initialization ---

export const initSignallingTab = (tab, guiActions) => {
  // --- UI Structure ---
  const equationsFolder = tab.pages[1].addFolder({ title: 'Equations' });
  tab.pages[1].addBlade({ view: 'separator' });
  const intracellularFolder = tab.pages[1].addFolder({ title: 'Intracellular params' });
  tab.pages[1].addBlade({ view: 'separator' });
  const extracellularFolder = tab.pages[1].addFolder({ title: 'Extracellular params' });

  // --- Load Equations Button ---
  const loadEquationsBtn = equationsFolder.addButton({ title: '📂', label: "Load Equations" });
  let parameterSettings = null;

  // --- Slider Initialization ---
  function initiateSliders(equations) {
    const parameters = {
      intracellularParameters: equations.intracellularConstants,
      extracellularParameters: equations.extracellularConstants,
    };
    parameterSettings = createParameterSettings(parameters);

    addParameterBindings(
      intracellularFolder,
      parameterSettings.intracellular,
      parameters.intracellularParameters,
      (paramName, value) => guiActions.setIntracellularParameter(paramName, value)
    );

    addParameterBindings(
      extracellularFolder,
      parameterSettings.extracellular,
      parameters.extracellularParameters,
      (paramName, value) => guiActions.setExtracellularParameter(paramName, value)
    );
  }

  // --- Button Event ---
  loadEquationsBtn.on('click', () => handleLoadEquations(guiActions, initiateSliders));
};