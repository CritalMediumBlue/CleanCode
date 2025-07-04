import { ADI,FTCS } from './diffusion.js';

let newConcentration;
function diffuse(concentration,sources,timeLapse) {
    
newConcentration = ADI(
        concentration,
        sources,
        timeLapse
    ); 

    return newConcentration;

}


onmessage = (event) => {
    const { concentration, sources, timeLapse } = event.data;

    // Perform the diffusion step
    newConcentration = diffuse(concentration, sources, timeLapse);

    // Send the result back to the main thread using transferable objects
    postMessage({
        concentration: concentration,
        sources: sources
    }, [concentration.buffer, sources.buffer]);

}