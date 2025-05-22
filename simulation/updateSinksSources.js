import { getAdjustedCoordinates } from './grid.js';


export const updateSinksAndSources = (currentBacteria, concentrationState, GRID, cytoplasmManager, timeLapse) => {
    
    concentrationState.sources.fill(0);
    concentrationState.sinks.fill(0);
    const Kout = 4*timeLapse;  //4 is the maximum for stable diffusion
    const Kin = 2*timeLapse;  //2 is the maximum for stable diffusion
    const Kp = 0.1;
    const Kr = 0.6;
    for (const bacterium of currentBacteria) {
        const { ID } = bacterium;
        const rConcentration = cytoplasmManager.rConcentrationMemo.get(ID);
        const coords = getAdjustedCoordinates(bacterium.x, bacterium.y, GRID.HEIGHT, GRID.WIDTH);
        const localConcentration = concentrationState.concentrationField[coords.idx];
        
        const michaelisMR = rConcentration/(Kr+rConcentration);
        
        const michaelisMP = localConcentration/(Kp+localConcentration);

        concentrationState.sources[coords.idx] += Kout*michaelisMR; 
        concentrationState.sinks[coords.idx] += Kin*michaelisMP;
    }
}

