import { countNeighbors, buildGrid } from './grid.js'; 
import {simplifiedInheritancePhenotype} from './phenotypeSimRealData.js';

function inheritancePhenotype(phenotypeManager, ID, localConcentration) {
    const { phenotypeMemo, phenotypes } = phenotypeManager;
    const originalPhenotype = phenotypeMemo.get(ID);

    // If phenotype already determined, use transition rules
    if (originalPhenotype !== undefined) {
        const {config, signal } = phenotypeManager;
        
        // Calculate transition rates based on feedback type
        let K_c2m, K_m2c; // Transition rates: cyan-to-magenta and magenta-to-cyan
        
        if (config.BACTERIUM.POSITIVE_FEEDBACK) {
            K_c2m =  localConcentration * signal;
            K_m2c =  signal/(localConcentration+1);
        } else {
            K_c2m = signal/(localConcentration+1);
            K_m2c =  localConcentration * signal;
        }
        
        const rand = Math.random();
        if (originalPhenotype === phenotypes.MAGENTA) {
            return rand < K_m2c ? phenotypes.CYAN : phenotypes.MAGENTA;
        } else if (originalPhenotype === phenotypes.CYAN) {
            return rand < K_c2m ? phenotypes.MAGENTA : phenotypes.CYAN;
        }
    }  else if (originalPhenotype === undefined) {
        return Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
    }
}

/**
 * Determines the phenotype for each bacterium based on inheritance and environmental factors
 * @param {Array} currentBacteria - Array of bacteria objects from the current time step
 * @param {Float32Array} concentrations - Array of concentration values across the grid
 * @param {Object} phenotypeManager - Manager containing phenotype data and rules
 * @param {number} HEIGHT - Height of the grid
 * @param {number} WIDTH - Width of the grid
 * @returns {Array} - Array of bacteria with updated phenotypes
 */
export function updateBacteriaPhenotypes(currentBacteria, concentrations, phenotypeManager, HEIGHT, WIDTH,changed) {
    buildGrid(currentBacteria);

    const bacteriaWithPhenotypes = currentBacteria.map((bacterium) => {
        const { x, y, longAxis, angle, ID, parent, randomSwitch } = bacterium;
        
        const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
        const localConcentration = concentrations[idx] || 0;

        // Check if phenotype already exists in memo
        if (!phenotypeManager.phenotypeMemo.has(ID)) {
            phenotypeManager.phenotypeMemo.set(ID, phenotypeManager.phenotypeMemo.get(ID/2n));
        }
        let phenotype = phenotypeManager.phenotypeMemo.get(ID); // this could be undefined
        const originalPhenotype = phenotype;

        if (!randomSwitch) {
            phenotype = parent === undefined 
                ? inheritancePhenotype(phenotypeManager, ID, localConcentration) 
                : simplifiedInheritancePhenotype(phenotypeManager, ID, parent);
            phenotypeManager.phenotypeMemo.set(ID, phenotype);
        } else if (randomSwitch) {
            phenotype = phenotype === phenotypeManager.phenotypes.MAGENTA ? 
                phenotypeManager.phenotypes.CYAN : 
                phenotypeManager.phenotypes.MAGENTA;
            phenotypeManager.phenotypeMemo.set(ID, phenotype);
        }

        if (phenotype !== originalPhenotype) {
            changed.set(ID, 1);
        } else if (changed.has(ID)) {
            changed.set(ID, changed.get(ID) * 0.5);
        } else {
            changed.set(ID, 0);
        }
        
        // Return bacterium with phenotype
        return {
            id: ID,
            x: x,
            y: y,
            angle: angle,
            longAxis: longAxis,
            phenotype: phenotype,
            changed: changed.get(ID),
        };
    });
    
    return bacteriaWithPhenotypes;
}

/**
 * Calculates similarity metrics for each bacterium based on its spatial relationships
 * @param {Array} bacteriaWithPhenotypes - Array of bacteria with their phenotypes assigned
 * @param {Object} phenotypeManager - Manager containing phenotype data
 * @returns {Array} - Array of bacteria with phenotypes and similarity metrics
 */
export function calculateSimilarities(bacteriaWithPhenotypes, phenotypeManager) {
    return bacteriaWithPhenotypes.map(bacterium => {
        const { x, y, phenotype } = bacterium;
        
        const [totalNeighbors, magentaNeighbors, cyanNeighbors] = countNeighbors(x, y, phenotypeManager);
        
        const magentaProportion = magentaNeighbors / totalNeighbors;
        const cyanProportion = cyanNeighbors / totalNeighbors;
        const similarity = phenotype === phenotypeManager.phenotypes.MAGENTA 
            ? magentaProportion 
            : cyanProportion;
        
        return {
            ...bacterium,
            similarity
        };
    });
}

