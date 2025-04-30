let myQuadtree = null;
import { quadtree } from 'd3-quadtree';



export function buildQuadtree(layer) {
    myQuadtree = quadtree()
        .x(d => d.x)
        .y(d => d.y);
    
    layer.forEach(data => {
        myQuadtree.add(data);
    });
}
export function countNeighbors(x, y, phenotypeMemo, phenotypes) {
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
