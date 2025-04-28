export function createPlotOptions({ width, height }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const strokeColor = "rgba(255, 255, 255, 0.5)"; 
    let makeFmt = (suffix) => (u, v, sidx) => {
     
        let d = u.data[sidx];
        if (d && d.length > 0) {
          v = d[d.length - 1];
        }
      
      return v == null ? null : v.toFixed(2) + suffix;
    };
    return {
      width,
      height,
      cursor: {
        drag: {
          setScale: false,
        },
        focus: {
          prox: 20, 
        },
        show: true,
        hover: true,
      },
      select: {
        show: false,
      },
      series: [
        {
            label: "Time Step",
            value: makeFmt(),
        },
        {
            label: "Total",
            scale: "count",
            value: makeFmt("Bacteria"),
            stroke: "white",
            width: 2,
        },
        {
            label: "Magenta",
            scale: "%",
            value: makeFmt('%'),
            stroke: "magenta",
            width: 2,
        },
        {
            label: "Cyan",
            scale: "%",
            value: makeFmt('%'),
            stroke: "cyan",
            width: 2,
        },
        {
            label: "Similarity",
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
          // X-axis styling
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