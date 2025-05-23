import { getAdjustedCoordinates } from "./grid.js";

function inheritanceConcentration(cytoplasmManager, ID, localConcentration, timeLapse) {
    const {pConcentrationMemo, rConcentrationMemo,signal} = cytoplasmManager;
    const originalConcentrationP = pConcentrationMemo.get(ID);
    const originalConcentrationR = rConcentrationMemo.get(ID);
    
    const Kin = 0.21;   //0.316 is the default
    const Ksyn = 0.3;    //0.4 is the default
    const Kp = 0.05;
    const Kr = 0.4;    //0.4 is the default. Try 0.5
    const Kon = 0.35;
    const DilutionRate = 0.06;

    if (originalConcentrationP !== undefined && originalConcentrationR !== undefined) {
        
        const deltaP = Kin*(localConcentration)/(Kp+localConcentration)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationP;//+(Math.random() - 0.5)*0.02;
        
        const deltaR = Ksyn*(originalConcentrationR)/(Kr+originalConcentrationR)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationR;//+(Math.random() - 0.5)*0.02;


        let finalConcentrationP = originalConcentrationP + deltaP*timeLapse*0.25;
        let finalConcentrationR = originalConcentrationR + deltaR*timeLapse*0.25;

        if (finalConcentrationP < 1e-10) {
            finalConcentrationP = 1e-10;
        }
        if (finalConcentrationR < 1e-10) {
            finalConcentrationR = 1e-10;
        }

        return {
            p: finalConcentrationP,
            r: finalConcentrationR
        }
        

    }  else if (originalConcentrationP === undefined || originalConcentrationR === undefined) {

        return {
            p: 1.13,
            r: 0.26
        }
    }
}

export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, cytoplasmManager,HEIGHT,WIDTH, timeLapse) => {
    const concentrations = concentrationsState.concentrationField;

    const bacteriaWithConcentrations = currentBacteria.map((bacterium) => {
        const { x, y, longAxis, angle, ID } = bacterium;
        
        const adjustedCoords = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        const idx = adjustedCoords.idx;
        const localConcentration = concentrations[idx] || 0;

        // Check if ID already exists in memo
        if (!cytoplasmManager.pConcentrationMemo.has(ID) || !cytoplasmManager.rConcentrationMemo.has(ID)) {
            cytoplasmManager.pConcentrationMemo.set(ID, cytoplasmManager.pConcentrationMemo.get(ID/2n));
            cytoplasmManager.rConcentrationMemo.set(ID, cytoplasmManager.rConcentrationMemo.get(ID/2n));
        }
       
        const cytoplasmConcentrations = inheritanceConcentration(cytoplasmManager, ID, localConcentration, timeLapse) 


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


