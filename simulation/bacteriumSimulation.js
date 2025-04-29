

function simplifiedInheritancePhenotype(state,phenotypes,phenotypeMemo, ID, parentID) {
    // Check if phenotype is already determined for this ID
    if (phenotypeMemo.has(ID)) {
        return phenotypeMemo.get(ID);
    }
    
    // Check if parent phenotype is available
    if (parentID !== undefined && phenotypeMemo.has(parentID)) {
        const phenotype = phenotypeMemo.get(parentID);
        phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }
    
    // Assign random phenotype if no inheritance information
    const phenotype = Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
    phenotypeMemo.set(ID, phenotype);
    return phenotype;
}


function inheritancePhenotype(state, phenotypes,phenotypeMemo,ID, neighbors, localConcentration) {
    // If phenotype already determined, use transition rules
    if (phenotypeMemo.has(ID)) {
        return determineTransitionPhenotype(state, phenotypes, phenotypeMemo, ID, neighbors, localConcentration);
    }
    
    // Handle parent inheritance for IDs > 2000
    if (ID > 2000n) {
        const parentID = ID / 2n;
        if (phenotypeMemo.has(parentID)) {
            const phenotype = phenotypeMemo.get(parentID);
            phenotypeMemo.set(ID, phenotype);
            return phenotype;
        }
    }
    
    // Handle initial bacteria (IDs 1000-2000)
    if (ID >= 1000n && ID <= 2000n) {
        const phenotype = Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
        phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }
    
    // Default case - should not reach here in normal operation
    return null;
}


function determineTransitionPhenotype(state,phenotypes,phenotypeMemo, ID, neighbors, localConcentration) {
    const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
    const proportionCyan = cyanNeighbors / totalNeighbors;
    const originalPhenotype = phenotypeMemo.get(ID);
    
    // Calculate transition rates based on feedback type
    let K_c2m, K_m2c; // Transition rates: cyan-to-magenta and magenta-to-cyan
    
    if (state.config.BACTERIUM.POSITIVE_FEEDBACK) {
        K_c2m = state.alpha + localConcentration * state.signal;
        K_m2c = state.alpha + proportionCyan * state.signal;
    } else {
        K_c2m = state.alpha + proportionCyan * state.signal;
        K_m2c = state.alpha + localConcentration * state.signal;
    }
    
    // Determine new phenotype based on transition probabilities
    const rand = Math.random();
    let phenotype;
    
    if (originalPhenotype === phenotypes.MAGENTA) {
        phenotype = rand < K_m2c ? phenotypes.CYAN : phenotypes.MAGENTA;
    } else {
        phenotype = rand < K_c2m ? phenotypes.MAGENTA : phenotypes.CYAN;
    }
    
    phenotypeMemo.set(ID, phenotype);
    return phenotype;
}


export function determinePhenotypeAndSimilarity(state,phenotypes,phenotypeMemo, ID, neighbors, parentID, localConcentration) {
    // Determine phenotype based on inheritance or neighbors
     
    const phenotype = parentID === undefined 
        ? inheritancePhenotype(state, phenotypes,phenotypeMemo,ID, neighbors, localConcentration) 
        : simplifiedInheritancePhenotype(state, phenotypes, phenotypeMemo,ID, parentID);
    
    // Calculate similarity with neighbors
    const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
    const magentaProportion = magentaNeighbors / totalNeighbors;
    const cyanProportion = cyanNeighbors / totalNeighbors;
    
    const similarity = phenotype === phenotypes.MAGENTA 
        ? magentaProportion 
        : cyanProportion;
    
    return {
        phenotype, 
        similarity, 
        magentaProportion, 
        cyanProportion
    };
}



