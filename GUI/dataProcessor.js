
export function processFileData(fileContent) {
    let bacteriaTimeSeries = [];

   
    const data = JSON.parse(fileContent);

    // Process  data object
    Object.entries(data).forEach(([timeStep, bacteria]) => {
        if (timeStep === "time" ) return; // Skip the first entries
        const timeStepInt = parseInt(timeStep, 10); 
        if (timeStepInt === 0) return; // Skip the first time step  
        
     
        const bacteriaInTimeSlice= bacteria.map(bacterium => (
            { 
            ID: BigInt(bacterium.ID),
            y: Math.round((bacterium.y - 170)*10)/10,
            x: Math.round(bacterium.x*10)/10,
            angle: Math.round(bacterium.angle*50)/50,
            longAxis: Math.round(bacterium.length),
            parent: bacterium.parent ? bacterium.parent : undefined,
            randomSwitch: Math.random() < 0.0001 ? true : false,
        }
    ));

        for (const bacterium of bacteriaInTimeSlice) {
            Object.seal(bacterium);
            Object.preventExtensions(bacterium);
        }

        
        bacteriaTimeSeries.push(bacteriaInTimeSlice);
    });

    const averageLifetime = analyzeBacteriaLineage(bacteriaTimeSeries);


    return {bacteriaTimeSeries,averageLifetime};
}


function analyzeBacteriaLineage(bacteriaTimeSeries) {
    const AllIDs = new Set();
    for (const bacteriaInTimeSlice of bacteriaTimeSeries) {
        for (const bacterium of bacteriaInTimeSlice) {
          AllIDs.add(bacterium.ID);
        }
      }

    const bacteriaWithParentsandChildren = new Set();
    for (const bacteriaInTimeSlice of bacteriaTimeSeries) {
        for (const bacterium of bacteriaInTimeSlice) {
            if (AllIDs.has(bacterium.ID/2n) && (AllIDs.has(bacterium.ID*2n))) {
                bacteriaWithParentsandChildren.add(bacterium.ID);
            }
        }
    }

    const lifetimes = new Map();
    for (let timeIndex = 0; timeIndex < bacteriaTimeSeries.length; timeIndex++) {
        for (const bacterium of bacteriaTimeSeries[timeIndex]) {
            if (bacteriaWithParentsandChildren.has(bacterium.ID)) {
                if (!lifetimes.has(bacterium.ID)) {
                    lifetimes.set(bacterium.ID, [timeIndex, timeIndex]);
                } else {
                    lifetimes.get(bacterium.ID)[1] = timeIndex;
                }
            }
        }
    }

    // Calculate average lifetime
    let sum = 0;
    let count = 0;
    lifetimes.forEach((value) => {
        sum += value[1] - value[0];
        count++;
    });
    const averageLifetime = sum / count ;


    return averageLifetime
}

