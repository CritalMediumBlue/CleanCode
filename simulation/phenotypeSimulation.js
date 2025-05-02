import { countNeighbors, buildGrid } from './grid.js'; 
import {simplifiedInheritancePhenotype} from './phenotypeSimRealData.js';

function inheritancePhenotype(phenotypeManager, ID, localConcentration) {
    const { phenotypeMemo, phenotypes } = phenotypeManager;
    
    // If phenotype already determined, use transition rules
    if (phenotypeMemo.get(ID) !== undefined) {
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
        const originalPhenotype = phenotypeMemo.get(ID);
        if (originalPhenotype === phenotypes.MAGENTA) {
            return rand < K_m2c ? phenotypes.CYAN : phenotypes.MAGENTA;
        } else {
            return rand < K_c2m ? phenotypes.MAGENTA : phenotypes.CYAN;
        }
    }  else if (phenotypeMemo.get(ID) === undefined) {
        return Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
    }
}


export function processBacteria(currentBacteria, concentrations,phenotypeManager,HEIGHT,WIDTH) {
    buildGrid(currentBacteria);

    const bacteriaDataUpdated = [];
    currentBacteria.forEach((bacterium) => {
            
        const { x, y, longAxis, angle, ID, parent, randomSwitch } = bacterium;
        
        const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
        const localConcentration = concentrations[idx] || 0;

        if (!phenotypeManager.phenotypeMemo.has(ID)) {
            phenotypeManager.phenotypeMemo.set(ID, phenotypeManager.phenotypeMemo.get(ID/2n));
        }

        let phenotype =  phenotypeManager.phenotypeMemo.get(ID); // this could be undefined
        if (!randomSwitch) {
            phenotype = parent === undefined 
                    ? inheritancePhenotype(phenotypeManager, ID, localConcentration) 
                    : simplifiedInheritancePhenotype(phenotypeManager, ID, parent);
            phenotypeManager.phenotypeMemo.set(ID, phenotype);  // This is not undefined
        } else if (randomSwitch) {
            phenotype = phenotype === phenotypeManager.phenotypes.MAGENTA ? phenotypeManager.phenotypes.CYAN : phenotypeManager.phenotypes.MAGENTA;
            phenotypeManager.phenotypeMemo.set(ID, phenotype);
        }

        const [totalNeighbors, magentaNeighbors, cyanNeighbors] = countNeighbors(x, y, phenotypeManager);
        const magentaProportion = magentaNeighbors / totalNeighbors;
        const cyanProportion = cyanNeighbors / totalNeighbors;
        const similarity = phenotype === phenotypeManager.phenotypes.MAGENTA 
            ? magentaProportion 
            : cyanProportion;
        
        const updatedBacterium = {
            id:ID,
            x:x,
            y:y,
            angle:angle,
            longAxis:longAxis,
            phenotype:phenotype,
            similarity,
        };

        bacteriaDataUpdated.push(updatedBacterium);
    });
    return bacteriaDataUpdated;
}

