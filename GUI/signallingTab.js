export const initSignallingTab = (tab, guiActions) => {
  // Signalling controls
  const equations = tab.pages[1].addFolder({ title: 'Equations' });
  tab.pages[1].addBlade({ view: 'separator' });
  tab.pages[1].addBlade({ view: 'separator' });

const options = [
  { text: 'Continuous', value: 'CONT' },
  { text: 'Discrete', value: 'DISC' },
  { text: 'Modular', value: 'MOD' },
]

 
const blade = equations.addBlade({
  view: 'list',
  label: 'Signalling configuration',
  options: options,
  value: 'DEF',
});
  


}; 