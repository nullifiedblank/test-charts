// Global configuration for Chart.js charts
Chart.defaults.datasets.line.borderWidth = 1.5
Chart.defaults.datasets.line.pointStyle = 'circle'
Chart.defaults.datasets.line.pointRadius = 0
Chart.defaults.datasets.line.pointHoverRadius = 4
Chart.defaults.datasets.line.tension = 0.5
Chart.defaults.datasets.line.fill = true
Chart.defaults.interaction.mode = 'index'
Chart.defaults.interaction.axis = 'x'
Chart.defaults.interaction.intersect = false
Chart.defaults.plugins.tooltip.mode = 'index'
Chart.defaults.plugins.tooltip.intersect = false
Chart.defaults.plugins.tooltip.caretSize = 0
Chart.defaults.plugins.legend.display = false
Chart.defaults.plugins.tooltip.padding = 16
Chart.defaults.plugins.tooltip.boxPadding = 8
Chart.defaults.plugins.tooltip.bodySpacing = 6
Chart.defaults.plugins.tooltip.titleSpacing = 6
Chart.defaults.plugins.tooltip.titleMarginBottom = 8
Chart.defaults.maintainAspectRatio = false
Chart.defaults.responsive = true
Chart.defaults.animation.duration = 300

Chart.defaults.font.family = 'Urania';

// axis x
Chart.defaults.scales.category ??= {};
Chart.defaults.scales.category.grid ??= {};
Chart.defaults.scales.category.ticks ??= {};
Chart.defaults.scales.category.ticks.font ??= {};

Chart.defaults.scales.category.grid.color = '#DEE8EE';
Chart.defaults.scales.category.ticks.color = '#818DA0';
Chart.defaults.scales.category.ticks.font.size = 12;

// axis y
Chart.defaults.scales.linear ??= {};
Chart.defaults.scales.linear.grid ??= {};
Chart.defaults.scales.linear.ticks ??= {};
Chart.defaults.scales.linear.ticks.font ??= {};

Chart.defaults.scales.linear.grid.color = '#DEE8EE';
Chart.defaults.scales.linear.ticks.color = '#818DA0';
Chart.defaults.scales.linear.ticks.font.size = 12;

// Custom animation for the y-axis to animate from the bottom of the chart area
Chart.defaults.animations = {
  y: {
    type: 'number',
    easing: 'easeOutCubic',
    duration: 300,
    from: (ctx) => {
      if (ctx.type === 'data') {
        const yScale = ctx.chart.scales.y;
        return yScale.getPixelForValue(yScale.min);
      }
    },
  },
};

// Custom positioner for tooltip to display it in the middle of the chart area, and with an offset form the points axis
Chart.Tooltip.positioners.fixedMiddle = function (items) {
  if (!items.length) return false;
  const chart = this.chart;
  const chartArea = chart.chartArea;
  const element = items[0].element;
  const midX = (chartArea.left + chartArea.right) / 2;
  const offset = 6;
  const position = {
    x: element.x,
    y: (chartArea.top + chartArea.bottom) / 2
  };

  if (element.x <= midX) {
    position.x += offset;
    position.xAlign = 'left';
  } else {
    position.x -= offset;
    position.xAlign = 'right';
  }

  return position;
};

Chart.defaults.plugins.tooltip.position = 'fixedMiddle';

// Function to pad the first and last labels of a chart with spaces
function padEdgeLabels(
  labels,
  padL = "\u2003\u2003\u2003",
  padR = "\u2003\u2003\u2003"
  ) {
    if (!labels || labels.length < 2) return labels;
    const padded = [...labels];
    padded[0] = padL + padded[0];
    padded[padded.length - 1] = padded[padded.length - 1] + padR;
    return padded;
}
window.padEdgeLabels = padEdgeLabels;

// Create a gradient fill for the line chart
window.createLineFillGradient = function (context, baseColor) {
  const chart = context.chart;
  
  // Find the dataset with the highest single value
  let maxVal = -Infinity;
  let maxDatasetIndex = -1;

  if (chart.data && chart.data.datasets) {
    chart.data.datasets.forEach((dataset, index) => {
      
      if (typeof chart.isDatasetVisible === 'function' && !chart.isDatasetVisible(index)) {
        return;
      }

      const data = dataset.data || [];
      if (data.length === 0) return;
      
      const localMax = Math.max(...data);
      if (localMax > maxVal) {
        maxVal = localMax;
        maxDatasetIndex = index;
      }
    });
  }
  
  if (maxDatasetIndex !== -1 && context.datasetIndex !== maxDatasetIndex) {
    return 'transparent';
  }

  const { ctx, chartArea } = chart;
  if (!chartArea) return baseColor;

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom
  );
  gradient.addColorStop(0, `${baseColor}35`);
  gradient.addColorStop(0.75, `${baseColor}00`);
  return gradient;
};

