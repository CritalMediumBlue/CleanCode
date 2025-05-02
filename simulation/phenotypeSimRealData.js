export function simplifiedInheritancePhenotype(phenotypeManager, ID, parentID) {
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
