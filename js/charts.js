/**
 * Charts Engine for WHO Growth Curves & Child Financial Visualizations
 * Powered by Chart.js with Warm & Earthy Organic Minimalist Theme
 */

class GrowthChartManager {
  constructor() {
    this.growthChartInstance = null;
    this.expenseDonutInstance = null;
    this.expenseBarInstance = null;
  }

  // Render or Update WHO Growth Chart (Height, Weight, Head Circumference)
  renderGrowthChart(canvasId, stageData, metric = "height") {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined" || !stageData) return;

    const ctx = canvas.getContext("2d");
    const who = stageData.growthChart || stageData.growthWHO || {};
    if (!who || !who.labels) return;

    let dataSetObj;
    let unit = "cm";
    let metricLabel = "Chiều cao của bé";

    const defaultSeries = { child: [], whoP50: [], whoP97: [], whoP3: [] };

    if (metric === "weight") {
      dataSetObj = who.weight || defaultSeries;
      unit = "kg";
      metricLabel = "Cân nặng của bé";
    } else if (metric === "headCirc") {
      dataSetObj = who.headCirc || who.height || defaultSeries;
      unit = "cm";
      metricLabel = "Vòng đầu / BMI của bé";
    } else {
      dataSetObj = who.height || defaultSeries;
      unit = "cm";
      metricLabel = "Chiều cao của bé";
    }

    if (this.growthChartInstance) {
      this.growthChartInstance.destroy();
    }

    this.growthChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: who.labels || [],
        datasets: [
          {
            label: metricLabel,
            data: dataSetObj.child || [],
            borderColor: "#33251F",
            backgroundColor: "rgba(141, 160, 111, 0.18)",
            borderWidth: 3.5,
            pointBackgroundColor: "#33251F",
            pointBorderColor: "#FFFFFF",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.35,
            order: 1
          },
          {
            label: "WHO Chuẩn Trung bình (P50)",
            data: dataSetObj.whoP50 || [],
            borderColor: "#8DA06F",
            borderDash: [5, 5],
            borderWidth: 2.2,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
            order: 2
          },
          {
            label: "WHO Ngưỡng trên (P97)",
            data: dataSetObj.whoP97 || [],
            borderColor: "rgba(245, 184, 66, 0.65)",
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
            order: 3
          },
          {
            label: "WHO Ngưỡng dưới (P3)",
            data: dataSetObj.whoP3 || [],
            borderColor: "rgba(233, 115, 50, 0.55)",
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
            order: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false // We use custom HTML legend matching mockup style
          },
          tooltip: {
            backgroundColor: "rgba(51, 37, 31, 0.95)",
            padding: 10,
            cornerRadius: 10,
            titleFont: { family: "'Outfit', sans-serif", size: 12, weight: "bold" },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callbacks: {
              label: function(context) {
                if (context.raw === null || context.raw === undefined) return null;
                return ` ${context.dataset.label}: ${context.raw} ${unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: "600" },
              color: "#82776E"
            }
          },
          y: {
            grid: { color: "#ECE6DD" },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: "600" },
              color: "#82776E",
              callback: val => `${val} ${unit}`
            }
          }
        }
      }
    });
  }

  // Render Expense Donut Chart
  renderExpenseDonut(canvasId, stageData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined" || !stageData || !stageData.expenses) return;

    const ctx = canvas.getContext("2d");
    const exp = stageData.expenses;
    const categories = exp.categories || [];
    const labels = categories.map(c => c.name);
    const data = categories.map(c => c.percent);
    const colors = categories.map(c => c.color);

    if (this.expenseDonutInstance) {
      this.expenseDonutInstance.destroy();
    }

    this.expenseDonutInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: "#FFFFFF",
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(51, 37, 31, 0.95)",
            padding: 8,
            cornerRadius: 10,
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }

  // Render Monthly Expense Trend Bar Chart
  renderExpenseBar(canvasId, stageData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined" || !stageData || !stageData.expenses) return;

    const ctx = canvas.getContext("2d");
    const exp = stageData.expenses;
    const monthlyHistory = exp.monthlyHistory || [];
    const labels = monthlyHistory.map(m => m.month);
    const data = monthlyHistory.map(m => m.amount);

    if (this.expenseBarInstance) {
      this.expenseBarInstance.destroy();
    }

    this.expenseBarInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Chi tiêu (nghìn VNĐ)",
            data: data,
            backgroundColor: "#8DA06F",
            borderRadius: 8,
            hoverBackgroundColor: "#748756"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(51, 37, 31, 0.95)",
            padding: 8,
            cornerRadius: 10,
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callbacks: {
              label: function(context) {
                return ` Chi tiêu: ${(context.raw * 1000).toLocaleString("vi-VN")} đ`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
              color: "#82776E"
            }
          },
          y: {
            grid: { color: "#ECE6DD" },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
              color: "#82776E",
              callback: val => `${val / 1000} tr`
            }
          }
        }
      }
    });
  }
}

window.chartManager = new GrowthChartManager();
