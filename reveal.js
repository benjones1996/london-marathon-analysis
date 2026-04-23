(function () {
  "use strict";

  // Hard fallback: no IntersectionObserver support → reveal everything immediately
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".fade-up").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  // Elements to animate. These class names all exist in the current HTML.
  var SELECTORS = [
    ".finding-card",
    ".chart-block",
    ".canvas-wrap",
    ".method-card",
    ".curiosity-card",
    ".band-panel",
    ".calc-panel",
    ".limitation",
    ".future-list > li",
  ];

  // 1. Tag every target element with .fade-up  → CSS makes it opacity:0, translateY(50px)
  var elements = [];
  SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (!el.classList.contains("fade-up")) {
        el.classList.add("fade-up");
        elements.push(el);
      }
    });
  });

  // 2. Stagger cards within grouped grids (cascade effect when a whole section enters)
  [".findings-grid", ".method-grid", ".curiosities-grid"].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (group) {
      Array.from(group.children).forEach(function (child, i) {
        child.style.transitionDelay = (i * 90) + "ms";
      });
    });
  });
  document.querySelectorAll(".limitation").forEach(function (el, i) {
    el.style.transitionDelay = (i * 55) + "ms";
  });
  document.querySelectorAll(".future-list > li").forEach(function (el, i) {
    el.style.transitionDelay = (i * 65) + "ms";
  });

  // 3. Observer — fires when element clears 60px inside the viewport bottom edge
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0,
    rootMargin: "0px 0px -60px 0px",
  });

  // 4. KEY FIX: wait 100ms before calling observe().
  //    IntersectionObserver callbacks can fire in the same rendering pipeline
  //    that applies opacity:0, collapsing the transition to nothing.
  //    The setTimeout forces at least one painted frame at opacity:0
  //    before observation begins — the transition then plays correctly.
  setTimeout(function () {
    elements.forEach(function (el) {
      observer.observe(el);
    });
  }, 100);

})();
