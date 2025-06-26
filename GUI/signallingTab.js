export const initSignallingTab = (tab, guiActions) => {
  // Signalling controls
  const equations = tab.pages[1].addFolder({ title: 'Equations' });
  tab.pages[1].addBlade({ view: 'separator' });
  tab.pages[1].addBlade({ view: 'separator' });

const options = [
  { text: 'Default', value: 'DEFA' },
  { text: 'Arbitrium', value: 'ARBI' },
  { text: 'SinI/SinR', value: 'SINI' },
  { text: 'Sporulation', value: 'SPOR' },
  { text: 'Quorum Sensing', value: 'QUOR' }
];

const blade = equations.addBlade({
  view: 'list',
  label: 'Signalling circuit',
  options: options,
  value: 'DEFA',
});

blade.on('change', (ev) => {
  console.log('Selected:', ev.value);
  guiActions.setSignallingCircuit(ev.value);
});


}; 