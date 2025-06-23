export function createPlotOptions({ width, height }) {
    // Define text color for axis labels and values
    const axisTextColor = "rgb(255, 255, 255)";
    const gridColor = "rgba(255, 255, 255, 0.25)"; 
    
    return {
        responsive: false, // We'll handle dimensions manually since we set width/height
        maintainAspectRatio: false,
        animation: {
            duration: 0 // Disable animations for performance
        },
        plugins: {
            title: {
                display: true,
                text: "Average Extracellular concentration of AimP",
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
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let value = context.parsed.y;
                        return `AimP [nM]: ${value.toFixed(2)}`;
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

