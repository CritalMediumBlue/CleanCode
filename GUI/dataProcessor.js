// Data processing module for bacteria simulation




export const handleFileInput = (init,event) => {
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const processedData = processFileData(e.target.result);
        init(processedData);
    };
    reader.readAsText(event.target.files[0]);
};

function processFileData(fileContent) {
    let bacteriaTimeSeries = [];
    let numberOfTimeSteps = 0;

   
    const data = JSON.parse(fileContent);

    // Process  data object
    Object.entries(data).forEach(([timeStep, bacteria]) => {
        if (timeStep === "time" ) return; // Skip the first entries
        const timeStepInt = parseInt(timeStep, 10); 
        if (timeStepInt === 0) return; // Skip the first time step  
        
     
        const BacteriaTimeSlice= bacteria.map(bacterium => ({ 
            ID: BigInt(bacterium.ID),
            y: Math.round((bacterium.y - 170)*10)/10,
            x: Math.round(bacterium.x*10)/10,
            angle: Math.round(bacterium.angle*50)/50,
            longAxis: Math.round(bacterium.length),
            parent: bacterium.parent ? bacterium.parent : undefined,
        }));

        
        bacteriaTimeSeries.push(BacteriaTimeSlice);
    });

    // Analyze bacteria lineage and lifetime
    const analysisResults = analyzeBacteriaLineage(bacteriaTimeSeries);

    // Set number of time steps
    numberOfTimeSteps = bacteriaTimeSeries.length;
    console.log('1. Number of time steps:', numberOfTimeSteps);

    // Log analysis results
    console.log('Average Bacteria Lifetime:', analysisResults.averageLifetime);
    console.log('Bacteria with Parents and Children:', analysisResults.bacteriaWithParentsandChildren);
    console.log('Total Unique Bacteria IDs:', analysisResults.totalUniqueIDs);
    console.log('Ready');

    return {
        bacteriaTimeSeries,
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

    const lifetimes = new Map();
    bacteriaData.forEach((timeStep, timeIndex) => {
        timeStep.forEach((bacterium) => {
    
            if (bacteriaWithParentsandChildren.has(bacterium.ID)) {
    
                if (!lifetimes.has(bacterium.ID)) {
                    lifetimes.set(bacterium.ID, [timeIndex, timeIndex]);
                } else {
                    lifetimes.get(bacterium.ID)[1] = timeIndex;
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

