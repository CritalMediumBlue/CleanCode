

function simplifiedInheritancePhenotype(phenotypes,phenotypeMemo, ID, parentID) {
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


function inheritancePhenotype(state, phenotypes,phenotypeMemo,ID, localConcentration) {
    // If phenotype already determined, use transition rules
    if (phenotypeMemo.get(ID) !== undefined) {
        const phenotype = determineTransitionPhenotype(state, phenotypes, phenotypeMemo, ID, localConcentration);
        return phenotype;
    }  else if (phenotypeMemo.get(ID) === undefined) {
        const phenotype = Math.random() < 0.5 ? phenotypes.MAGENTA : phenotypes.CYAN;
        return phenotype;
    }
}


function determineTransitionPhenotype(state,phenotypes,phenotypeMemo, ID, localConcentration) {
    
    
    // Calculate transition rates based on feedback type
    let K_c2m, K_m2c; // Transition rates: cyan-to-magenta and magenta-to-cyan
    
    if (state.config.BACTERIUM.POSITIVE_FEEDBACK) {
        K_c2m =  localConcentration * state.signal;
        K_m2c =  state.signal/(localConcentration+1);
    } else {
        K_c2m = state.signal/(localConcentration+1);
        K_m2c =  localConcentration * state.signal;
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


export function determinePhenotype(state,phenotypes,phenotypeMemo, ID, parentID, localConcentration) {
     
    const phenotype = parentID === undefined 
        ? inheritancePhenotype(state, phenotypes,phenotypeMemo,ID, localConcentration) 
        : simplifiedInheritancePhenotype( phenotypes, phenotypeMemo,ID, parentID);
    
    return phenotype;
}



