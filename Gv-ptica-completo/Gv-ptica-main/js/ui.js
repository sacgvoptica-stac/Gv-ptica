/* ============================================
   GV ÓPTICA — ui.js
   Comportamentos globais compartilhados por
   todas as páginas (menu, badge do carrinho,
   saudação de conta, WhatsApp helper).
   ============================================ */

const WHATSAPP_NUMERO = "5511992222361";

function linkWhatsApp(mensagem) {
  const texto = encodeURIComponent(mensagem);
  return "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + texto;
}

function atualizarBadgeCarrinho() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const count = DataService.getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function atualizarSaudacaoConta() {
  const el = document.querySelector("[data-account-label]");
  if (!el) return;
  const user = DataService.getCurrentUser();
  el.textContent = user ? user.name.split(" ")[0] : "Entrar";
}

document.addEventListener("DOMContentLoaded", function () {
  // --- Menu mobile ---
  const toggleBtn = document.querySelector('[data-action="toggle-menu"]');
  const nav = document.querySelector(".header__desktop-nav");

  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
      });
    });
  }

  // --- Badge do carrinho e saudação de conta (em todas as páginas) ---
  atualizarBadgeCarrinho();
  atualizarSaudacaoConta();

  // --- Marca o link do menu ativo conforme a página atual ---
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-bar__link").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("nav-bar__link--active");
    }
  });
});
