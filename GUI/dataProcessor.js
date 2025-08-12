
export function processFileData(fileContent) {
    let bacteriaTimeSeries = [];
    let bacteriaLineage;

   
    const data = JSON.parse(fileContent);

    // Process  data object
    Object.entries(data).forEach(([timeStep, bacteria]) => {
        if (timeStep === "lineage" ) {
            bacteriaLineage = bacteria;
            return; // Skip the first entry
            }
        const timeStepInt = parseInt(timeStep, 10); 
        if (timeStepInt === 0) return; // Skip the first time step  

        const bacteriaInTimeSlice= bacteria.map(bacterium => (
            { 
            id: bacterium.id,
            y: Math.round((bacterium.y - 170)*10)/10,
            x: Math.round(bacterium.x*10)/10,
            angle: Math.round(bacterium.an*50)/50,
            longAxis: Math.round(bacterium.le),
        }
    ));  

        for (const bacterium of bacteriaInTimeSlice) {
            Object.seal(bacterium);
            Object.preventExtensions(bacterium);
        }

        bacteriaTimeSeries.push(bacteriaInTimeSlice);
    });

    const averageLifetime = analyzeBacteriaLineage(bacteriaTimeSeries, bacteriaLineage);


    return {bacteriaTimeSeries,averageLifetime,bacteriaLineage};
}


function analyzeBacteriaLineage(bacteriaTimeSeries, bacteriaLineage) {
    const AllIDs = new Set();
    const AllParents = new Set();
    for (const bacteriaInTimeSlice of bacteriaTimeSeries) {
        for (const bacterium of bacteriaInTimeSlice) {
          AllIDs.add(bacterium.id);
          const parent = bacteriaLineage[bacterium.id]
          AllParents.add(parent)
        }
      }
    if (AllIDs.size != Object.keys(bacteriaLineage).length){
        console.warn("The number of unique IDs is not the same as in the lineage")
    } else if (AllIDs.size === Object.keys(bacteriaLineage).length){
        console.log("numbert of IDs is correct!")
        console.log("total Bacteria IDs: ", AllIDs.size)
        console.log("total Parent IDs: ", AllParents.size) 
    }
 

    const bacteriaWithParentsandChildren = new Set();
    for (const bacteriaInTimeSlice of bacteriaTimeSeries) {
        for (const bacterium of bacteriaInTimeSlice) {
            const parent = bacteriaLineage[bacterium.id]
            
            if (parent !== 0 && AllParents.has(bacterium.id)) {
                bacteriaWithParentsandChildren.add(bacterium.id);
            }
        }
    }
console.log("size of the id set of parents: ", bacteriaWithParentsandChildren.size);
    const lifetimes = new Map();
    for (let timeIndex = 0; timeIndex < bacteriaTimeSeries.length; timeIndex++) {
        for (const bacterium of bacteriaTimeSeries[timeIndex]) {
            if (bacteriaWithParentsandChildren.has(bacterium.id)) {
                if (!lifetimes.has(bacterium.id)) {
                    lifetimes.set(bacterium.id, [timeIndex, timeIndex]);
                } else {
                    lifetimes.get(bacterium.id)[1] = timeIndex;
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
    console.log("Average Life time: ", averageLifetime)

    return averageLifetime
}

