/* ============================================
   GV ÓPTICA — home-slider.js
   Slider principal do banner (troca automática
   + setas manuais + bolinhas)
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  const totalSlides = 4;
  let count = 1;

  const radio1 = document.getElementById("radio1");
  if (radio1) radio1.checked = true;

  function goTo(n) {
    count = n;
    const el = document.getElementById("radio" + count);
    if (el) el.checked = true;
  }

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
});
