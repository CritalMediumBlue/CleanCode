import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { initSignallingTab } from './signallingTab.js';
import { initSessionTab } from './sessionTab.js';
import { initVisualizationTab } from './visualizationTab.js';



export const initGUI =  (guiActions) => {
const pane = new Pane({ title:"control", container: document.getElementById('pane'),});

const tab = pane.addTab({pages: [{title: 'State'},{title: 'Equations'},{title: 'Visualization'}]});
initSessionTab(tab, guiActions);
initSignallingTab(tab, guiActions);
initVisualizationTab(tab, guiActions);
}


