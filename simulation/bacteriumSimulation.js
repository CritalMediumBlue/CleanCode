import { CONFIG, PHENOTYPES } from '../config.js';

/**
 * Manages history tracking for bacteria simulation
 */
export class HistoryManager {
    constructor() {
        this.totalBacteriaCountHistory = [];
        this.magentaBacteriaCountHistory = [];
        this.cyanBacteriaCountHistory = [];
        this.averageSimilarityHistory = [];
    }

    /**
     * Update history arrays with new data
     * @param {number} totalCount - Total bacteria count
     * @param {number} magentaCount - Magenta bacteria count
     * @param {number} cyanCount - Cyan bacteria count
     * @param {number} averageSimilarity - Average similarity value
     */
    update(totalCount, magentaCount, cyanCount, averageSimilarity) {
        this.totalBacteriaCountHistory.push(totalCount);
        this.magentaBacteriaCountHistory.push(magentaCount);
        this.cyanBacteriaCountHistory.push(cyanCount);
        this.averageSimilarityHistory.push(averageSimilarity);
    }

    /**
     * Get all history arrays
     * @returns {Object} Object containing all history arrays
     */
    getHistories() {
        return {
            totalBacteriaCountHistory: this.totalBacteriaCountHistory,
            magentaBacteriaCountHistory: this.magentaBacteriaCountHistory,
            cyanBacteriaCountHistory: this.cyanBacteriaCountHistory,
            averageSimilarityHistory: this.averageSimilarityHistory
        };
    }

    /**
     * Clear all history arrays
     */
    clear() {
        this.totalBacteriaCountHistory = [];
        this.magentaBacteriaCountHistory = [];
        this.cyanBacteriaCountHistory = [];
        this.averageSimilarityHistory = [];
    }
}

/**
 * Manages phenotype determination, tracking, and related operations
 */
export class PhenotypeManager {
    constructor() {
        this.phenotypeMemo = new Map();
        this.signal = CONFIG.BACTERIUM.SIGNAL.DEFAULT / 100;
        this.alpha = CONFIG.BACTERIUM.ALPHA.DEFAULT;
    }

    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Set the signal value used in phenotype determination
     */
    setSignalValue(value) {
        this.signal = this.clamp(value, CONFIG.BACTERIUM.SIGNAL.MIN, CONFIG.BACTERIUM.SIGNAL.MAX) / 100;
    }

    /**
     * Set the alpha value used in phenotype determination
     */
    setAlphaValue(value) {
        this.alpha = this.clamp(value, CONFIG.BACTERIUM.ALPHA.MIN, CONFIG.BACTERIUM.ALPHA.MAX);
    }

    /**
     * Get phenotype for a bacterium based on inheritance from parent
     */
    simplifiedInheritancePhenotype(ID, parentID) {
        // Check if phenotype is already determined for this ID
        if (this.phenotypeMemo.has(ID)) {
            return this.phenotypeMemo.get(ID);
        }
        
        // Check if parent phenotype is available
        if (parentID !== undefined && this.phenotypeMemo.has(parentID)) {
            const phenotype = this.phenotypeMemo.get(parentID);
            this.phenotypeMemo.set(ID, phenotype);
            return phenotype;
        }
        
        // Assign random phenotype if no inheritance information
        const phenotype = Math.random() < 0.5 ? PHENOTYPES.MAGENTA : PHENOTYPES.CYAN;
        this.phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }

    /**
     * Determine phenotype based on neighbors and local concentration
     */
    inheritancePhenotype(ID, neighbors, localConcentration) {
        // If phenotype already determined, use transition rules
        if (this.phenotypeMemo.has(ID)) {
            return this.determineTransitionPhenotype(ID, neighbors, localConcentration);
        }
        
        // Handle parent inheritance for IDs > 2000
        if (ID > 2000n) {
            const parentID = ID / 2n;
            if (this.phenotypeMemo.has(parentID)) {
                const phenotype = this.phenotypeMemo.get(parentID);
                this.phenotypeMemo.set(ID, phenotype);
                return phenotype;
            }
        }
        
        // Handle initial bacteria (IDs 1000-2000)
        if (ID >= 1000n && ID <= 2000n) {
            const phenotype = Math.random() < 0.5 ? PHENOTYPES.MAGENTA : PHENOTYPES.CYAN;
            this.phenotypeMemo.set(ID, phenotype);
            return phenotype;
        }
        
        // Default case - should not reach here in normal operation
        return null;
    }

