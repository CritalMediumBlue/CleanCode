export function createPlotOptions({ width, height, type }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const strokeColor = "rgba(255, 255, 255, 0.25)"; 
    let makeFmt = (suffix) => (u, v, sidx) => {
        let d = u.data[sidx];
        if (d && d.length > 0) {
          v = d[d.length - 1];
          if (suffix == '%') {
            v = v.toFixed(2);
            return v == null ? null : v;
          }
          else {
            return v == null ? null : v;
          }
        }
    };


    if (type == 'timeSeries') {
        return {
            width,
            height,
            title: "Average Extracellular concentration of AimP",
            legend: {
                show: true,
                position: "right"
            },
            series: [
                {
                    label: "Step",
                    value: (u, v, sidx, didx) => {
                        if (didx == null) {
                            let d = u.data[sidx];
                            v = d[d.length - 1]+2;
                        }
                        return v;
                    }
                },
                {
                    label: "AimP [nM]",
                    scale: "%",
                    value: makeFmt('%'),
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
    } else if (type == 'phaseSpace') {
        return {
          width,
          height,
          title: "Cytoplasm concentrations in each bacterium",
          titleColor: "rgb(255, 255, 255)",
          legend: { show: false },
          series: [
            { label: "X" },
            { label: "Y", points: { show: false } } // We'll draw points ourselves
          ],
          scales: {
            x: { time: false, auto: false, min: 0, max: 3.2*100 },
            y: { auto: false, min: 0, max: 2*100 }
          },
          axes: [
            { stroke: axisTextColor, grid: { show: true, stroke: strokeColor }, font: "12px Arial", color: axisTextColor, label: "AimP [nM]" },
            { stroke: axisTextColor, grid: { show: true, stroke: strokeColor }, scale: "y", font: "12px Arial", color: axisTextColor, label: "AimR [nM]" }
          ],
          hooks: {
            draw: [
              (u) => {
                let ctx = u.ctx;
                let xdata = u.data[0];
                let ydata = u.data[1];
                for (let i = 0; i < xdata.length-1; i++) {
                  let x = u.valToPos(xdata[i], 'x', true);
                  let y = u.valToPos(ydata[i], 'y', true);
        
                  // Color logic
                  let color;
                  const factor = 0.5/100;
                  const red = ydata[i] * 255*factor;
                  const green = xdata[i] * 255*factor;
                  const blue = ydata[i] * 255 *factor+ xdata[i] * 255*factor;
                  color = `rgb(${red}, ${green}, ${blue})`;
        
                  ctx.beginPath();
                  ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.fill();
                  ctx.strokeStyle = "#222"; // Optional: outline
                  ctx.lineWidth = 0.2;
                  ctx.stroke();
                  ctx.closePath();
                }
                // Draw the last point with a bigger size
                let x = u.valToPos(xdata[xdata.length-1], 'x', true);
                let y = u.valToPos(ydata[ydata.length-1], 'y', true);
                ctx.beginPath();
                let color;
                const factor = 0.5/100;
                const red = ydata[ydata.length-1] * 255*factor;
                const green = xdata[xdata.length-1] * 255*factor;
                const blue = ydata[ydata.length-1] * 255 *factor+ xdata[xdata.length-1] * 255*factor;
                color = `rgb(${red}, ${green}, ${blue})`;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = "#222"; 
                ctx.lineWidth = 0.2;
                ctx.stroke();
                ctx.closePath();

              }
            ]
          }
        };;
    }

}