/**
 * overlay.js - Handles UI overlay functionality for the simulation
 * Responsible for updating text information and other UI overlays
 */

/**
 * Updates the text overlay element with current simulation statistics
 * including time step, simulated time, and bacteria count.
 * 
 * @param {Object} animationState - Object containing simulation state information.
 * @param {number} animationState.currentTimeStep - The current simulation time step.
 * @param {number} animationState.numberOfTimeSteps - The total number of time steps in the simulation.
 * @param {number} animationState.fromStepToMinutes - Conversion factor from simulation step to minutes.
 * @param {number} bacteriaCount - The number of bacteria in the current time step.
 */
export function updateOverlay(animationState) {

    const overlay = document.getElementById("dynamic-text-overlay");
    const currentTimeStep = animationState.currentTimeStep;
    const numberOfTimeSteps = animationState.numberOfTimeSteps;
    const fromStepToMinutes = animationState.fromStepToMinutes;

    // Calculate simulated time
    const timeInMinutes = currentTimeStep * fromStepToMinutes;
    const totalSeconds = Math.floor(timeInMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format time string as HH:MM:SS
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update overlay text content with current simulation stats
    overlay.innerText = `Step: ${currentTimeStep} / ${numberOfTimeSteps}
    Time: ${timeString}`
}