    /**
     * Determine phenotype transition based on current phenotype and environment
     */
    determineTransitionPhenotype(ID, neighbors, localConcentration) {
        const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
        const proportionCyan = cyanNeighbors / totalNeighbors;
        const originalPhenotype = this.phenotypeMemo.get(ID);
        
        // Calculate transition rates based on feedback type
        let K_c2m, K_m2c; // Transition rates: cyan-to-magenta and magenta-to-cyan
        
        if (CONFIG.BACTERIUM.POSITIVE_FEEDBACK) {
            K_c2m = this.alpha + localConcentration * this.signal;
            K_m2c = this.alpha + proportionCyan * this.signal;
        } else {
            K_c2m = this.alpha + proportionCyan * this.signal;
            K_m2c = this.alpha + localConcentration * this.signal;
        }
        
        // Determine new phenotype based on transition probabilities
        const rand = Math.random();
        let phenotype;
        
        // Replace .equals() with === for string comparison
        if (originalPhenotype === PHENOTYPES.MAGENTA) {
            phenotype = rand < K_m2c ? PHENOTYPES.CYAN : PHENOTYPES.MAGENTA;
        } else {
            phenotype = rand < K_c2m ? PHENOTYPES.MAGENTA : PHENOTYPES.CYAN;
        }
        
        this.phenotypeMemo.set(ID, phenotype);
        return phenotype;
    }

    /**
     * Determine phenotype and calculate similarity with neighbors
     * 
     * @param {bigint} ID - Bacterium ID
     * @param {Array} neighbors - Count of [total, magenta, cyan] neighbors
     * @param {bigint} parentID - Parent bacterium ID
     * @param {number} localConcentration - Local concentration value
     * @returns {Object} Object containing phenotype and similarity information
     */
    determinePhenotypeAndSimilarity(ID, neighbors, parentID, localConcentration) {
        // Determine phenotype based on inheritance or neighbors
        const phenotype = parentID === undefined 
            ? this.inheritancePhenotype(ID, neighbors, localConcentration) 
            : this.simplifiedInheritancePhenotype(ID, parentID);
        
        // Calculate similarity with neighbors
        const [totalNeighbors, magentaNeighbors, cyanNeighbors] = neighbors;
        const magentaProportion = magentaNeighbors / totalNeighbors;
        const cyanProportion = cyanNeighbors / totalNeighbors;
        
        // Replace .equals() with === for string comparison
        const similarity = phenotype === PHENOTYPES.MAGENTA 
            ? magentaProportion 
            : cyanProportion;
        
        return {
            phenotype, 
            similarity, 
            magentaProportion, 
            cyanProportion
        };
    }

    /**
     * Get count of bacteria with magenta phenotype
     */
    getMagentaCount(currentTimestepBacteria) {
        return this.getPhenotypeCount(currentTimestepBacteria, PHENOTYPES.MAGENTA);
    }

    /**
     * Get count of bacteria with cyan phenotype
     */
    getCyanCount(currentTimestepBacteria) {
        return this.getPhenotypeCount(currentTimestepBacteria, PHENOTYPES.CYAN);
    }

    /**
     * Get positions of bacteria by phenotype
     */
    getPositions(currentTimestepBacteria) {
        const magentaPositions = [];
        const cyanPositions = [];

        Array.from(currentTimestepBacteria).forEach((ID) => {
            const phenotype = this.phenotypeMemo.get(ID);
            if (!phenotype) return;
            
            // Replace .equals() with === for string comparison
            if (phenotype === PHENOTYPES.MAGENTA) {
                magentaPositions.push(ID);
            } else if (phenotype === PHENOTYPES.CYAN) {
                cyanPositions.push(ID);
            }
        });

        return [magentaPositions, cyanPositions];
    }

    /**
     * Count bacteria with a specific phenotype
     */
    getPhenotypeCount(currentTimestepBacteria, targetPhenotype) {
        return Array.from(currentTimestepBacteria).reduce((count, ID) => {
            const phenotype = this.phenotypeMemo.get(ID);
            // Replace .equals() with === for string comparison
            return phenotype && phenotype === targetPhenotype ? count + 1 : count;
        }, 0);
    }

    /**
     * Clear phenotype memoization cache
     */
    clearPhenotypeMemo() {
        this.phenotypeMemo.clear();
    }
}

// Export phenotype constants for external use
export { PHENOTYPES };