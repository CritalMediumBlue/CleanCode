/**
 * overlay.js - Handles UI overlay functionality for the simulation
 * Responsible for updating text information and other UI overlays
 */

/**
 * Updates the text overlay element with current simulation statistics
 * like time step, simulated time, and bacteria counts.
 * @param {number} bacteriaCount - The number of bacteria in the current time step.
 * @param {number} currentTimeStep - The current simulation time step.
 * @param {number} numberOfTimeSteps - The total number of time steps in the simulation.
 * @param {number} fromStepToMinutes - Conversion factor from simulation step to minutes.
 * @param {Set<number> | null} allUniqueIDs - Set of all unique bacteria IDs across the simulation.
 */
export function updateOverlay(bacteriaCount, currentTimeStep, numberOfTimeSteps, fromStepToMinutes, allUniqueIDs) {
    const overlay = document.getElementById("text-overlay");
    if (!overlay) return; // Exit if overlay element not found

    // Calculate simulated time
    const timeInMinutes = currentTimeStep * fromStepToMinutes;
    const totalSeconds = Math.floor(timeInMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format time string
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update overlay text content
    overlay.innerText = `Step: ${currentTimeStep} / ${numberOfTimeSteps}
Time: ${timeString}
Bacteria Count: ${bacteriaCount}
Total Unique Bacteria: ${allUniqueIDs ? allUniqueIDs.size : 'N/A'}`;
}