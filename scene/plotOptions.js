export function createPlotOptions() {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const gridColor = "rgba(255, 255, 255, 0.4)"; 
    
    return {
        responsive: false, // We'll handle dimensions manually since we set width/height
        maintainAspectRatio: false,
        animation: {
            duration: 0 // Disable animations for performance
        },
        plugins: {
            title: {
                display: true,
                text: "Average intracellular concentrations with standard deviation",
                color: axisTextColor,
                font: {
                    size: 16
                }
            },
            legend: {
                position: 'right',
                labels: {
                    color: axisTextColor,
                    font: {
                        family: 'Arial',
                        size: 12
                    },
                    filter: function(item) {
                        // Only show the mean lines in the legend to avoid clutter
                        return item.text.includes('(Mean)');
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        // Show both mean and standard deviation in the tooltip
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        
                        // Only return detailed info for mean lines
                        if (label.includes('(Mean)')) {
                            return `${label}: ${value.toFixed(2)}`;
                        }
                        // Don't show the standard deviation bounds in tooltips
                        return null;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: axisTextColor,
                    font: {
                        family: 'Arial',
                        size: 12
                    }
                },
                grid: {
                    display: false,
                    color: gridColor
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    color: axisTextColor,
                    font: {
                        family: 'Arial',
                        size: 12
                    }
                },
                grid: {
                    display: true,
                    color: gridColor
                }
            }
        }
    };
}

