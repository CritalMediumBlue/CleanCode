import { getAdjustedCoordinates } from "./grid.js";
 
    const Kin = 0.20;   //0.316 is the default
    const Ksyn = 0.3;    //0.4 is the default
    const Kp = 0.06;
    const Kr = 0.4;    //0.4 is the default. Try 0.5
    const Kon = 0.34;
    const DilutionRate = 0.0625;


function inheritanceConcentration(cytoplasmManager, ID, localConcentration, timeLapse) {
    const {pConcentrationMemo, rConcentrationMemo,signal} = cytoplasmManager;
    const originalConcentrationP = pConcentrationMemo.get(ID);
    const originalConcentrationR = rConcentrationMemo.get(ID);
   

    if (originalConcentrationP !== undefined && originalConcentrationR !== undefined) {
        
        const deltaP = Kin*(localConcentration)/(Kp+localConcentration)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationP;//+(Math.random() - 0.5)*0.02;
        
        const deltaR = Ksyn*(originalConcentrationR)/(Kr+originalConcentrationR)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationR;//+(Math.random() - 0.5)*0.02;


        let finalConcentrationP = originalConcentrationP + deltaP*timeLapse*0.2;
        let finalConcentrationR = originalConcentrationR + deltaR*timeLapse*0.2;

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
    const { pConcentrationMemo, rConcentrationMemo } = cytoplasmManager;

    const bacteriaWithConcentrations = currentBacteria.map((bacterium) => {
        const { x, y, longAxis, angle, ID } = bacterium;
        
        const adjustedCoords = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        const idx = adjustedCoords.idx;
        const localConcentration = concentrations[idx] || 0;

        // Check if ID already exists in memo
        if (!pConcentrationMemo.has(ID) || !rConcentrationMemo.has(ID)) {
            pConcentrationMemo.set(ID, pConcentrationMemo.get(ID/2n));
            rConcentrationMemo.set(ID, rConcentrationMemo.get(ID/2n));
        }
       
        const cytoplasmConcentrations = inheritanceConcentration(cytoplasmManager, ID, localConcentration, timeLapse) 


        pConcentrationMemo.set(ID, cytoplasmConcentrations.p);
        rConcentrationMemo.set(ID, cytoplasmConcentrations.r);
        
        // Return bacterium with phenotype
        return {
            id: ID,
            x,
            y,
            angle,
            longAxis,
            phenotype: "continuous",
            cytoplasmConcentrations
        };
    });
    
    return bacteriaWithConcentrations;
}


