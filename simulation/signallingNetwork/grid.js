
let grid = null;
let _cellSize = 7; // Default cell size, matching the neighbor search radius


function getCellKey(x, y) {
  const cellX = Math.floor(x / _cellSize);
  const cellY = Math.floor(y / _cellSize);
  return `${cellX},${cellY}`;
}


export function buildGrid(layer, cellSize = 7) {
  // Reset the grid
  grid = new Map();
  _cellSize = cellSize;
  
  // Add each point to the appropriate cell
  layer.forEach(point => {
    const key = getCellKey(point.x, point.y);
    
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    
    grid.get(key).push(point);
  });
}

export function countNeighbors(x, y, phenotypeManager) {
  const { phenotypeMemo, phenotypes } = phenotypeManager;
  const neighborRadius = 7;
  const radiusSquared = neighborRadius * neighborRadius;
  let magentaCount = 0;
  let cyanCount = 0;
  
  // Get the cell containing the query point
  const centerCellX = Math.floor(x / _cellSize);
  const centerCellY = Math.floor(y / _cellSize);
  
  // Check the query point's cell and its 8 adjacent cells
  for (let offsetX = -1; offsetX <= 1; offsetX++) {
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
      const cellX = centerCellX + offsetX;
      const cellY = centerCellY + offsetY;
      const key = `${cellX},${cellY}`;
      
      // Skip if this cell doesn't exist in our grid
      if (!grid.has(key)) continue;
      
      // Check each point in this cell
      for (const point of grid.get(key)) {
        const dx = point.x - x;
        const dy = point.y - y;
        const distSquared = dx * dx + dy * dy;
        
        if (distSquared < radiusSquared) {
          const phenotype = phenotypeMemo.get(pointid);
          if (phenotype && phenotype === phenotypes.MAGENTA) {
            magentaCount++;
          } else if (phenotype && phenotype === phenotypes.CYAN) {
            cyanCount++;
          }
        }
      }
    }
  }
  
  const totalCount = magentaCount + cyanCount;
  return [totalCount, magentaCount, cyanCount];
}
let adjustedX = null
let adjustedY = null

export function getAdjustedCoordinates(x, y, HEIGHT, WIDTH) {
  // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
  adjustedX = Math.round(-x + WIDTH / 2);
  adjustedY = Math.round(y + HEIGHT / 2);

  // Skip bacteria below the grid's bottom edge.
  if (adjustedY <= 0) {
      adjustedY = 0;
  }
  if (adjustedX <= 0) {
      adjustedX = 0;
  }
  if (adjustedY >= HEIGHT) {
      adjustedY = HEIGHT - 1;
  }
  if (adjustedX >= WIDTH) {
      adjustedX = WIDTH - 1;
  }

 
  // Calculate the 1D index corresponding to the 2D grid coordinates.
  const idx = adjustedY * WIDTH + adjustedX;

  return idx ;
}
