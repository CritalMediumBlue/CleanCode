// Data processing module for bacteria simulation

// Global variables to store processed data
let bacteriaData = new Map();
let numberOfTimeSteps = 0;


export const handleFileInput = (init,event) => {
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const processedData = processFileData(e.target.result);
        init(processedData);
    };
    reader.readAsText(event.target.files[0]);
};

function processFileData(fileContent) {
    // Clear previous data
    bacteriaData.clear();
    numberOfTimeSteps = 0;

    // Parse the JSON data
    const data = JSON.parse(fileContent);

    // Process bacteria data
    Object.entries(data).forEach(([timeStep, bacteria]) => {
        const timeStepInt = parseInt(timeStep, 10); // Convert to integer
        if (timeStep === "time" || timeStepInt === 0) return; // Skip the first entries
        
        // Transform bacteria data
        bacteria = bacteria.map(bacterium => ({ 
            ...bacterium, 
            ID: BigInt(bacterium.ID),
            y: Math.round((bacterium.y - 170)*10)/10,
            x: Math.round(bacterium.x*10)/10,
            angle: Math.round(bacterium.angle*50)/50,
            longAxis: Math.round(bacterium.length),

            
        }));

        bacteriaData.set(timeStepInt, bacteria);
    });

    // Analyze bacteria lineage and lifetime
    const analysisResults = analyzeBacteriaLineage(bacteriaData);

    // Set number of time steps
    numberOfTimeSteps = bacteriaData.size;
    console.log('1. Number of time steps:', numberOfTimeSteps);

    // Log analysis results
    console.log('Average Bacteria Lifetime:', analysisResults.averageLifetime);
    console.log('Bacteria with Parents and Children:', analysisResults.bacteriaWithParentsandChildren);
    console.log('Total Unique Bacteria IDs:', analysisResults.totalUniqueIDs);
    console.log('Ready');

    return {
        bacteriaData,
        numberOfTimeSteps,
        ...analysisResults
    };
}


function analyzeBacteriaLineage(bacteriaData) {
    // Create a set with all the IDs
    const AllIDs = new Set();
    bacteriaData.forEach((timeStep) => {
        timeStep.forEach((bacterium) => {
            AllIDs.add(bacterium.ID);
        });
    });

    // Find bacteria with both parents and children
    const bacteriaWithParentsandChildren = new Set();
    bacteriaData.forEach((timeStep) => {
        timeStep.forEach((bacterium) => {
            if (AllIDs.has(bacterium.ID/2n) && (AllIDs.has(bacterium.ID*2n) || AllIDs.has(bacterium.ID*2n+1n))) {
                bacteriaWithParentsandChildren.add(bacterium.ID);
            }
        });
    });
const sortedTimeSteps = [...bacteriaData.keys()].sort((a, b) => a - b);

    // Calculate the lifetime of bacteria with parents and children
    const lifetimes = new Map();
    sortedTimeSteps.forEach(time => {
        const timeStep = bacteriaData.get(time);
        timeStep.forEach((bacterium) => {

            if (bacteriaWithParentsandChildren.has(bacterium.ID)) {

                if (!lifetimes.has(bacterium.ID)) {
                    lifetimes.set(bacterium.ID, [time, time]);
                } else {
                    lifetimes.get(bacterium.ID)[1] = time;
                }

            }
        });
    });

    // Calculate average lifetime
    let sum = 0;
    let count = 0;
    lifetimes.forEach((value) => {
        sum += value[1] - value[0];
        count++;
    });

    const averageLifetime = sum / count ;

    const lengths = new Set();
    bacteriaData.forEach(timeStep => {
        timeStep.forEach((bacterium) => {
                lengths.add(bacterium.longAxis);
        });
    });

    // Log the lengths
    console.log('Lengths:', lengths);


    return {
        averageLifetime,
         bacteriaWithParentsandChildren,
        totalUniqueIDs: AllIDs
    };
}

