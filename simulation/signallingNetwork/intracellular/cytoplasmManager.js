
import { setModel, setParameter, extSpeciesNames, concentrationsState } from './cytoplasmState.js';
import { updateAllCytoplasms, calculateResultArray } from './cytoplasmUpdater.js';

export {
    // Initialization functions
    setModel,
    setParameter,
    
    // Runtime update functions
    updateAllCytoplasms,
    calculateResultArray,
    
    // Shared state objects
    extSpeciesNames,
    concentrationsState
};
