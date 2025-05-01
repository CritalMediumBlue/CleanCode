/**
 * @fileoverview Manages the diffusion of chemical signals in the bacterial simulation.
 * This module handles the creation and updating of concentration fields, including
 * the positioning of sources and sinks based on bacteria phenotypes and locations.
 */

import { ADI } from './diffusion.js';

/**
 * Performs a complete diffusion step by updating sources and sinks, then running the diffusion calculation.
 * 
 * @param {Array} currentBacteria - Array of bacteria objects in the current time step
 * @param {Object} concentrationState - Object containing concentration field and source/sink arrays
 * @param {Object} appConfig - Configuration object containing grid settings
 * @param {Set} currentBacteriaSet - Set of current bacteria IDs
 * @param {Map} phenotypeMemo - Map of bacteria IDs to their phenotypes
 * @param {Object} phenotypes - Object containing phenotype constants
 * @returns {Array} - Result of the diffusion calculation
 */
export function diffusionStep(currentBacteria, concentrationState, appConfig, currentBacteriaIds, phenotypeMemo, phenotypes) {
    const GRID = appConfig.GRID;
    const IDsByColor = getIDsByColor(currentBacteriaIds, phenotypeMemo, phenotypes);
    updateSourcesAndSinks(currentBacteria, concentrationState, ...IDsByColor, GRID);
    
    const result = diffuse(
        appConfig,
        concentrationState,
        1, // Time step duration in minutes (dt)
        1  // Number of substeps for ADI
    );
    
    concentrationState.concentrationField = result[0];
    return result;
}

/**
 * Helper function to retrieve IDs of bacteria grouped by phenotype color.
 * 
 * @param {Set} currentBacteriaSet - Set of current bacteria IDs
 * @param {Map} phenotypeMemo - Map of bacteria IDs to their phenotypes
 * @param {Object} phenotypes - Object containing phenotype constants
 * @returns {Array} - Array containing arrays of magenta and cyan bacteria IDs
 */
export function getIDsByColor(currentBacteriaIds, phenotypeMemo, phenotypes) {
    const magentaIDs = [];
    const cyanIDs = [];

    currentBacteriaIds.forEach((ID) => {
        const phenotype = phenotypeMemo.get(ID);
        
        if (phenotype === phenotypes.MAGENTA) {
            magentaIDs.push(ID);
        } else if (phenotype === phenotypes.CYAN) {
            cyanIDs.push(ID);
        }
    });

    return [magentaIDs, cyanIDs];
}

/**
 * Updates the sources and sinks arrays based on bacteria positions and phenotypes.
 * 
 * @param {Array} currentBacteria - Array of bacteria objects
 * @param {Object} concentrationState - Object containing concentration field and source/sink arrays
 * @param {Array} magentaIDsRaw - Array of IDs for magenta phenotype bacteria
 * @param {Array} cyanIDsRaw - Array of IDs for cyan phenotype bacteria
 * @param {Object} GRID - Grid configuration object
 */
export function updateSourcesAndSinks(currentBacteria, concentrationState, magentaIDsRaw, cyanIDsRaw, GRID) {
    const MagentaIDs = new Set(magentaIDsRaw);
    const CyanIDs = new Set(cyanIDsRaw);

    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);

    // Iterate through each bacterium in the current time step
    for (const bacterium of currentBacteria) {
        // Convert bacterium's position to grid coordinates and index using GRID
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID);

        // Skip if the bacterium is outside the valid grid area
        if (!coords) {
            console.warn(`Bacterium ${bacterium.ID} is out of bounds `);
            continue;
        }

        // Increment source count if the bacterium is Magenta
        if (MagentaIDs.has(bacterium.ID)) {
            concentrationState.sources[coords.idx] += 1; // Simple count for now
        }

        // Increment sink count if the bacterium is Cyan
        if (CyanIDs.has(bacterium.ID)) {
            concentrationState.sinks[coords.idx] += 1; // Simple count for now
        }
    }
}

/**
 * Converts bacterium coordinates to adjusted grid coordinates and calculates the 1D index.
 * 
 * @param {number} x - X coordinate of the bacterium
 * @param {number} y - Y coordinate of the bacterium
 * @param {Object} grid - Grid configuration object
 * @returns {Object|null} - Object containing adjusted coordinates and 1D index, or null if out of bounds
 */
export function getAdjustedCoordinates(x, y, grid) {
    // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
    let adjustedX = Math.round(x + grid.WIDTH / 2);
    let adjustedY = Math.round(y + grid.HEIGHT / 2);
  
    // Skip bacteria below the grid's bottom edge.
    if (adjustedY <= 0) {
        return null;
    }
  
    // Clamp coordinates to valid grid boundaries (leaving a 1-cell border).
    adjustedY = Math.min(adjustedY, grid.HEIGHT - 2); 
    adjustedX = Math.max(1, Math.min(adjustedX, grid.WIDTH - 2));
  
    // Calculate the 1D index corresponding to the 2D grid coordinates.
    const idx = adjustedY * grid.WIDTH + adjustedX;
  
    return { x: adjustedX, y: adjustedY, idx };
}

/**
 * Wrapper for the ADI diffusion calculation that prepares parameters from app configuration.
 * 
 * @param {Object} appConfig - Configuration object containing grid settings
 * @param {Object} concentrationState - Object containing concentration field and source/sink arrays
 * @param {number} timeStep - Time step duration in minutes
 * @param {number} subSteps - Number of substeps for ADI
 * @returns {Array} - Array containing the updated concentration field
 */
export function diffuse(
    appConfig,
    concentrationState,
    timeStep,
    subSteps
) {
    const WIDTH = appConfig.GRID.WIDTH;
    const HEIGHT = appConfig.GRID.HEIGHT;
    const DIFFUSION_RATE = appConfig.GRID.DIFFUSION_RATE;
    const currentConcentrationData = concentrationState.concentrationField;
    const nextConcentrationData = concentrationState.concentrationField;
    const sources = concentrationState.sources;
    const sinks = concentrationState.sinks;
    
    return ADI(
        WIDTH, HEIGHT,
        currentConcentrationData, nextConcentrationData, // Input concentration arrays
        sources, sinks, // Input source/sink arrays
        DIFFUSION_RATE, // Diffusion coefficient
        timeStep, // Time step duration in minutes (dt)
        subSteps // Number of substeps for ADI
    );
}