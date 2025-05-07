import { buildGrid } from './grid.js'; 


function inheritanceConcentration(cytoplasmManager, ID, localConcentration) {
    const {pConcentrationMemo, rConcentrationMemo,signal} = cytoplasmManager;
    const originalConcentrationP = pConcentrationMemo.get(ID);
    const originalConcentrationR = rConcentrationMemo.get(ID);
    
    const Kin = 1;
    const Ksyn = 1;
    const Kp = 0.1;
    const Kr = 1;
    const Kon = 0.1;
    const DilutionRate = 0.05;

    if (originalConcentrationP !== undefined && originalConcentrationR !== undefined) {
        
        const deltaP = Kin*(localConcentration)/(Kp+localConcentration)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationP;
        
        const deltaR = Ksyn*(originalConcentrationR)/(Kr+originalConcentrationR)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationR;


     

        return {
            p: originalConcentrationP + deltaP,
            r: originalConcentrationR + deltaR
        }
        

    }  else if (originalConcentrationP === undefined || originalConcentrationR === undefined) {

        return {
            p: 0,
            r: 1
        }
    }
}

export const updateBacteriaCytoplasm = (currentBacteria, concentrations, cytoplasmManager,HEIGHT,WIDTH) => {
    buildGrid(currentBacteria);

    const bacteriaWithConcentrations = currentBacteria.map((bacterium) => {
        const { x, y, longAxis, angle, ID, parent } = bacterium;
        
        const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
        const localConcentration = concentrations[idx] || 0;

        // Check if ID already exists in memo
        if (!cytoplasmManager.pConcentrationMemo.has(ID) || !cytoplasmManager.rConcentrationMemo.has(ID)) {
            cytoplasmManager.pConcentrationMemo.set(ID, cytoplasmManager.pConcentrationMemo.get(ID/2n));
            cytoplasmManager.rConcentrationMemo.set(ID, cytoplasmManager.rConcentrationMemo.get(ID/2n));
        }
       
        
        const cytoplasmConcentrations = inheritanceConcentration(cytoplasmManager, ID, localConcentration) 


        cytoplasmManager.pConcentrationMemo.set(ID, cytoplasmConcentrations.p);
        cytoplasmManager.rConcentrationMemo.set(ID, cytoplasmConcentrations.r);
        

        
        
        // Return bacterium with phenotype
        return {
            id: ID,
            x: x,
            y: y,
            angle: angle,
            longAxis: longAxis,
            phenotype: "continuous",
            cytoplasmConcentrations
        };
    });
    
    return bacteriaWithConcentrations;
}



export const calculateCorrelations = (bacteriaWithConcentrations,cytoplasmManager) => {
    return bacteriaWithConcentrations
}