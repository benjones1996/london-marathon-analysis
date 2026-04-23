(function () {
  "use strict";
  var btn   = document.querySelector(".nav-hamburger");
  var links = document.querySelector(".nav-links");
  if (!btn || !links) return;

  btn.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close when a link is tapped
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
  });

  // Close when tapping outside
  document.addEventListener("click", function (e) {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove("is-open");
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
})();
