/**
 * overlay.js - Handles UI overlay functionality for the simulation
 * Responsible for updating text information and other UI overlays
 */


export function updateOverlay(animationState,constants) {

    const overlay = document.getElementById("dynamic-text-overlay");
    const currentTimeStep = animationState.currentTimeStep;
    const numberOfTimeSteps = constants.numberOfTimeSteps;
    const fromStepToMinutes = constants.fromStepToMinutes;

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

