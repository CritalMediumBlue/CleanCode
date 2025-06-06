import { getAdjustedCoordinates } from "./grid.js";
 
    const Kin = 0.20;   
    const Ksyn = 0.3;    
    const Kp = 0.06;
    const Kr = 0.4;    
    const Kon = 0.34;
    const DilutionRate = 0.0625;
    const Pv = 0.001; // Constant production rate of P
    const Ps = 0.5; // Constant production rate of P
    const kA = 0.65; // Constant for Haldane equation
    const kS = 0.01; // Constant for Haldane equation


function inheritanceConcentration(cytoplasmManager, ID, localConcentration, timeLapse) {
    const { rConcentrationMemo, iConcentrationMemo, lConcentrationMemo, aConcentrationMemo, pConcentrationMemo } = cytoplasmManager;
    const originalConcentrationP = pConcentrationMemo.get(ID);
    const originalConcentrationR = rConcentrationMemo.get(ID);
    const originalConcentrationI = iConcentrationMemo.get(ID);
    const originalConcentrationL = lConcentrationMemo.get(ID);
    const originalConcentrationA = aConcentrationMemo.get(ID);

   

    if (originalConcentrationP !== undefined && originalConcentrationR !== undefined) {
        
        /* const deltaA = Kin*(localConcentration)/(Kp+localConcentration)
        - Kon*originalConcentrationP*originalConcentrationR
        - DilutionRate*originalConcentrationP; */

        const haldane = (originalConcentrationP/kA) / (1 + (originalConcentrationP/kA) + (Math.pow(originalConcentrationP,4)/(kA*kS)));

        const deltaA = Pv + Ps*haldane - DilutionRate*originalConcentrationA

        const deltaP = originalConcentrationA*localConcentration - DilutionRate*originalConcentrationP;
        
        const deltaR = 0;

        const deltaI = 0;

        const deltaL = 0;

        


        let finalConcentrationA = originalConcentrationA + deltaA*timeLapse*0.2;
        let finalConcentrationR = originalConcentrationR + deltaR*timeLapse*0.2;
        let finalConcentrationI = originalConcentrationI + deltaI*timeLapse*0.2;
        let finalConcentrationL = originalConcentrationL + deltaL*timeLapse*0.2;
        let finalConcentrationP = originalConcentrationP + deltaP*timeLapse*0.2;

        if (finalConcentrationA < 1e-10) {
            finalConcentrationA = 1e-10;
        }
        if (finalConcentrationR < 1e-10) {
            finalConcentrationR = 1e-10;
        }
        if (finalConcentrationI < 1e-10) {
            finalConcentrationI = 1e-10;
        }
        if (finalConcentrationL < 1e-10) {
            finalConcentrationL = 1e-10;
        }
        if (finalConcentrationP < 1e-10) {
            finalConcentrationP = 1e-10;
        }

        return {
            p: finalConcentrationP,
            r: finalConcentrationR,
            i: finalConcentrationI,
            l: finalConcentrationL,
            a: finalConcentrationA
        }
        

    }  else if (originalConcentrationP === undefined || originalConcentrationR === undefined) {

        return {
            p: 1.13,
            r: 0.26,
            i: 0.1,
            l: 0.1,
            a: 0.1
        }
    }
}

const width = 100; // Assuming a grid width of 100
const height = 60; // Assuming a grid height of 60
const surfactinXField = new Float64Array(width * height); // Initialize surfactinXField with the grid size
const haldaneField = new Float64Array(width * height); // Initialize haldaneField with the grid size

for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
        const index = i + j * width;
        surfactinXField[index] =(height- j)* 0.01; // Example initialization, adjust as needed
        const localConcentration = surfactinXField[index];
        haldaneField[index] = Ps*(localConcentration/kA) / (1 + (localConcentration/kA) + (localConcentration*localConcentration/(kA*kS)));
    }
}



export const updateBacteriaCytoplasmSpo = (currentBacteria, concentrationsState, cytoplasmManager, HEIGHT, WIDTH, timeLapse) => {
    // Ensure surfactinXField is initialized only once
        
    //const concentrations = concentrationsState.concentrationField;
    //const concentrations = surfactinXField; // Using surfactinXField for concentrations
    //concentrationsState.concentrationField = haldaneField; // Update the concentration field with surfactinXField

    const { rConcentrationMemo, iConcentrationMemo, lConcentrationMemo, aConcentrationMemo, pConcentrationMemo } = cytoplasmManager;
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
        const localComX = surfactinXField[idx] || 0;

        // Check if ID already exists in memo
        if (!pConcentrationMemo.has(ID) || !rConcentrationMemo.has(ID)) {
            pConcentrationMemo.set(ID, pConcentrationMemo.get(ID/2n));
            rConcentrationMemo.set(ID, rConcentrationMemo.get(ID/2n));
            iConcentrationMemo.set(ID, iConcentrationMemo.get(ID/2n));
            lConcentrationMemo.set(ID, lConcentrationMemo.get(ID/2n));
            aConcentrationMemo.set(ID, aConcentrationMemo.get(ID/2n));
        }
       
        const cytoplasmConcentrations = inheritanceConcentration(
            cytoplasmManager, ID, localComX, timeLapse
        );
        
        pConcentrationMemo.set(ID, cytoplasmConcentrations.p);
        rConcentrationMemo.set(ID, cytoplasmConcentrations.r);
        iConcentrationMemo.set(ID, cytoplasmConcentrations.i);
        lConcentrationMemo.set(ID, cytoplasmConcentrations.l);
        aConcentrationMemo.set(ID, cytoplasmConcentrations.a);
        
        //const rConcentration = cytoplasmConcentrations.r; 
        
        //const krPlusR = Kr + rConcentration;
        //const kpPlusLocal = Kp + localConcentration;
        
        //sourcesArray[idx] += Kout * (rConcentration / krPlusR); 
        //sinksArray[idx] += Kin * (localConcentration / kpPlusLocal);
        
        // Assign to pre-allocated array
        resultArray[i] = {
            id: ID,
            x,
            y,
            angle,
            longAxis,
            phenotype: "Sporulation",
            cytoplasmConcentrations
        };
    }
    
    return resultArray;
}

