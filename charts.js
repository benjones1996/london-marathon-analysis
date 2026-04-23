// Interactive Chart.js charts — no external plugins required.
// Reference lines are drawn as additional "line" type datasets.

(function (global) {
  "use strict";

  var RED    = "rgba(204,30,58,0.82)";
  var BLUE   = "rgba(29,100,176,0.82)";
  var AMBER  = "#E08A1E";
  var DARK   = "#0D1B2A";
  var BORDER = "#E5E7EB";
  var MUTED  = "#6B7280";

  var FONT = "'Inter', system-ui, sans-serif";

  var TOOLTIP_STYLE = {
    backgroundColor: "#0D1B2A",
    titleColor: "#fff",
    bodyColor: "rgba(255,255,255,0.82)",
    padding: 10,
    cornerRadius: 6,
    displayColors: false,
  };

  function fmtTime(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    return h + ":" + (m < 10 ? "0" : "") + m;
  }

  function refLine(labels, yVal, color, label) {
    return {
      type: "line",
      label: label || "",
      data: labels.map(function () { return yVal; }),
      borderColor: color || "rgba(13,27,42,0.5)",
      borderWidth: 1.5,
      borderDash: [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 0,
    };
  }

  // ── 1. Split ratio distribution histogram ──────────────────────────────────
  // hist: array of {ratio, count}; median: float
  // Returns Chart instance.
  global.buildDistributionChart = function (canvasId, hist, median) {
    var el = document.getElementById(canvasId);
    if (!el || !hist || !hist.length) return null;

    var labels = hist.map(function (b) { return b.ratio.toFixed(2); });
    var counts = hist.map(function (b) { return b.count; });
    var bgColors = hist.map(function (b) {
      return parseFloat(b.ratio) < 1.0 ? "rgba(29,100,176,0.78)" : "rgba(204,30,58,0.72)";
    });

    median = median || 1.13;
    var evenIdx = labels.indexOf("1.00");
    var medIdx  = 0;
    var bestDist = Infinity;
    for (var i = 0; i < labels.length; i++) {
      var dist = Math.abs(parseFloat(labels[i]) - median);
      if (dist < bestDist) { bestDist = dist; medIdx = i; }
    }

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Runners",
          data: counts,
          backgroundColor: bgColors,
          borderWidth: 0,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        }],
      },
      options: {
        animation: { duration: 600, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 4 } },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            callbacks: {
              title: function (items) { return "Split ratio: " + items[0].label + "\u00d7"; },
              label: function (item) { return item.raw.toLocaleString("en-GB") + " runners"; },
              afterLabel: function (item) {
                return parseFloat(item.label) < 1.0
                  ? "Second half faster (negative split)"
                  : "Second half slower (positive split)";
              },
            },
          }),
        },
        scales: {
          x: {
            title: { display: true, text: "Split ratio  (2nd half \u00f7 1st half)", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: {
              font: { size: 11 },
              maxTicksLimit: 18,
              callback: function (val, idx) {
                if (!labels[idx]) return "";
                var v = parseFloat(labels[idx]);
                return (Math.round(v * 10) % 2 === 0) ? v.toFixed(1) : "";
              },
            },
            grid: { display: false },
          },
          y: {
            title: { display: true, text: "Number of runners", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: {
              font: { size: 11 },
              callback: function (v) { return v >= 1000 ? (v / 1000).toFixed(0) + "k" : v; },
            },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
      plugins: [{
        id: "vlines",
        afterDraw: function (chart) {
          var ctx    = chart.ctx;
          var xScale = chart.scales.x;
          var yScale = chart.scales.y;
          var top    = yScale.top;
          var bottom = yScale.bottom;

          function drawVLine(labelIdx, color, text) {
            if (labelIdx < 0 || labelIdx >= labels.length) return;
            var x = xScale.getPixelForValue(labelIdx);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.strokeStyle = color;
            ctx.lineWidth   = 2;
            ctx.setLineDash([6, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
            // Draw a small background pill so text is legible over bars
            ctx.font = "bold 11px " + FONT;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            var tw = ctx.measureText(text).width;
            var tx = x, ty = top + 5;
            ctx.fillStyle = "rgba(255,255,255,0.82)";
            ctx.fillRect(tx - tw / 2 - 4, ty - 2, tw + 8, 16);
            ctx.fillStyle = color;
            ctx.fillText(text, tx, ty);
            ctx.restore();
          }

          drawVLine(evenIdx, DARK, "Even split (1.0)");
          if (medIdx !== evenIdx) drawVLine(medIdx, AMBER, "Median " + median.toFixed(3));
        },
      }],
    });
  };

  // ── 2. Split ratio by finish band ─────────────────────────────────────────
  // bandArr: array of {band, median, q25, q75, count}
  // Returns Chart instance.
  global.buildBandChart = function (canvasId, bandArr) {
    var el = document.getElementById(canvasId);
    if (!el || !bandArr || !bandArr.length) return null;

    // Filter to common finish bands (exclude elite sub-2:30 if tiny)
    var filtered = bandArr.filter(function (b) { return b.count >= 50; });
    var labels  = filtered.map(function (b) { return b.band; });
    var medians = filtered.map(function (b) { return b.median; });
    var bgColors = medians.map(function (m) {
      if (m <= 1.03) return "rgba(29,100,176,0.85)";
      if (m <= 1.10) return "rgba(29,100,176,0.65)";
      if (m <= 1.15) return "rgba(224,138,30,0.80)";
      return "rgba(204,30,58,0.80)";
    });

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Median split ratio",
            data: medians,
            backgroundColor: bgColors,
            borderRadius: 5,
            order: 1,
          },
          refLine(labels, 1.0, "rgba(13,27,42,0.45)", "Even split"),
        ],
      },
      options: {
        animation: { duration: 600, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            filter: function (item) { return item.datasetIndex === 0; },
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (item) {
                var b = filtered[item.dataIndex];
                return [
                  "Median:  " + b.median.toFixed(3) + "\u00d7",
                  "IQR:  " + b.q25.toFixed(3) + " \u2013 " + b.q75.toFixed(3),
                  "n = " + b.count.toLocaleString("en-GB"),
                ];
              },
            },
          }),
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, maxRotation: 30 },
            grid: { display: false },
          },
          y: {
            min: 0.98,
            title: { display: true, text: "Median split ratio", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: { font: { size: 11 }, callback: function(v) { return v.toFixed(2); } },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
    });
  };

  // ── 3. Yearly trends ──────────────────────────────────────────────────────
  global.buildTrendsChart = function (canvasId, data) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    var byYear = ((data.yearly_trends || {}).by_year) || [];
    if (!byYear.length) return;

    var years    = byYear.map(function (y) { return y.year; });
    var finHours = byYear.map(function (y) { return +(y.median_finish_sec / 3600).toFixed(4); });
    var pctPos   = byYear.map(function (y) { return y.pct_positive; });

    var heatPlugin = {
      id: "heatAnnot2018",
      afterDatasetsDraw: function (chart) {
        var heatIdx = years.indexOf(2018);
        if (heatIdx < 0) return;
        var ctx    = chart.ctx;
        var xScale = chart.scales.x;
        var x      = xScale.getPixelForValue(2018);
        var top    = chart.chartArea.top;
        var bottom = chart.chartArea.bottom;
        ctx.save();
        ctx.strokeStyle = "rgba(224,138,30,0.65)";
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle  = "#E08A1E";
        ctx.font       = "600 10px Inter, system-ui, sans-serif";
        ctx.textAlign  = "center";
        ctx.textBaseline = "top";
        ctx.fillText("2018 heat", x, top + 6);
        ctx.restore();
      }
    };

    new Chart(el, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Median finish time",
            data: finHours,
            yAxisID: "y",
            borderColor: "rgba(29,100,176,0.9)",
            backgroundColor: "rgba(29,100,176,0.08)",
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "rgba(29,100,176,1)",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Positive split rate (%)",
            data: pctPos,
            yAxisID: "y2",
            borderColor: "rgba(204,30,58,0.9)",
            backgroundColor: "rgba(204,30,58,0.06)",
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "rgba(204,30,58,1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        animation: { duration: 900, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { font: { size: 12, family: FONT }, usePointStyle: true, padding: 16 },
          },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            callbacks: {
              label: function (item) {
                var y = byYear[item.dataIndex];
                if (item.datasetIndex === 0)
                  return "Median finish:  " + fmtTime(y.median_finish_sec);
                return "Positive splits:  " + y.pct_positive + "%";
              },
              afterBody: function (items) {
                var y = byYear[items[0].dataIndex];
                return ["\u2014", "Field size:  " + y.finishers.toLocaleString("en-GB")];
              },
            },
          }),
        },
        scales: {
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            position: "left",
            title: { display: true, text: "Median finish time", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: {
              font: { size: 11 },
              callback: function (v) { return fmtTime(Math.round(v * 3600)); },
            },
            grid: { color: BORDER },
            border: { display: false },
          },
          y2: {
            position: "right",
            min: 85, max: 100,
            title: { display: true, text: "Positive split rate (%)", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: { font: { size: 11 }, callback: function (v) { return v + "%"; } },
            grid: { drawOnChartArea: false },
            border: { display: false },
          },
        },
      },
      plugins: [heatPlugin],
    });
  };

  // ── 4. Gender pacing by band ───────────────────────────────────────────────
  global.buildGenderChart = function (canvasId, data) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    var byBand = ((data.gender_pacing || {}).by_band) || [];
    if (!byBand.length) return;

    var labels    = byBand.map(function (b) { return b.band; });
    var menData   = byBand.map(function (b) { return b.men; });
    var womenData = byBand.map(function (b) { return b.women; });

    new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Men",
            data: menData,
            backgroundColor: "rgba(29,100,176,0.80)",
            borderRadius: 3,
            order: 1,
          },
          {
            label: "Women",
            data: womenData,
            backgroundColor: "rgba(204,30,58,0.80)",
            borderRadius: 3,
            order: 1,
          },
          refLine(labels, 1.0, "rgba(13,27,42,0.4)", "Even split"),
        ],
      },
      options: {
        animation: { duration: 900, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { font: { size: 12, family: FONT }, usePointStyle: true, padding: 16,
                      filter: function (item) { return item.datasetIndex < 2; } },
          },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            mode: "index",
            filter: function (item) { return item.datasetIndex < 2; },
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (item) {
                var b = byBand[item.dataIndex];
                if (item.datasetIndex === 0)
                  return "Men:    " + b.men.toFixed(4) + "\u00d7  (n=" + b.n_men.toLocaleString("en-GB") + ")";
                return "Women: " + b.women.toFixed(4) + "\u00d7  (n=" + b.n_women.toLocaleString("en-GB") + ")";
              },
            },
          }),
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, maxRotation: 30 },
            grid: { display: false },
          },
          y: {
            min: 0.95,
            title: { display: true, text: "Median split ratio", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: { font: { size: 11 } },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
    });
  };

  // ── 5. Age group pacing ────────────────────────────────────────────────────
  global.buildAgeChart = function (canvasId, data) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    var byAge = ((data.age_pacing || {}).by_age) || [];
    if (!byAge.length) return;

    var labels  = byAge.map(function (a) { return a.age; });
    var medians = byAge.map(function (a) { return a.median; });

    new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Median split ratio",
            data: medians,
            backgroundColor: "rgba(29,100,176,0.80)",
            borderRadius: 4,
            order: 1,
          },
          refLine(labels, 1.0, "rgba(13,27,42,0.4)", "Even split"),
        ],
      },
      options: {
        animation: { duration: 900, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            filter: function (item) { return item.datasetIndex === 0; },
            callbacks: {
              title: function (items) { return "Age group: " + items[0].label; },
              label: function (item) {
                var a = byAge[item.dataIndex];
                return [
                  "Median:  " + a.median.toFixed(4) + "\u00d7",
                  "IQR:  " + a.q25.toFixed(3) + " \u2013 " + a.q75.toFixed(3),
                  "n = " + a.count.toLocaleString("en-GB"),
                ];
              },
            },
          }),
        },
        scales: {
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            min: 0.95,
            title: { display: true, text: "Median split ratio", font: { family: FONT, size: 12 }, color: MUTED },
            ticks: { font: { size: 11 } },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
    });
  };

  // ── 6. Predictor regression scatter ───────────────────────────────────────
  // Builds a line+scatter chart showing the regression model.
  // Points are regression-predicted values at 5% pace buckets — not raw runner data.
  global.buildPredictorScatter = function (canvasId, pd) {
    var el = document.getElementById(canvasId);
    if (!el || !pd) return null;

    var slope     = pd.regression_slope       || -110.0971;
    var intercept = pd.predicted_slowdown_even || 14.73;

    // Smooth regression line
    var lineData = [];
    for (var xi = 78; xi <= 122; xi++) {
      var xv = xi / 100;
      lineData.push({ x: xv, y: +(intercept + slope * (xv - 1.0)).toFixed(2) });
    }

    // Representative bucket points
    var bucketPcts = [-0.20, -0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15, 0.20];
    var bucketData = bucketPcts.map(function (p) {
      return {
        x: +(1 + p).toFixed(2),
        y: +(intercept + slope * p).toFixed(2),
        pct: p,
      };
    });

    var inst = new Chart(el, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Regression line (r = \u22120.58)",
            data: lineData,
            type: "line",
            borderColor: AMBER,
            borderWidth: 2.5,
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 0,
          },
          {
            label: "Pace bucket",
            data: bucketData,
            backgroundColor: bucketData.map(function (d) {
              return d.pct < 0 ? "rgba(204,30,58,0.85)" : d.pct > 0 ? "rgba(29,100,176,0.85)" : "rgba(224,138,30,0.9)";
            }),
            pointRadius: 7,
            pointHoverRadius: 10,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: "#fff",
            order: 1,
          },
        ],
      },
      options: {
        animation: { duration: 900, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: { size: 12, family: FONT },
              usePointStyle: true,
              padding: 16,
              filter: function (item) { return item.datasetIndex === 0; },
            },
          },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            filter: function (item) { return item.datasetIndex === 1; },
            callbacks: {
              title: function (items) {
                var d = bucketData[items[0].dataIndex];
                var pct = Math.round(d.pct * 100);
                if (pct < 0) return "\u26a0 Started " + Math.abs(pct) + "% faster than peers";
                if (pct > 0) return "\u2713 Started " + pct + "% slower than peers";
                return "\u2192 Started at peer-group median";
              },
              label: function (item) {
                var d = bucketData[item.dataIndex];
                return [
                  "Relative pace:  " + d.x.toFixed(2) + "\u00d7",
                  "Predicted slowdown:  +" + d.y.toFixed(1) + "%",
                ];
              },
              afterLabel: function (item) {
                return bucketData[item.dataIndex].pct < 0
                  ? "Overpacing zone \u2014 higher second-half fade risk"
                  : "Controlled start \u2014 lower fade risk";
              },
            },
          }),
        },
        scales: {
          x: {
            type: "linear",
            min: 0.77,
            max: 1.23,
            title: {
              display: true,
              text: "First-half pace \u00f7 finish-band median  (1.0 = peer group)",
              font: { family: FONT, size: 12 },
              color: MUTED,
            },
            ticks: {
              font: { size: 11 },
              callback: function (v) {
                var pct = Math.round((v - 1) * 100);
                if (pct === 0) return "Median";
                return (pct > 0 ? "+" : "") + pct + "%";
              },
            },
            grid: { color: BORDER },
          },
          y: {
            title: {
              display: true,
              text: "Predicted second-half slowdown (%)",
              font: { family: FONT, size: 12 },
              color: MUTED,
            },
            ticks: {
              font: { size: 11 },
              callback: function (v) { return "+" + v.toFixed(0) + "%"; },
            },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
      plugins: [{
        id: "scatterZones",
        beforeDatasetsDraw: function (chart) {
          var ctx    = chart.ctx;
          var xScale = chart.scales.x;
          var yScale = chart.scales.y;
          var midX   = xScale.getPixelForValue(1.0);
          var left   = xScale.left;
          var right  = xScale.right;
          var top    = yScale.top;
          var bottom = yScale.bottom;

          ctx.save();
          ctx.fillStyle = "rgba(204,30,58,0.055)";
          ctx.fillRect(left, top, midX - left, bottom - top);
          ctx.fillStyle = "rgba(29,100,176,0.055)";
          ctx.fillRect(midX, top, right - midX, bottom - top);

          ctx.beginPath();
          ctx.moveTo(midX, top);
          ctx.lineTo(midX, bottom);
          ctx.strokeStyle = "rgba(13,27,42,0.28)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = "bold 10px " + FONT;
          ctx.textBaseline = "top";
          ctx.fillStyle = "rgba(204,30,58,0.42)";
          ctx.textAlign = "left";
          ctx.fillText("OVERPACING", left + 8, top + 8);
          ctx.fillStyle = "rgba(29,100,176,0.42)";
          ctx.textAlign = "right";
          ctx.fillText("CONTROLLED", right - 8, top + 8);

          // Highlight band driven by bar hover
          var hl = window._predictorHighlight;
          if (hl) {
            var hx1 = xScale.getPixelForValue(hl.xMin);
            var hx2 = xScale.getPixelForValue(hl.xMax);
            ctx.fillStyle = "rgba(224,138,30,0.20)";
            ctx.fillRect(hx1, top, hx2 - hx1, bottom - top);
          }
          ctx.restore();
        },
      }],
    });

    window._predictorScatterInst = inst;
    return inst;
  };

  // ── 7. Predictor bar chart ────────────────────────────────────────────────
  global.buildPredictorBars = function (canvasId, pd) {
    var el = document.getElementById(canvasId);
    if (!el || !pd) return null;

    var slope     = pd.regression_slope       || -110.0971;
    var intercept = pd.predicted_slowdown_even || 14.73;

    var buckets = [
      { label: "\u221220%", pct: -0.20 },
      { label: "\u221215%", pct: -0.15 },
      { label: "\u221210%", pct: -0.10 },
      { label: "\u22125%",  pct: -0.05 },
      { label: "0%",        pct:  0.00 },
      { label: "+5%",       pct:  0.05 },
      { label: "+10%",      pct:  0.10 },
      { label: "+15%",      pct:  0.15 },
      { label: "+20%",      pct:  0.20 },
    ];

    var labels  = buckets.map(function (b) { return b.label; });
    var values  = buckets.map(function (b) { return +(intercept + slope * b.pct).toFixed(2); });
    var xMins   = buckets.map(function (b) { return +(1 + b.pct - 0.028).toFixed(3); });
    var xMaxs   = buckets.map(function (b) { return +(1 + b.pct + 0.028).toFixed(3); });

    var bg = buckets.map(function (b) {
      if (b.pct <= -0.15) return "rgba(204,30,58,0.90)";
      if (b.pct <  0)     return "rgba(204,30,58,0.65)";
      if (b.pct === 0)    return "rgba(224,138,30,0.85)";
      if (b.pct <= 0.10)  return "rgba(29,100,176,0.65)";
      return "rgba(29,100,176,0.90)";
    });
    var bgHover = bg.map(function (c) { return c.replace(/[\d.]+\)$/, "1)"); });

    var inst = new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Predicted slowdown",
          data: values,
          backgroundColor: bg,
          hoverBackgroundColor: bgHover,
          borderRadius: 5,
        }],
      },
      options: {
        animation: { duration: 900, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        onHover: function (event, elements) {
          window._predictorHighlight = elements.length
            ? { xMin: xMins[elements[0].index], xMax: xMaxs[elements[0].index] }
            : null;
          if (window._predictorScatterInst) window._predictorScatterInst.update("none");
        },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            callbacks: {
              title: function (items) {
                var b = buckets[items[0].dataIndex];
                var abs = Math.abs(Math.round(b.pct * 100));
                if (b.pct < 0) return "\u26a0 Started " + abs + "% faster than peers";
                if (b.pct > 0) return "\u2713 Started " + abs + "% slower than peers";
                return "\u2192 Started at peer-group median";
              },
              label: function (item) {
                return "Predicted slowdown:  +" + item.raw.toFixed(1) + "%";
              },
              afterLabel: function (item) {
                return buckets[item.dataIndex].pct < 0
                  ? "Going out faster increases second-half fade"
                  : "Conservative start reduces fade risk";
              },
            },
          }),
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Relative start pace vs peer group",
              font: { family: FONT, size: 12 },
              color: MUTED,
            },
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            min: 0,
            title: {
              display: true,
              text: "Predicted second-half slowdown (%)",
              font: { family: FONT, size: 12 },
              color: MUTED,
            },
            ticks: {
              font: { size: 11 },
              callback: function (v) { return "+" + v + "%"; },
            },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
    });

    el.addEventListener("mouseleave", function () {
      window._predictorHighlight = null;
      if (window._predictorScatterInst) window._predictorScatterInst.update("none");
    });

    window._predictorBarInst = inst;
    return inst;
  };

  // ── Gender gap by band (curiosities section) ──────────────────────────────
  // Shows men − women split ratio difference (in percentage points) per band.
  global.buildGenderGapChart = function (canvasId, data) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    var byBand = ((data.gender_pacing || {}).by_band) || [];
    var filtered = byBand.filter(function (b) { return b.men && b.women; });
    if (!filtered.length) return;

    var labels = filtered.map(function (b) { return b.band; });
    var gaps   = filtered.map(function (b) { return +((b.men - b.women) * 100).toFixed(2); });
    var colors = gaps.map(function (g) {
      if (g > 7)  return "rgba(204,30,58,0.80)";
      if (g > 3)  return "rgba(224,138,30,0.82)";
      return "rgba(29,100,176,0.75)";
    });

    new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Gender gap",
          data: gaps,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP_STYLE, {
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (item) {
                return "Men fade " + item.raw.toFixed(1) + " pp more than women";
              },
            },
          }),
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, maxRotation: 35 },
            grid: { display: false },
          },
          y: {
            min: 0,
            title: { display: true, text: "Men \u2212 women (pp)", font: { family: FONT, size: 11 }, color: MUTED },
            ticks: { font: { size: 10 }, callback: function (v) { return "+" + v; } },
            grid: { color: BORDER },
            border: { display: false },
          },
        },
      },
    });
  };

})(window);
