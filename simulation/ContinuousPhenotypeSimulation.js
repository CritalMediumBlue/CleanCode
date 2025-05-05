import { countNeighbors, buildGrid } from './grid.js'; 

function inheritanceConcentration(cytoplasmManager, ID, localConcentration) {
    const {pConcentrationMemo, rConcentrationMemo,signal} = cytoplasmManager;
    const originalConcentrationP = pConcentrationMemo.get(ID);
    const originalConcentrationR = rConcentrationMemo.get(ID);
    const rand1 = Math.random();
    const rand2 = Math.random();

    if (originalConcentrationP !== undefined && originalConcentrationR !== undefined) {
        
        
     

        return {
            p: originalConcentrationP + (rand1-0.5)*0.01,
            r: originalConcentrationR + (rand2-0.5)*0.01
        }
        

    }  else if (originalConcentrationP === undefined || originalConcentrationR === undefined) {

        return {
            p: rand1,
            r: rand2
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
       
        
        cytoplasmConcentrations = inheritanceConcentration(cytoplasmManager, ID, localConcentration) 


        cytoplasmManager.pConcentrationMemo.set(ID, cytoplasmConcentrations.p);
        cytoplasmManager.rConcentrationMemo.set(ID, cytoplasmConcentrations.r);
        

     
        
        // Return bacterium with phenotype
        return {
            id: ID,
            x: x,
            y: y,
            angle: angle,
            longAxis: longAxis,
            pConcentration: cytoplasmConcentrations.p,
            rConcentration: cytoplasmConcentrations.r,
        };
    });
    
    return bacteriaWithConcentrations;
}



export const calculateCorrelations = (bacteriaWithConcentrations,cytoplasmManager) => {
    return 0
}