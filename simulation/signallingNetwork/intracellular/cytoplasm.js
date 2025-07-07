export const updateAllCytoplasms = (currentBacteria, positionMap, timeLapse, step) =>
{
let cytoplasmConcentrations;
            //One web Worker can handle this loop
            currentBacteria.forEach(bacterium => {
                const { id } = bacterium;
                const idx = positionMap.get(id);
               cytoplasmConcentrations = step(id, timeLapse, idx);
            });
    
            return cytoplasmConcentrations
    
}