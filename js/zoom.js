
function ensureZoomLightbox() {
  let lightbox = document.querySelector("[data-zoom-lightbox]");
  if (lightbox) return lightbox;

  lightbox = document.createElement("div");
  lightbox.setAttribute("data-zoom-lightbox", "");
  lightbox.className = "zoom-lightbox";
  lightbox.innerHTML =
    '<button type="button" class="zoom-lightbox__close" data-zoom-close aria-label="Fechar">&times;</button>' +
    '<img class="zoom-lightbox__img" data-zoom-lightbox-img alt="">';
  document.body.appendChild(lightbox);

  function close() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.closest("[data-zoom-close]")) {
      close();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  return lightbox;
}

function openZoomLightbox(src, alt) {
  const lightbox = ensureZoomLightbox();
  const img = lightbox.querySelector("[data-zoom-lightbox-img]");
  img.src = src;
  img.alt = alt || "";
  lightbox.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function setupImageZoom(root) {
  const wrapper = (root || document).querySelector("[data-zoom-wrapper]");
  if (!wrapper) return;

  const img = wrapper.querySelector("[data-zoom-image]");
  const openBtn = wrapper.querySelector("[data-zoom-open]");
  if (!img) return;

  function openFull() {
    openZoomLightbox(img.src, img.alt);
  }
  img.addEventListener("click", openFull);
  if (openBtn) openBtn.addEventListener("click", openFull);

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover) return;

  const ZOOM_LEVEL = 2.2;

  wrapper.addEventListener("mouseenter", function () {
    img.style.transition = "none";
    img.style.transform = "scale(" + ZOOM_LEVEL + ")";
  });

  wrapper.addEventListener("mousemove", function (e) {
    const rect = wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = x + "% " + y + "%";
  });

  wrapper.addEventListener("mouseleave", function () {
    img.style.transition = "transform 0.25s ease";
    img.style.transform = "scale(1)";
    img.style.transformOrigin = "center center";
  });
}
