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
                    generateLabels: function(chart) {
                        const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                        // Keep only the main line labels
                        return labels.filter(label => 
                            !label.text.includes('±SD') && label.text !== ''
                        );
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        // Show mean values and add SD info when hovering over mean lines
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        
                        if (label.includes('±SD')) {
                            return null; // Don't show tooltips for SD bands
                        }
                        
                        // Find the corresponding SD dataset
                        const stdDatasetIndex = context.datasetIndex + 2; // Adjust based on your dataset order
                        const stdDataset = context.chart.data.datasets[stdDatasetIndex];
                        
                        if (stdDataset && stdDataset.data && stdDataset.data[context.dataIndex]) {
                            const stdDev = stdDataset.data[context.dataIndex] - value;
                            return `${label}: ${value.toFixed(2)} ± ${stdDev.toFixed(2)}`;
                        }
                        
                        return `${label}: ${value.toFixed(2)}`;
                    }
                }
            },
            // Add a custom plugin to make SD bands translucent on hover for better visibility
            customCanvasBackgroundColor: {
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
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

