import { diffuse } from "./diffusionStep.js";

onmessage = function(event) {
    try {
        const {
            concentrations,
            timeLapse
        } = event.data;
        
        // Performance measurement in worker
        const startTime = performance.now();
        
        // Process diffusion
        diffuse(concentrations, timeLapse);
        
        const endTime = performance.now();
        
        // Send back the result
        // Note: Since we're operating on the same concentrations object,
        // we don't need to create a new one for the response
        postMessage({ 
            success: true, 
            data: concentrations,
            processingTime: endTime - startTime 
        });
        
    } catch (error) {
        postMessage({ success: false, error: error.message });
    }
};