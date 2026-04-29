document.addEventListener("DOMContentLoaded", function () {

  // ─── Band data ─────────────────────────────────────────────────────────────
  var bands = {
    "sub3": {
      title: "Sub-3:00 Finishers",
      stats: [
        { val: "1.027\u00d7", lbl: "Median split ratio" },
        { val: "Top 1%",      lbl: "Of London finishers" },
        { val: "<5%",         lbl: "Achieve negative split" }
      ],
      text: "Sub-3 runners are the closest to even pacing in the entire field \u2014 yet still average a 2.7% positive split. <strong>Your risk is not the wall at 30K, it\u2019s race-day adrenaline.</strong> Even a 1\u20132% conservative first half at your fitness level is harder to execute than it sounds. Elite amateurs rarely achieve negative splits, so focus on precision rather than banking time."
    },
    "3_330": {
      title: "3:00 \u2013 3:30 Finishers",
      stats: [
        { val: "1.050\u00d7", lbl: "Median split ratio" },
        { val: "Top 5%",      lbl: "Of London finishers" },
        { val: "30\u201335K", lbl: "Key danger segment" }
      ],
      text: "Strong club runners who tend to pace well \u2014 but a 5% second-half fade is still the norm. <strong>The 30\u201335K segment is where even disciplined runners feel it.</strong> Going out just 5% faster than your peers is associated with significantly more fade in this band. Aim for even splits or a very slight negative \u2014 the second half will require real focus regardless."
    },
    "330_4": {
      title: "3:30 \u2013 4:00 Finishers",
      stats: [
        { val: "1.085\u00d7", lbl: "Median split ratio" },
        { val: "Top 15%",     lbl: "Of London finishers" },
        { val: "8\u20139%",   lbl: "Typical second-half fade" }
      ],
      text: "A competitive finish band where pacing control pays off clearly. <strong>Runners who start conservatively relative to their peers finish with significantly smaller fades.</strong> The predictor model finds that going out 10% faster than your peer group costs ~11 extra percentage points of slowdown. If you\u2019re targeting 3:45, don\u2019t run the first half at 3:40 pace \u2014 it rarely ends well."
    },
    "4_430": {
      title: "4:00 \u2013 4:30 Finishers",
      stats: [
        { val: "1.127\u00d7", lbl: "Median split ratio" },
        { val: "Median",       lbl: "Of all London finishers" },
        { val: "30\u201335K", lbl: "Biggest single slowdown" }
      ],
      text: "This is the heartland of the London Marathon field \u2014 you\u2019re right at the median finish time. A 12\u201313% second-half fade is entirely normal for your group, and 30\u201335K is where most of that time is lost. <strong>How you run relative to your peers in the first half matters far more than your absolute pace.</strong> Runners who go out 10% faster than others in this band lose 11+ extra percentage points in the second half. Running the first half feeling slightly too easy is almost always the right call."
    },
    "430_5": {
      title: "4:30 \u2013 5:00 Finishers",
      stats: [
        { val: "1.165\u00d7", lbl: "Median split ratio" },
        { val: "16\u201317%", lbl: "Typical second-half fade" },
        { val: "30\u201335K", lbl: "Danger zone" }
      ],
      text: "A 16\u201317% second-half fade is typical, but there\u2019s real variation \u2014 some manage 1.10\u00d7 while others hit 1.25\u00d7 or more. <strong>The biggest gains come from resisting early race enthusiasm.</strong> London\u2019s fast opening 5K sweeps many runners through at adrenaline pace. Aim to feel controlled and slightly bored at halfway \u2014 the data strongly supports this for runners in this finishing window."
    },
    "5_6": {
      title: "5:00 \u2013 6:00 Finishers",
      stats: [
        { val: "1.190\u00d7", lbl: "Median split ratio" },
        { val: "19%",          lbl: "Typical second-half fade" },
        { val: "Widest",       lbl: "Spread in the field" }
      ],
      text: "This band has the widest variation in pacing \u2014 from controlled 1.10\u00d7 splits to severe 1.30+ fades. <strong>The gender gap in pacing is most visible here: women consistently show more even splits than men at the same finishing speed.</strong> Walking breaks, nutrition timing, and the 30\u201335K wall all play a role. Running the first half feeling very comfortable is well-supported by the data."
    },
    "6plus": {
      title: "6:00+ Finishers",
      stats: [
        { val: "1.197\u00d7", lbl: "Median split ratio" },
        { val: "Diverse",      lbl: "Strategies in this band" },
        { val: "Charity",      lbl: "Dominant entry type" }
      ],
      text: "This band is the most diverse \u2014 charity runners, walkers, and those managing injuries all appear here. <strong>The split ratio reflects total time, not continuous running pace.</strong> For many runners in this bracket, arriving at 30K feeling fresh and able to keep moving is the real goal. The data supports taking the first half very conservatively regardless of pace."
    }
  };

  // ─── Render pace band panel ────────────────────────────────────────────────
  var output = document.getElementById("band-output");

  function renderBand(key) {
    var b = bands[key];
    if (!b || !output) return;

    var statsHtml = "";
    for (var i = 0; i < b.stats.length; i++) {
      statsHtml +=
        '<div>' +
          '<div class="band-stat-val">' + b.stats[i].val + '</div>' +
          '<div class="band-stat-lbl">' + b.stats[i].lbl + '</div>' +
        '</div>';
    }

    output.innerHTML =
      '<div class="band-panel-title">' + b.title + '</div>' +
      '<div class="band-stats">' + statsHtml + '</div>' +
      '<p class="band-tip">' + b.text + '</p>';
  }

  var bandButtons = document.querySelectorAll(".band-btn");
  for (var k = 0; k < bandButtons.length; k++) {
    bandButtons[k].addEventListener("click", function () {
      for (var j = 0; j < bandButtons.length; j++) bandButtons[j].classList.remove("active");
      this.classList.add("active");
      renderBand(this.getAttribute("data-band"));
    });
  }
  renderBand("4_430");

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function set(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function fmt(n)      { return n.toLocaleString("en-GB"); }
  function fmtPct(n)   { return n.toFixed(1) + "%"; }
  function fmtRatio(n) { return n.toFixed(3) + "\u00d7"; }
  function fmtTime(s)  {
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h + ":" + (m < 10 ? "0" : "") + m;
  }

  // ─── Chart instances (destroyed & rebuilt on gender change) ───────────────
  var distChartInst = null;
  var bandChartInst = null;

  function getSlice(gender) {
    var data = insightsData;
    var gd   = data.gender_breakdown || {};
    if (gender === "all") {
      return {
        hist:   (data.split_distribution || {}).histogram,
        median: (data.split_distribution || {}).median_split_ratio,
        byBand: (data.split_by_band || {}).by_band,
      };
    }
    var g = gd[gender] || {};
    return {
      hist:   g.histogram,
      median: g.median_split_ratio,
      byBand: g.by_band,
    };
  }

  function refreshCharts(gender) {
    if (typeof buildDistributionChart !== "function") return;
    var s = getSlice(gender);
    if (distChartInst) { distChartInst.destroy(); distChartInst = null; }
    if (bandChartInst) { bandChartInst.destroy(); bandChartInst = null; }
    distChartInst = buildDistributionChart("chart-distribution", s.hist, s.median);
    bandChartInst = buildBandChart("chart-by-band", s.byBand);
  }

  // ─── Gender state ──────────────────────────────────────────────────────────
  var currentGender = "all";
  var insightsData  = null;

  function applyGender(gender) {
    currentGender = gender;
    if (!insightsData) return;

    var data = insightsData;
    var gd   = data.gender_breakdown || {};

    if (gender === "all") {
      var trends = data.yearly_trends      || {};
      var dist   = data.split_distribution || {};
      var bdata  = data.split_by_band      || {};
      var gpace  = data.gender_pacing      || {};

      if (trends.total_finishers_analysed) set("stat-runners", fmt(trends.total_finishers_analysed));
      set("stat-runners-lbl", "Finishers analysed");
      if (dist.pct_positive_split != null)  set("stat-positive", fmtPct(dist.pct_positive_split));
      if (trends.median_finish_sec != null)  set("stat-median",   fmtTime(trends.median_finish_sec));
      if (dist.median_split_ratio  != null)  set("stat-ratio",    fmtRatio(dist.median_split_ratio));
      if (dist.pct_positive_split  != null)  set("find-positive", fmtPct(dist.pct_positive_split));
      if (dist.median_split_ratio  != null)  set("find-ratio",    fmtRatio(dist.median_split_ratio));
      if (bdata.split_ratio_fastest_band != null && bdata.split_ratio_slowest_band != null)
        set("find-band-diff", (bdata.split_ratio_slowest_band - bdata.split_ratio_fastest_band).toFixed(3) + "\u00d7 gap");
      if (gpace.median_split_ratio_men != null && gpace.median_split_ratio_women != null)
        set("find-gender-diff", fmtRatio(gpace.median_split_ratio_women) + " vs " + fmtRatio(gpace.median_split_ratio_men));

    } else {
      var g = gd[gender] || {};
      if (g.n) { set("stat-runners", fmt(g.n)); set("stat-runners-lbl", (gender === "men" ? "Male" : "Female") + " finishers analysed"); }
      if (g.pct_positive_split != null) set("stat-positive", fmtPct(g.pct_positive_split));
      if (g.median_finish_sec  != null) set("stat-median",   fmtTime(g.median_finish_sec));
      if (g.median_split_ratio != null) set("stat-ratio",    fmtRatio(g.median_split_ratio));
      if (g.pct_positive_split != null) set("find-positive", fmtPct(g.pct_positive_split));
      if (g.median_split_ratio != null) set("find-ratio",    fmtRatio(g.median_split_ratio));
      set("find-gender-diff", gender === "men" ? "1.136\u00d7 (men)" : "1.118\u00d7 (women)");

      if (g.by_band && g.by_band.length >= 2) {
        var sorted = g.by_band.slice().sort(function (a, b) { return a.median - b.median; });
        var gap = sorted[sorted.length - 1].median - sorted[0].median;
        set("find-band-diff", gap.toFixed(3) + "\u00d7 gap");
      }
    }

    refreshCharts(gender);
    runCalculator();
  }

  // ─── Gender toggle wiring (nav + hero, kept in sync) ──────────────────────
  function setActiveGender(gender) {
    var all = document.querySelectorAll(".gender-btn, .nav-gender-btn");
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle("active", all[i].getAttribute("data-gender") === gender);
    }
    applyGender(gender);
  }

  var genderButtons = document.querySelectorAll(".gender-btn, .nav-gender-btn");
  for (var g = 0; g < genderButtons.length; g++) {
    genderButtons[g].addEventListener("click", function () {
      setActiveGender(this.getAttribute("data-gender"));
    });
  }

  // ─── Race Strategy Calculator ─────────────────────────────────────────────
  function getBandMedian(targetSec) {
    // Use gender-specific by_band when a gender is selected; fall back to all-finisher data.
    // Women's data has no Sub-2:30 entry (idx shift of -1 vs men/all).
    var gd = (insightsData || {}).gender_breakdown || {};
    var byBand;
    if (currentGender === "men")   byBand = (gd.men   || {}).by_band;
    if (currentGender === "women") byBand = (gd.women || {}).by_band;
    if (!byBand || !byBand.length) byBand = ((insightsData || {}).split_by_band || {}).by_band || [];

    // Band boundaries (seconds) → index into the all/men array (women missing Sub-2:30 at idx 0)
    var idx;
    if (currentGender === "women") {
      // Women's by_band: [2:30–3:00, 3:00–3:30, 3:30–4:00, 4:00–4:30, 4:30–5:00, 5:00–6:00, 6:00+]
      if      (targetSec < 10800) idx = 0;
      else if (targetSec < 12600) idx = 1;
      else if (targetSec < 14400) idx = 2;
      else if (targetSec < 16200) idx = 3;
      else if (targetSec < 18000) idx = 4;
      else if (targetSec < 21600) idx = 5;
      else idx = 6;
    } else {
      // All / men: [Sub-2:30, 2:30–3:00, 3:00–3:30, 3:30–4:00, 4:00–4:30, 4:30–5:00, 5:00–6:00, 6:00+]
      if      (targetSec < 9000)  idx = 0;
      else if (targetSec < 10800) idx = 1;
      else if (targetSec < 12600) idx = 2;
      else if (targetSec < 14400) idx = 3;
      else if (targetSec < 16200) idx = 4;
      else if (targetSec < 18000) idx = 5;
      else if (targetSec < 21600) idx = 6;
      else idx = 7;
    }
    return byBand[idx] ? byBand[idx].median : 1.1206;
  }

  function fmtHMS(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = Math.round(s % 60);
    return h + ":" + (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function fmtDiff(s) {
    var sign = s >= 0 ? "+" : "−";
    s = Math.abs(s);
    var m = Math.floor(s / 60);
    var sec = Math.round(s % 60);
    return sign + m + "m " + (sec < 10 ? "0" : "") + sec + "s";
  }

  function runCalculator() {
    if (!insightsData) return;
    var pd = insightsData.pacing_predictor;
    if (!pd) return;

    var targetSec = parseInt(document.getElementById("calc-target").value, 10);
    var relPct    = parseInt(document.getElementById("calc-pace-slider").value, 10);
    var relPace   = 1.0 + relPct / 100;

    // Update display label
    var display = document.getElementById("calc-pace-display");
    if (display) {
      if (relPct === 0) display.textContent = "Even pace (0%)";
      else if (relPct < 0) display.textContent = Math.abs(relPct) + "% faster than peers";
      else display.textContent = relPct + "% slower than peers";
    }

    var bandMedian   = getBandMedian(targetSec);
    var peerFirstH   = targetSec / (1 + bandMedian);
    var yourFirstH   = peerFirstH * relPace;

    // Predicted slowdown: baseSlowdown + slope*(relPace-1)
    // slope=-110.0971 per unit (i.e. per 100%), predicted_slowdown_even=14.73%
    var predictedPct = pd.predicted_slowdown_even + pd.regression_slope * (relPace - 1.0);
    predictedPct = Math.max(0, Math.min(55, predictedPct));

    var yourSecondH  = yourFirstH * (1 + predictedPct / 100);
    var yourFinish   = yourFirstH + yourSecondH;
    var timeDiff     = yourFinish - targetSec;

    var statusClass = timeDiff > 600 ? "calc-status-bad" : timeDiff > 180 ? "calc-status-warn" : "calc-status-ok";
    var diffClass   = timeDiff > 120 ? "calc-status-warn" : "calc-status-ok";
    if (timeDiff > 480) diffClass = "calc-status-bad";

    // Fill bar: 0%=green, 25%=amber, 50%+=full red
    var fillPct = Math.min(100, (predictedPct / 30) * 100);

    var out = document.getElementById("calc-output");
    if (!out) return;
    out.innerHTML =
      '<div class="calc-result-grid">' +
        '<div>' +
          '<div class="calc-result-val">' + fmtHMS(yourFirstH) + '</div>' +
          '<div class="calc-result-lbl">Your first half</div>' +
        '</div>' +
        '<div>' +
          '<div class="calc-result-val">' + fmtHMS(yourSecondH) + '</div>' +
          '<div class="calc-result-lbl">Predicted second half</div>' +
        '</div>' +
        '<div>' +
          '<div class="calc-result-val ' + statusClass + '">' + fmtHMS(yourFinish) + '</div>' +
          '<div class="calc-result-lbl">Predicted finish</div>' +
        '</div>' +
        '<div>' +
          '<div class="calc-result-val ' + diffClass + '">' + fmtDiff(timeDiff) + '</div>' +
          '<div class="calc-result-lbl">vs target</div>' +
        '</div>' +
      '</div>' +
      '<div class="calc-fade-section">' +
        '<div class="calc-fade-label">Predicted second-half slowdown: <strong>' + predictedPct.toFixed(1) + '%</strong>' +
          '<span class="calc-gender-note"> &mdash; calibrated to ' + (currentGender === "men" ? "male" : currentGender === "women" ? "female" : "all-finisher") + ' pace norms</span>' +
        '</div>' +
        '<div class="calc-fade-track"><div class="calc-fade-fill" style="width:' + fillPct + '%"></div></div>' +
      '</div>';
  }

  function initCalculator() {
    var sel = document.getElementById("calc-target");
    var sld = document.getElementById("calc-pace-slider");
    if (!sel || !sld) return;
    sel.addEventListener("change", runCalculator);
    sld.addEventListener("input",  runCalculator);
    runCalculator();
  }

  // ─── Load data from inline <script type="application/json"> ───────────────
  // Works on file://, localhost, and GitHub Pages — no fetch needed.
  var inlineEl = document.getElementById("insights-data");
  if (inlineEl) {
    try {
      insightsData = JSON.parse(inlineEl.textContent);
      applyGender("all");
      // Finding 3 charts are all-finisher model — built once, not rebuilt on gender toggle
      if (typeof buildPredictorScatter === "function") {
        buildPredictorScatter("chart-predictor-scatter", insightsData.pacing_predictor);
        buildPredictorBars("chart-predictor-bars", insightsData.pacing_predictor);
      }
      initCalculator();

      // ─── Curiosities: dynamic heat-year stat ──────────────────────────────
      (function () {
        var byYear = ((insightsData.yearly_trends || {}).by_year) || [];
        var heat = null, others = [];
        for (var i = 0; i < byYear.length; i++) {
          if (byYear[i].year === 2018) heat = byYear[i];
          else others.push(byYear[i].median_finish_sec);
        }
        if (heat && others.length) {
          var avg = others.reduce(function (s, v) { return s + v; }, 0) / others.length;
          var deltaSec = Math.round(heat.median_finish_sec - avg);
          var deltaMins = Math.floor(deltaSec / 60);
          var el = document.getElementById("fun-heat-delta");
          if (el) el.textContent = "+" + deltaMins + " min";
          var elPct = document.getElementById("fun-heat-pct");
          if (elPct) elPct.textContent = heat.pct_positive + "%";
        }
      })();

      if (typeof buildGenderGapChart === "function") {
        buildGenderGapChart("chart-gender-gap", insightsData);
      }
    } catch (e) {
      console.error("Failed to parse inline insights data:", e);
    }
  }

});
