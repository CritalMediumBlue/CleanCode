import {
    determinePhenotypeAndSimilarity,
} from './phenotypeSimulation.js';
import { countNeighbors,buildQuadtree } from './quadtree.js';
let averageSimilarityWithNeighbors = 0;






function  processBacterium(bacteriumData, concentrations, phenotypeManager, phenotypes, phenotypeMemo) {
    const { x, y, longAxis, angle, ID, parent } = bacteriumData;
    const WIDTH = 100, HEIGHT = 60;
    
    // Get local concentration at bacterium position
    const idx = Math.round(y + HEIGHT/2) * WIDTH + Math.round(x + WIDTH/2);
    const localConcentration = concentrations[idx] || 0;
    
    // Create position as a plain object
    const position = { x, y, z: 0 };
    
    // Get neighbors for this bacterium
    const neighbors = countNeighbors(x, y, phenotypeMemo, phenotypes);
    
    // Determine phenotype and calculate similarity
    const phenotypeInfo = determinePhenotypeAndSimilarity(
        phenotypeManager,phenotypes,phenotypeMemo, ID, neighbors, parent, localConcentration
    );
    
    // Return data object for rendering
    return {
        id:ID,
        position:position,
        angle:angle,
        longAxis:longAxis,
        phenotype:phenotypeInfo[0],
        magentaProportion:phenotypeInfo[1],
        cyanProportion:phenotypeInfo[2],
        similarity:phenotypeInfo[3],
    };
        
  
}


export function updateBacteria(layer, concentrations,currentBacteria,phenotypeManager,phenotypeMemo, phenotypes) {
        
    // Reset state for new time step
    buildQuadtree(layer);
    currentBacteria.clear();
    averageSimilarityWithNeighbors = 0;
    
    // Process each bacterium
    const bacteriaData = [];
    layer.forEach((data) => {
        const singlebacteriumData = processBacterium(data, concentrations, phenotypeManager, phenotypes, phenotypeMemo);
        bacteriaData.push(singlebacteriumData);
        currentBacteria.add(data.ID);
        averageSimilarityWithNeighbors += singlebacteriumData.similarity || 0;
    });

    // Calculate average similarity
    averageSimilarityWithNeighbors = layer.length > 0 
        ? (averageSimilarityWithNeighbors / layer.length-0.5)*2 
        : 0;
        
    // Return both the bacteria data and the calculated average similarity value
    return {
        bacteriaData,
        averageSimilarity: averageSimilarityWithNeighbors
    };
}
