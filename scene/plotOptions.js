export function createPlotOptions({ width, height }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const strokeColor = "rgba(255, 255, 255, 0.25)"; 
    let makeFmt = () => (u, v, sidx) => {
        let d = u.data[sidx];
        if (d && d.length > 0) {
          v = d[d.length - 1];
            v = v.toFixed(2);
            return v == null ? null : v;
        }
    };


    
        return {
            width,
            height,
            title: "Average Extracellular concentration of AimP",
            legend: {
                show: true,
                position: "right"
            },
            series: [
                {},
                {
                    label: "AimP [nM]",
                    scale: "%",
                    value: makeFmt(),
                    stroke: "yellow",
                    width: 2,
                }
            ],
            scales: {
                x: {
                    time: false, 
                },
                y: {
                    auto: true,
                }
            }, 
            axes: [
                {
                    stroke: axisTextColor, // Axis line color
                    grid: {
                        show: false,
                        stroke: strokeColor, // Grid line color
                    },
                    font: "12px Arial",
                },
              
                { 
                   
                    stroke: axisTextColor, // Axis line color
                    grid: {
                        show: true,
                        stroke: strokeColor, // Grid line color
                    },
                    font: "12px Arial",
                    color: axisTextColor, // Y-axis label text color
                    scale: '%'
                }
            ]
        }; 
}

