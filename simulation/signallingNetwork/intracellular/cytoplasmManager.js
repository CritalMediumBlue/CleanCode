/**
 * Cytoplasm Manager - Facade Module
 * 
 * This module serves as a single point of entry for all cytoplasm-related functionality.
 * It provides a clean, unified interface while maintaining the internal modular structure.
 * 
 * External modules should import from this file rather than directly from the internal modules.
 */

// Import from internal modules
import { setModel, setParameter } from './cytoplasmInitializer.js';
import { updateAllCytoplasms, calculateResultArray } from './cytoplasmUpdater.js';
import { 
    variables, 
    parameters, 
    interiorManager, 
    exteriorManager, 
    intSpeciesNames, 
    extSpeciesNames, 
    concentrationsState 
} from './cytoplasmState.js';

// Re-export all public functionality through a single interface
export {
    // Initialization functions
    setModel,
    setParameter,
    
    // Runtime update functions
    updateAllCytoplasms,
    calculateResultArray,
    
    // Shared state objects
    variables,
    parameters,
    interiorManager,
    exteriorManager,
    intSpeciesNames,
    extSpeciesNames,
    concentrationsState
};
