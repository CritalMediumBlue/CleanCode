import { diffuse } from "./diffusionStep.js";

onmessage = function(event) {
    try {
        const {
            concentrations,
            timeLapse
        } = event.data;

        diffuse(concentrations, timeLapse);

    
        postMessage({ success: true, data: concentrations });
        
    } catch (error) {
        postMessage({ success: false, error: error.message });
    }
};