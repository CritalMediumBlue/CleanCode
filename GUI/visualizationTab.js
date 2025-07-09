export const initVisualizationTab = (tab, guiActions, vars) => {

const extSpeciesNames = Object.keys(vars.ext);
const intSpeciesNames = Object.keys(vars.int);
const visualizationFolder = tab.pages[2].addFolder({title: 'Visualization'});
tab.pages[2].addBlade({view: 'separator',  });
const meshFolder = tab.pages[2].addFolder({title: 'Mesh rendering'});
tab.pages[2].addBlade({view: 'separator',  });
const colorPickerFolder = tab.pages[2].addFolder({title: 'Color of Reporter molecules'})

// More descriptive naming
const visualSettings = {
  bacteria: true,
  mesh: false,
  species: 'null', 
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
  if (visualSettings.mesh) {
    selectSpeciesBinding.disabled = false;
  } else {
    selectSpeciesBinding.disabled = true;
  }
});

const options = {};
extSpeciesNames.forEach(name => {
  options[name] = name;
});

const selectSpeciesBinding = visualizationFolder.addBinding(visualSettings, 'species', {
  label: 'Select Species',
  options: options,
  
});
selectSpeciesBinding.on('change', (value) => {
  guiActions.selectSpecies(value.value);
});
selectSpeciesBinding.disabled =  true; 

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

const meshHeightScaleBinding = meshFolder.addBinding(MeshScalesSettings, 'meshHeightScale', {
  label: 'Z-Scale mesh',

  step: 0.1
});
const meshTranslationZBinding = meshFolder.addBinding(MeshScalesSettings, 'meshTranslationZ', {
  label: 'Mesh offset',
 
  step: 0.1
});
const colorMultiplierBinding = meshFolder.addBinding(MeshScalesSettings, 'colorMultiplier', {
  label: 'Scale color',
 
  step: 0.1
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









const PARAMS = {};
const colorBindings = {};
intSpeciesNames.forEach(name => {
  PARAMS[name] = {r: 0, g: 0, b: 0, a: 0.5};

  colorBindings[name] = colorPickerFolder.addBinding(
  PARAMS,
  name
);

guiActions.setBacteriaColor(name,PARAMS[name])


  colorBindings[name].on('change', () => {
    guiActions.setBacteriaColor(name,PARAMS[name])
  }
  )
}
);


 




}

