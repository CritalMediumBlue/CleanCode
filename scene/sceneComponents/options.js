export function createPlotOptions({ width, height }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const strokeColor = "rgba(255, 255, 255, 0.5)"; 
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
            // Ensure data exists before accessing
            if (u && u.data && Array.isArray(u.data) && u.data[sidx]) {
              if (didx == null) {
                let d = u.data[sidx];
                v = d[d.length - 1];
              }
            }
  
            return v == null ? 0 : v;
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
      ],
      scales: {
        x: {
          time: false,
        },
        // Ensure default scale exists for the main Y axis
        count: {
          auto: true,
          range: (u, min, max) => {
            if (min === undefined || max === undefined) {
              return [0, 1600]; // Default range if data is missing
            }
            return [0, max * 1.1]; // Add 10% padding at top
          }
        },
        '%': {
          auto: true,
          range: (u, min, max) => {
            if (min === undefined || max === undefined) {
              return [0, 100]; // Default range if data is missing
            }
            return [0, Math.max(100, max * 1.1)]; // Max between 100 and 10% above max
          }
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
          values: (u, vals) => {
            // Check if vals is defined
            if (!vals || !Array.isArray(vals)) {
              return [0, 400, 800, 1200, 1600]; // Default values
            }
            return vals.map(v => +v.toFixed(1));
          },
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
          values: (u, vals) => {
            // Check if vals is defined
            if (!vals || !Array.isArray(vals)) {
              return [0, 25, 50, 75, 100]; // Default values
            }
            return vals.map(v => +v.toFixed(1));
          },
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
            // Validate u has required properties
            if (!u || !u.series || !u.series[i] || !u.data) {
              return i === 0 ? "Time" : "N/A";
            }
            
            const label = u.series[i].label || `Series ${i}`;
            if (i === 0) return label; // Skip the first series (x-values)
            
            // Get the last value for this series with validation
            const data = u.data[i];
            const lastValue = data && Array.isArray(data) && data.length > 0 ? 
              data[data.length - 1] : null;
            
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