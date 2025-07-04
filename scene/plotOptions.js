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
                        // Only show items with non-empty labels
                        return item.text !== '';
                    },
                    filter: function(item) {
                        // Only show the main lines in the legend (exclude SD bounds)
                        return item.text !== '' && !item.text.includes('±SD');
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        // Show mean values only
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        
                        if (label.includes('±SD') || label === '') {
                            return null; // Don't show tooltips for SD bands or empty labels
                        }
                        
                        return `${label}: ${value.toFixed(2)}`;
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

