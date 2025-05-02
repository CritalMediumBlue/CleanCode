function simplifiedInheritancePhenotype(phenotypeManager, ID, parentID) {
    const { phenotypeMemo, phenotypes } = phenotypeManager;
    
    if (phenotypeMemo.has(ID)) {
        return phenotypeMemo.get(ID);
    } else if (phenotypeMemo.has(parentID)) {
        const phenotype = phenotypeMemo.get(parentID);
        phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }
    // Assign random phenotype if no inheritance information
    const phenotype = Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
    phenotypeMemo.set(ID, phenotype);
    return phenotype;
}


function inheritancePhenotype(phenotypeManager, ID, localConcentration) {
    const { phenotypeMemo, phenotypes } = phenotypeManager;
    
    // If phenotype already determined, use transition rules
    if (phenotypeMemo.get(ID) !== undefined) {
        const phenotype = determineTransitionPhenotype(phenotypeManager, ID, localConcentration);
        return phenotype;
    }  else if (phenotypeMemo.get(ID) === undefined) {
        const phenotype = Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
        return phenotype;
    }
}


function determineTransitionPhenotype(phenotypeManager, ID, localConcentration) {
    const { phenotypeMemo, phenotypes, config, signal } = phenotypeManager;
    
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
    let phenotype;
    const originalPhenotype = phenotypeMemo.get(ID);
    if (originalPhenotype === phenotypes.MAGENTA) {
        phenotype = rand < K_m2c ? phenotypes.CYAN : phenotypes.MAGENTA;
    } else {
        phenotype = rand < K_c2m ? phenotypes.MAGENTA : phenotypes.CYAN;
    }
    return phenotype;
}


function determinePhenotype(phenotypeManager, ID, parentID, localConcentration) {
    const phenotype = parentID === undefined 
        ? inheritancePhenotype(phenotypeManager, ID, localConcentration) 
        : simplifiedInheritancePhenotype(phenotypeManager, ID, parentID);
    
    return phenotype;
}


export function processBacteria(currentBacteria, concentrations,phenotypeManager,HEIGHT,WIDTH,countNeighbors) {
    const bacteriaDataUpdated = [];
    currentBacteria.forEach((bacterium) => {
            
        const { x, y, longAxis, angle, ID, parent, randomSwitch } = bacterium;
        
        const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
        const localConcentration = concentrations[idx] || 0;

        if (!phenotypeManager.phenotypeMemo.has(ID)) {
            phenotypeManager.phenotypeMemo.set(ID, phenotypeManager.phenotypeMemo.get(ID/2n));
        }

        let phenotype =  phenotypeManager.phenotypeMemo.get(ID);
        if (!randomSwitch) {
            phenotype = determinePhenotype(
                phenotypeManager, ID, parent, localConcentration
            );
            phenotypeManager.phenotypeMemo.set(ID, phenotype);
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
            magentaProportion,
            cyanProportion,
            similarity,
        };

        bacteriaDataUpdated.push(updatedBacterium);
    });
    return bacteriaDataUpdated;
}

