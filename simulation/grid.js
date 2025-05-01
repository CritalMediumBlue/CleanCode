/**
 * Grid-based spatial partitioning implementation.
 * Alternative to the quadtree approach for performance comparison.
 */

// The grid structure will be a Map where keys are cell coordinates (as strings)
// and values are arrays of points in that cell
let grid = null;
let _cellSize = 7; // Default cell size, matching the neighbor search radius

/**
 * Convert a point's coordinates to a cell key
 * @param {Number} x - X coordinate
 * @param {Number} y - Y coordinate
 * @returns {String} - String key in the format "cellX,cellY"
 */
function getCellKey(x, y) {
  const cellX = Math.floor(x / _cellSize);
  const cellY = Math.floor(y / _cellSize);
  return `${cellX},${cellY}`;
}

/**
 * Builds a grid-based spatial partitioning structure
 * @param {Array} layer - Array of points to add to the grid
 * @param {Number} cellSize - Size of each grid cell (optional)
 */
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

/**
 * Count neighbors within a radius of a given point
 * @param {Number} x - X coordinate of the query point
 * @param {Number} y - Y coordinate of the query point
 * @param {Map} phenotypeMemo - Map of point IDs to phenotypes
 * @param {Object} phenotypes - Object containing phenotype constants
 * @returns {Array} - [totalCount, magentaCount, cyanCount]
 */
export function countNeighbors(x, y, phenotypeMemo, phenotypes) {
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
          const phenotype = phenotypeMemo.get(point.ID);
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


export const getAdjustedCoordinates = (x, y, grid) => {
  // Translate coordinates so (0,0) is the bottom-left corner of the grid, then round.
  let adjustedX = Math.round(x + grid.WIDTH / 2);
  let adjustedY = Math.round(y + grid.HEIGHT / 2);

  // Skip bacteria below the grid's bottom edge.
  if (adjustedY <= 0) {
      return null;
  }

  // Clamp coordinates to valid grid boundaries (leaving a 1-cell border).
  adjustedY = Math.min(adjustedY, grid.HEIGHT - 2); 
  adjustedX = Math.max(1, Math.min(adjustedX, grid.WIDTH - 2));

  // Calculate the 1D index corresponding to the 2D grid coordinates.
  const idx = adjustedY * grid.WIDTH + adjustedX;

  return { x: adjustedX, y: adjustedY, idx };
};
