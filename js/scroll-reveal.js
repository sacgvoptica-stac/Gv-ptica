
const ScrollReveal = (function () {
  let observer = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getObserver() {
    if (observer) return observer;
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    return observer;
  }

  function refresh(root) {
    const scope = root || document;
    const els = scope.querySelectorAll(".reveal:not(.is-visible)");
    if (reducedMotion) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    const obs = getObserver();
    els.forEach(function (el, idx) {
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = Math.min(idx % 8, 6) * 0.06 + "s";
      }
      obs.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    refresh();
  });

  return { refresh: refresh };
})();
