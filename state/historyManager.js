/**
 * @fileoverview History tracking module for bacteria simulation
 * Manages the storage and tracking of historical data for visualization and analysis
 */

// Private state variables
let totalBacteriaCountHistory = [];
let magentaBacteriaCountHistory = [];
let cyanBacteriaCountHistory = [];
let averageSimilarityHistory = [];

/**
 * Update history arrays with new data
 * @param {number} totalCount - Total bacteria count
 * @param {number} magentaCount - Magenta bacteria count
 * @param {number} cyanCount - Cyan bacteria count
 * @param {number} averageSimilarity - Average similarity value
 */
export const update = (totalCount, magentaCount, cyanCount, averageSimilarity) => {
    totalBacteriaCountHistory.push(totalCount);
    magentaBacteriaCountHistory.push(magentaCount/totalCount);
    cyanBacteriaCountHistory.push(cyanCount/totalCount);
    averageSimilarityHistory.push(averageSimilarity);
};

/**
 * Get all history arrays
 * @returns {Array} Array containing all history data series
 */
export const getHistories = () => {
    const dataLength = totalBacteriaCountHistory.length;
    const data = [
        Array.from({ length: dataLength }, (_, index) => index),
        totalBacteriaCountHistory,
        magentaBacteriaCountHistory,
        cyanBacteriaCountHistory,
        averageSimilarityHistory
    ];

    return data;
};

/**
 * Clear all history arrays
 */
export const clear = () => {
    totalBacteriaCountHistory = [];
    magentaBacteriaCountHistory = [];
    cyanBacteriaCountHistory = [];
    averageSimilarityHistory = [];
};