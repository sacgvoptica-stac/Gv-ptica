
document.addEventListener("DOMContentLoaded", function () {
  const totalSlides = 4;
  let count = 1;

  const radio1 = document.getElementById("radio1");
  if (radio1) radio1.checked = true;

  const dots = document.querySelectorAll(".manual-btn");

  function updateDots() {
    dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === count - 1);
    });
  }

  function goTo(n) {
    count = n;
    const el = document.getElementById("radio" + count);
    if (el) el.checked = true;
    updateDots();
  }

  updateDots();

  const timer = setInterval(function () {
    count = count >= totalSlides ? 1 : count + 1;
    goTo(count);
  }, 4000);

  document
    .querySelectorAll('.slide-arrow[data-slider="main"]')
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        const dir = btn.getAttribute("data-dir");
        count = dir === "next"
          ? (count >= totalSlides ? 1 : count + 1)
          : (count <= 1 ? totalSlides : count - 1);
        goTo(count);
      });
    });

  const slider = document.querySelector(".slider");
  if (slider) {
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const THRESHOLD = 40;
      if (Math.abs(diff) < THRESHOLD) return;

      if (diff > 0) {
        count = count >= totalSlides ? 1 : count + 1;
      } else {
        count = count <= 1 ? totalSlides : count - 1;
      }
      goTo(count);
    }, { passive: true });
  }
});
