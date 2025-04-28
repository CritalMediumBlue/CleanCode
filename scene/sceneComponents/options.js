export  function createPlotOptions({ width, height }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const strokeColor = "rgba(255, 255, 255, 0.5)"; // Color for grid lines and ticks
    let makeFmt = () => (u, v, sidx, didx) => {
      if (didx == null) {
        // Safe check if data exists and has elements
        let d = u.data[sidx];
        if (d && d.length > 0) {
          v = d[d.length - 1];
        }
      }
  
      return v == null ? null : v.toFixed(1);
    };
    return {
      title: "Bacteria Simulation",
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
          value: (u, v, sidx, didx) => {
            if (didx == null) {
              let d = u.data[sidx];
              v = d[d.length - 1];
            }
  
            return v;
          }
        },
        {
          label: "Total",
          stroke: "white",
          width: 2,
          value: makeFmt(),
        },
        {
          label: "Magenta",
          stroke: "magenta",
          width: 2,
          value: makeFmt(),
        },
        {
          label: "Cyan",
          stroke: "cyan",
          width: 2,
          value: makeFmt(),
        },
        {
          label: "Similarity",
          scale: '%',
          stroke: "yellow",
          width: 2,
          value: makeFmt(),
        }
      ] ,
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
          color: axisTextColor, // X-axis label text color
        },
        {
          // Y-axis styling
          stroke: axisTextColor, // Axis line color
          grid: {
            show: true,
            stroke: strokeColor, // Grid line color
          },
          scale: 'count',
          font: "12px Arial",
          color: axisTextColor, // Y-axis label text color
          values: (u, vals) => vals.map(v => +v.toFixed(1)),
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
          scale: '%',
          values: (u, vals) => vals.map(v => +v.toFixed(1)),
        }
  
      ],
      legend: {
        show: true,
        live: true,
        isolate: true,
        markers: {
          width: 8,
          stroke: (u, i) => u.series[i].stroke,
          fill: (u, i) => u.series[i].stroke,
        },
        // Add label formatter to include values in legend
        labels: {
          text: (u, i) => {
            const label = u.series[i].label;
            if (i === 0) return label; // Skip the first series (x-values)
            
            // Get the last value for this series
            const data = u.data[i];
            const lastValue = data && data.length > 0 ? data[data.length - 1] : null;
            
            // Format the value to 1 decimal place
            const formattedValue = lastValue != null ? lastValue.toFixed(1) : "N/A";
            
            // Combine the label and value
            return `${label}: ${formattedValue}`;
          }
        }
      },
      padding: [10, 10, 10, 10], // [top, right, bottom, left]
   
    };
  }