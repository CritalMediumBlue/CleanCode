export const initSignallingTab = (tab, guiActions) => {
  // Signalling controls
  const equations = tab.pages[1].addFolder({ title: 'Equations' });
  tab.pages[1].addBlade({ view: 'separator' });
  tab.pages[1].addBlade({ view: 'separator' });
  const loadEquButton = stateFolder.addButton({title: '📂',label:"Load equations"});

}; 