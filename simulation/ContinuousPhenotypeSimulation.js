 
    const Kin = 0.20;   
    const Ksyn = 0.3;    
    const Kp = 0.06;
    const Kr = 0.4;    
    const Kon = 0.34;
    const DilutionRate = 0.0625;


function simulateConcentration(cytoplasmManager, ID, localConcentration, timeLapse, parsedEquations) {
    const {pConcentrationMemo, rConcentrationMemo} = cytoplasmManager;
    const originalConcentrationP = pConcentrationMemo.get(ID);
    const originalConcentrationR = rConcentrationMemo.get(ID);
   

    if (originalConcentrationP !== undefined && originalConcentrationR !== undefined) {
        
        const deltaP = Kin*(localConcentration)/(Kp+localConcentration)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationP;
        
        const deltaR = Ksyn*(originalConcentrationR)/(Kr+originalConcentrationR)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationR;


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

export const updateBacteriaCytoplasm = (currentBacteria, concentrationsState, cytoplasmManager, HEIGHT, WIDTH, timeLapse, parsedEquations) => {
    const concentrations = concentrationsState.concentrationField;
    const { pConcentrationMemo, rConcentrationMemo } = cytoplasmManager;
    const sourcesArray = concentrationsState.sources;
    const sinksArray = concentrationsState.sinks;
    
    // Initialize sources and sinks arrays first
    sourcesArray.fill(0);
    sinksArray.fill(0);
    
    // Define constants upfront
    const Kout = 4 * timeLapse;  
    const Kin = 2 * timeLapse;   
    const Kp = 0.1;
    const Kr = 0.6;
    
    const bacteriaCount = currentBacteria.length;
    const resultArray = new Array(bacteriaCount);
    
    for (let i = 0; i < bacteriaCount; i++) {
        const bacterium = currentBacteria[i];
        const { x, y, longAxis, angle, ID } = bacterium;
        
        // Process 1: Update cytoplasm concentrations
        const adjustedCoords = getAdjustedCoordinates(x, y, HEIGHT, WIDTH);
        const idx = adjustedCoords.idx;
        const localConcentration = concentrations[idx] || 0;

        // Check if ID already exists in memo
        if (!pConcentrationMemo.has(ID) || !rConcentrationMemo.has(ID)) {
            pConcentrationMemo.set(ID, pConcentrationMemo.get(ID/2n));
            rConcentrationMemo.set(ID, rConcentrationMemo.get(ID/2n));
        }
       
        const cytoplasmConcentrations = simulateConcentration(
            cytoplasmManager, ID, localConcentration, timeLapse, parsedEquations
        );
        
        pConcentrationMemo.set(ID, cytoplasmConcentrations.p);
        rConcentrationMemo.set(ID, cytoplasmConcentrations.r);
        
        const rConcentration = cytoplasmConcentrations.r; 
        
        const krPlusR = Kr + rConcentration;
        const kpPlusLocal = Kp + localConcentration;
        
        sourcesArray[idx] += Kout * (rConcentration / krPlusR); 
        sinksArray[idx] += Kin * (localConcentration / kpPlusLocal);
        
        // Assign to pre-allocated array
        resultArray[i] = {
            id: ID,
            x,
            y,
            angle,
            longAxis,
            phenotype: "avigdor",
            cytoplasmConcentrations
        };
    }
    
    return resultArray;
}

