export const initVisualizationTab = (tab, guiActions, vars) => {

const extSpeciesNames = Object.keys(vars.ext);
// Visualization controls
const visualizationFolder = tab.pages[2].addFolder({title: 'Visualization'});
tab.pages[2].addBlade({view: 'separator',  });
const meshFolder = tab.pages[2].addFolder({title: 'Mesh rendering'});
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
  min: 0,
  max: 60,
  step: 0.01
});
const meshTranslationZBinding = meshFolder.addBinding(MeshScalesSettings, 'meshTranslationZ', {
  label: 'Mesh offset',
  min: -30,
  max: 30,
  step: 0.01
});
const colorMultiplierBinding = meshFolder.addBinding(MeshScalesSettings, 'colorMultiplier', {
  label: 'Scale color',
  min: 0,
  max: 100,
  step: 1
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
}