// Shared state module for cytoplasm functionality
// This module contains all shared state that both initializer and updater modules need

export const variables = {};
export const parameters = {};
export const interiorManager = {};
export const exteriorManager = {};
export const intSpeciesNames = [];
export const extSpeciesNames = [];
export const concentrationsState = {};

// Internal state (not exported directly)
let speciesNames = null;
let secretedSpecies = null;

// Getters and setters for internal state
export const getSpeciesNames = () => speciesNames;
export const getSecretedSpecies = () => secretedSpecies;
export const setSpeciesNames = (names) => { speciesNames = names; };
export const setSecretedSpecies = (species) => { secretedSpecies = species; };

// GUI Communication - Parameter modification
export const setParameter = (paramName, value) => {
    parameters[paramName] = value;
};
