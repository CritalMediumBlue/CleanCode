import {
    determinePhenotypeAndSimilarity,
} from './phenotypeSimulation.js';
let myQuadtree = null
let averageSimilarityWithNeighbors = 0;

function countNeighbors(x, y, phenotypeMemo, phenotypes) {
    const neighborRadius = 7;
    let totalCount = 0;
    let magentaCount = 0;
    let cyanCount = 0;

    myQuadtree.visit((node, x1, y1, x2, y2) => {
        // Skip if node is outside search radius
        if (x1 > x + neighborRadius || 
            x2 < x - neighborRadius || 
            y1 > y + neighborRadius || 
            y2 < y - neighborRadius) {
            return true; 
        }
        
        // Process leaf node
        if (!node.length) {
            do {
                if (node.data) {
                    const dx = node.data.x - x;
                    const dy = node.data.y - y;
                    const distSquared = dx * dx + dy * dy;
                    
                    if (distSquared < neighborRadius * neighborRadius) {
                        totalCount++;
                        const phenotype = phenotypeMemo.get(node.data.ID);
                        
                        if (phenotype && phenotype === phenotypes.MAGENTA) {
                            magentaCount++;
                        } else if (phenotype && phenotype === phenotypes.CYAN) {
                            cyanCount++;
                        }
                    }
                }
            } while (node = node.next);
        }
        
        return false; // Continue traversal
    });

    return [totalCount, magentaCount, cyanCount];
}



function buildQuadtree(layer,quadtree) {
    myQuadtree = quadtree()
        .x(d => d.x)
        .y(d => d.y);
    
    layer.forEach(data => {
        myQuadtree.add(data);
    });
}

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


export function updateBacteria(layer, concentrations,quadtree,currentBacteria,phenotypeManager,phenotypeMemo, phenotypes) {
        
    // Reset state for new time step
    buildQuadtree(layer,quadtree);
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
        
    return bacteriaData;
}
