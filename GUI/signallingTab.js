export const initSignallingTab = (tab, guiActions) => {
// Signalling controls
const equations = tab.pages[1].addFolder({title: 'Equations'});
const intracellular = tab.pages[1].addFolder({title: 'Cytoplasm params'});
const extracellular = tab.pages[1].addFolder({title: 'Extracellular params'});

const loadEquations = equations.addButton({title: '📂',label:"Load Equations"});

const sliderK1 = intracellular.addBlade({view: 'slider',label: 'k1',min: 0,max: 1,value: 0.5});
const sliderK2 = intracellular.addBlade({view: 'slider',label: 'k2',min: 0,max: 1,value: 0.5});
const diffusionCoefficient = extracellular.addBlade({view: 'slider',label: 'Diff Coeff',min: 0,max: 1,value: 0.5});
const kout = extracellular.addBlade({view: 'slider',label: 'kout',min: 0,max: 1,value: 0.5    });
const Kin = extracellular.addBlade({view: 'slider',label: 'Kin',min: 0,max: 1,value: 0.5});


}