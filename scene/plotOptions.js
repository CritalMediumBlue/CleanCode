export function createPlotOptions({ width, height }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const strokeColor = "rgba(255, 255, 255, 0.25)"; 
    let makeFmt = (suffix) => (u, v, sidx) => {
     
        let d = u.data[sidx];
        if (d && d.length > 0) {
          v = d[d.length - 1];
          if (suffix == '%') {
            v = v.toFixed(2);
            return v == null ? null : v + suffix;
          }
          else {
            return v == null ? null : v;
          }
        }
        
      
    };
    return {
      width,
      height,
      cursor: {
        focus: { prox: 10, }
      },
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
                    v = d[d.length - 1];
                }
  
                return v;
            }
        },
        {
            label: "Tot",
            scale: "count",
            value: makeFmt(""),
            stroke: "white",
            width: 1,
        },
        {
            label: "Mag",
            scale: "%",
            value: makeFmt('%'),
            stroke: "magenta",
            width: 2,
        },
        {
            label: "Cya",
            scale: "%",
            value: makeFmt('%'),
            stroke: "cyan",
            width: 2,
        },
        {
            label: "Sim",
            scale: "%",
            value: makeFmt('%'),
            stroke: "yellow",
            width: 2,
        }
        
    ],
      scales: {
        x: {
          time: false, 
        }
      }, 
      axes: [
        {
          stroke: axisTextColor, // Axis line color
          grid: {
            show: true,
            stroke: strokeColor, // Grid line color
          },
          font: "12px Arial",
        },
        {
          stroke: axisTextColor, // Axis line color
          grid: {
            stroke: strokeColor, // Grid line color
          },
          scale: 'count',
          font: "12px Arial"
        },
        { 
          side: 1,
          stroke: axisTextColor, // Axis line color
          grid: {
            show: false,
            stroke: strokeColor, // Grid line color
          },
          font: "12px Arial",
          color: axisTextColor, // Y-axis label text color
          scale: '%'
        }
      ]
    };
  }