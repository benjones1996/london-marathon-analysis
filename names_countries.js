// Chart builders for names.html and countries.html
// Consistent with charts.js patterns — no new libraries.

(function (global) {
  "use strict";

  var RED   = "rgba(204,30,58,0.82)";
  var BLUE  = "rgba(29,100,176,0.82)";
  var AMBER = "rgba(224,138,30,0.85)";
  var TEAL  = "rgba(16,124,100,0.82)";
  var DARK  = "#0D1B2A";
  var MUTED = "#6B7280";
  var FONT  = "'Inter', system-ui, sans-serif";

  var TOOLTIP = {
    backgroundColor: DARK,
    titleColor: "#fff",
    bodyColor: "rgba(255,255,255,0.82)",
    padding: 10,
    cornerRadius: 6,
    displayColors: false,
  };

  function fmtHMS(s) {
    s = Math.round(s);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    return h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  function yAxis(maxVal) {
    return {
      grid: { display: false },
      ticks: {
        font: { family: FONT, size: 12 },
        color: DARK,
        maxRotation: 0,
      },
    };
  }

  function xAxis(label) {
    return {
      grid: { color: "rgba(229,231,235,0.8)" },
      ticks: {
        font: { family: FONT, size: 11 },
        color: MUTED,
      },
      title: label ? {
        display: true,
        text: label,
        color: MUTED,
        font: { family: FONT, size: 10 },
      } : undefined,
    };
  }

  // ── Horizontal bar: name frequency ────────────────────────────────────────
  global.buildNameFreqChart = function (canvasId, items, color) {
    var el = document.getElementById(canvasId);
    if (!el) return;
    var labels = items.map(function (d) { return d.name; }).reverse();
    var counts = items.map(function (d) { return d.count; }).reverse();
    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: color,
          borderRadius: 3,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP, {
            callbacks: {
              label: function (ctx) {
                return ctx.raw.toLocaleString() + " runners";
              },
            },
          }),
        },
        scales: {
          x: xAxis("Number of runners"),
          y: yAxis(),
        },
      },
    });
  };

  // ── Horizontal bar: fastest / slowest names ───────────────────────────────
  global.buildNameSpeedChart = function (canvasId, items, color) {
    var el = document.getElementById(canvasId);
    if (!el) return;
    // items ordered fastest→slowest; for slowest chart pass in reverse
    var labels = items.map(function (d) { return d.name; }).reverse();
    var avgs   = items.map(function (d) { return d.avg_sec; }).reverse();
    var counts = items.map(function (d) { return d.count; }).reverse();

    // x-axis: show as h:mm time
    var minVal = Math.min.apply(null, avgs);
    var maxVal = Math.max.apply(null, avgs);
    var pad = (maxVal - minVal) * 0.15;

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: avgs,
          backgroundColor: color,
          borderRadius: 3,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP, {
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (ctx) {
                var idx = labels.length - 1 - ctx.dataIndex;
                return "Avg: " + fmtHMS(ctx.raw);
              },
              afterLabel: function (ctx) {
                var idx = labels.length - 1 - ctx.dataIndex;
                return "n = " + counts[ctx.dataIndex].toLocaleString() + " runners";
              },
            },
          }),
        },
        scales: {
          x: {
            min: Math.floor((minVal - pad) / 60) * 60,
            max: Math.ceil((maxVal + pad) / 60) * 60,
            grid: { color: "rgba(229,231,235,0.8)" },
            ticks: {
              font: { family: FONT, size: 11 },
              color: MUTED,
              callback: function (v) {
                var h = Math.floor(v / 3600);
                var m = Math.floor((v % 3600) / 60);
                return h + ":" + String(m).padStart(2, "0");
              },
            },
            title: {
              display: true,
              text: "Average finish time",
              color: MUTED,
              font: { family: FONT, size: 10 },
            },
          },
          y: yAxis(),
        },
      },
    });
  };

  // ── Horizontal bar: fastest countries ─────────────────────────────────────
  global.buildFastestCountriesChart = function (canvasId, items) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    // Items arrive ordered fastest→slowest; reverse for bottom-to-top display
    var labels = items.map(function (d) { return d.nat; }).reverse();
    var avgs   = items.map(function (d) { return d.avg_sec; }).reverse();
    var counts = items.map(function (d) { return d.count; }).reverse();

    var minVal = avgs[0];
    var maxVal = avgs[avgs.length - 1];
    var pad = (maxVal - minVal) * 0.18;

    var colors = avgs.map(function (v) {
      var t = (v - minVal) / (maxVal - minVal);
      var r = Math.round(29  + t * (204 - 29));
      var g = Math.round(100 + t * (30  - 100));
      var b = Math.round(176 + t * (58  - 176));
      return "rgba(" + r + "," + g + "," + b + ",0.82)";
    });

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: avgs,
          backgroundColor: colors,
          borderRadius: 3,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP, {
            callbacks: {
              title: function (it) { return it[0].label; },
              label: function (ctx) { return "Avg: " + fmtHMS(ctx.raw); },
              afterLabel: function (ctx) {
                return "n = " + counts[ctx.dataIndex].toLocaleString() + " runners";
              },
            },
          }),
        },
        scales: {
          x: {
            min: Math.floor((minVal - pad) / 60) * 60,
            max: Math.ceil((maxVal + pad) / 60) * 60,
            grid: { color: "rgba(229,231,235,0.8)" },
            ticks: {
              font: { family: FONT, size: 11 },
              color: MUTED,
              callback: function (v) {
                var h = Math.floor(v / 3600);
                var m = Math.floor((v % 3600) / 60);
                return h + ":" + String(m).padStart(2, "0");
              },
            },
            title: {
              display: true,
              text: "Average finish time",
              color: MUTED,
              font: { family: FONT, size: 10 },
            },
          },
          y: yAxis(),
        },
      },
    });
  };

  // ── Diverging bar: vs global average ──────────────────────────────────────
  global.buildVsGlobalChart = function (canvasId, items) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    // Sort by vs_min ascending (fastest left, slowest right — but we'll do horizontal so fastest at bottom)
    var sorted = items.slice().sort(function (a, b) { return b.vs_min - a.vs_min; });

    var labels = sorted.map(function (d) { return d.nat; });
    var values = sorted.map(function (d) { return d.vs_min; });
    var counts = sorted.map(function (d) { return d.count; });

    var colors = values.map(function (v) {
      return v < 0 ? BLUE : RED;
    });

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP, {
            callbacks: {
              title: function (it) { return it[0].label; },
              label: function (ctx) {
                var v = ctx.raw;
                var sign = v < 0 ? "" : "+";
                return sign + v.toFixed(1) + " min vs global avg";
              },
              afterLabel: function (ctx) {
                return "n = " + counts[ctx.dataIndex].toLocaleString() + " runners";
              },
            },
          }),
        },
        scales: {
          x: {
            grid: { color: "rgba(229,231,235,0.8)" },
            ticks: {
              font: { family: FONT, size: 11 },
              color: MUTED,
              callback: function (v) {
                return (v >= 0 ? "+" : "") + v + " min";
              },
            },
            title: {
              display: true,
              text: "Minutes vs global average (4:32)",
              color: MUTED,
              font: { family: FONT, size: 10 },
            },
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: FONT, size: 11 }, color: DARK },
          },
        },
      },
    });
  };

  // ── Horizontal bar: elite overindex ───────────────────────────────────────
  global.buildEliteOverindexChart = function (canvasId, items, overallPct) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    var labels    = items.map(function (d) { return d.nat; }).reverse();
    var elitePcts = items.map(function (d) { return d.elite_pct; }).reverse();
    var totals    = items.map(function (d) { return d.total; }).reverse();
    var elites    = items.map(function (d) { return d.elite; }).reverse();
    var overindex = items.map(function (d) { return d.overindex; }).reverse();

    var colors = elitePcts.map(function (p) {
      return p > overallPct * 1.5 ? TEAL : "rgba(16,124,100,0.55)";
    });

    // Reference line dataset at overallPct
    var refData = labels.map(function () { return overallPct; });

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            type: "bar",
            label: "% sub-3:00",
            data: elitePcts,
            backgroundColor: colors,
            borderRadius: 3,
            borderSkipped: false,
            order: 1,
          },
          {
            type: "line",
            label: "Field average",
            data: refData,
            borderColor: "rgba(204,30,58,0.7)",
            borderWidth: 1.5,
            borderDash: [5, 3],
            pointRadius: 0,
            fill: false,
            order: 0,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP, {
            filter: function (item) { return item.datasetIndex === 0; },
            callbacks: {
              title: function (it) { return it[0].label; },
              label: function (ctx) {
                return ctx.raw.toFixed(1) + "% finished sub-3:00";
              },
              afterLabel: function (ctx) {
                var oi = overindex[ctx.dataIndex];
                var n  = elites[ctx.dataIndex];
                return [
                  oi.toFixed(1) + "\u00d7 the field average",
                  "n = " + n + " sub-3 runners",
                ];
              },
            },
          }),
        },
        scales: {
          x: {
            grid: { color: "rgba(229,231,235,0.8)" },
            ticks: {
              font: { family: FONT, size: 11 },
              color: MUTED,
              callback: function (v) { return v + "%"; },
            },
            title: {
              display: true,
              text: "% of country's runners finishing sub-3:00",
              color: MUTED,
              font: { family: FONT, size: 10 },
            },
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: FONT, size: 11 }, color: DARK },
          },
        },
      },
    });
  };

  // ── Horizontal bar: elite field by country ───────────────────────────────
  // items: [{nat, count, avg_sec, min_sec}] sorted by count desc
  global.buildEliteFieldChart = function (canvasId, items) {
    var el = document.getElementById(canvasId);
    if (!el) return;

    var labels   = items.map(function (d) { return d.nat; }).reverse();
    var counts   = items.map(function (d) { return d.count; }).reverse();
    var avgSecs  = items.map(function (d) { return d.avg_sec; }).reverse();
    var minSecs  = items.map(function (d) { return d.min_sec; }).reverse();

    // Colour by avg time: fast = teal, slow → grey-blue
    var minAvg = Math.min.apply(null, avgSecs);
    var maxAvg = Math.max.apply(null, avgSecs);
    var colors = avgSecs.map(function (v) {
      var t = (v - minAvg) / (maxAvg - minAvg);
      // fast=teal(16,124,100), slow=blue-grey(100,130,170)
      var r = Math.round(16  + t * (100 - 16));
      var g = Math.round(124 + t * (130 - 124));
      var b = Math.round(100 + t * (170 - 100));
      return "rgba(" + r + "," + g + "," + b + ",0.82)";
    });

    return new Chart(el, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderRadius: 3,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, TOOLTIP, {
            callbacks: {
              title: function (it) { return it[0].label; },
              label: function (ctx) {
                return ctx.raw + " elite appearances";
              },
              afterLabel: function (ctx) {
                var i = ctx.dataIndex;
                var h = Math.floor(avgSecs[i] / 3600);
                var m = Math.floor((avgSecs[i] % 3600) / 60);
                var s = avgSecs[i] % 60;
                var avgFmt = h + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
                var mh = Math.floor(minSecs[i] / 3600);
                var mm = Math.floor((minSecs[i] % 3600) / 60);
                var ms = minSecs[i] % 60;
                var minFmt = mh + ":" + String(mm).padStart(2,"0") + ":" + String(ms).padStart(2,"0");
                return ["Avg: " + avgFmt, "Best: " + minFmt];
              },
            },
          }),
        },
        scales: {
          x: {
            grid: { color: "rgba(229,231,235,0.8)" },
            ticks: {
              font: { family: FONT, size: 11 },
              color: MUTED,
              callback: function (v) { return v; },
            },
            title: {
              display: true,
              text: "Elite appearances across 2014–2025",
              color: MUTED,
              font: { family: FONT, size: 10 },
            },
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: FONT, size: 12 }, color: DARK },
          },
        },
      },
    });
  };

})(typeof window !== "undefined" ? window : global);
