export const initVisualizationTab = (tab, guiActions) => {


// Visualization controls
const visualizationFolder = tab.pages[2].addFolder({title: 'Visualization'});
const scalesFolder = tab.pages[2].addFolder({title: 'Mesh rendering'});
// More descriptive naming
const visualSettings = {
  bacteria: true,
  mesh: true,
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
});

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

const meshHeightScaleBinding = scalesFolder.addBinding(MeshScalesSettings, 'meshHeightScale', {
  label: 'Mesh Height Scale',
  min: 0,
  max: 60,
  step: 1
});
const meshTranslationZBinding = scalesFolder.addBinding(MeshScalesSettings, 'meshTranslationZ', {
  label: 'Mesh offset',
  min: -50,
  max: 30,
  step: 1
});
const colorMultiplierBinding = scalesFolder.addBinding(MeshScalesSettings, 'colorMultiplier', {
  label: 'Color Multiplier',
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