/* ============================================
   GV ÓPTICA — product-render.js
   Renderiza cards de produto em qualquer página
   que tenha um contêiner [data-product-container]
   ============================================ */

function renderProductCard(p) {
  const badge = p.oferta
    ? '<span class="product-card__badge">OFERTA</span>'
    : "";
  const precoAntigo = p.precoAntigo
    ? '<span class="price--old">' + formatPrice(p.precoAntigo) + "</span>"
    : "";

  return (
    '<div class="product-card">' +
      badge +
      '<a href="produto.html?id=' + p.id + '" class="product-card__image">' +
        '<img src="' + p.imagem + '" alt="' + p.nome + '" loading="lazy">' +
      "</a>" +
      '<div class="product-card__body">' +
        '<span class="product-card__category">' + p.categoriaLabel + "</span>" +
        '<h3 class="product-card__name"><a href="produto.html?id=' + p.id + '">' + p.nome + "</a></h3>" +
        '<div class="product-card__prices">' +
          precoAntigo +
          '<span class="price--highlight">' + formatPrice(p.preco) + "</span>" +
        "</div>" +
      "</div>" +
      '<div class="product-card__cta">' +
        '<button class="btn btn--outline btn--sm btn--block" data-add-to-cart="' + p.id + '">Adicionar ao carrinho</button>' +
      "</div>" +
    "</div>"
  );
}

function renderProductList(container, products) {
  if (!container) return;
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px 0;">Nenhum produto encontrado nessa categoria.</p>';
    return;
  }
  container.innerHTML = products.map(renderProductCard).join("");
}

function bindAddToCartButtons(root) {
  (root || document).querySelectorAll("[data-add-to-cart]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-add-to-cart");
      const qtyInput = btn.closest(".produto-detalhe") ? document.getElementById("qty-input") : null;
      const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

      DataService.addToCart(id, qty);
      atualizarBadgeCarrinho();

      const original = btn.textContent;
      btn.textContent = "Adicionado ✓";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1200);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // --- Grid genérica com data-source (featured | offers | all) ---
  document.querySelectorAll("[data-product-container]").forEach(function (container) {
    const source = container.getAttribute("data-product-container");
    let products;
    if (source === "featured") products = getFeaturedProducts();
    else if (source === "offers") products = getOfferProducts();
    else products = getProductsByCategory("todas");

    renderProductList(container, products);
    bindAddToCartButtons(container);
  });

  // --- Página de catálogo com filtros por categoria ---
  const filtrosContainer = document.querySelector("[data-filtros]");
  const catalogContainer = document.querySelector("[data-catalog]");
  if (filtrosContainer && catalogContainer) {
    const categorias = getAllCategories();
    let html = '<button class="filtro-btn is-active" data-categoria="todas">Todas</button>';
    categorias.forEach(function (c) {
      html += '<button class="filtro-btn" data-categoria="' + c.value + '">' + c.label + "</button>";
    });
    filtrosContainer.innerHTML = html;

    function applyFilter(categoria) {
      renderProductList(catalogContainer, getProductsByCategory(categoria));
      bindAddToCartButtons(catalogContainer);
    }

    filtrosContainer.querySelectorAll(".filtro-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filtrosContainer.querySelectorAll(".filtro-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        applyFilter(btn.getAttribute("data-categoria"));
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const categoriaInicial = urlParams.get("categoria");
    if (categoriaInicial) {
      const alvo = filtrosContainer.querySelector('[data-categoria="' + categoriaInicial + '"]');
      if (alvo) {
        filtrosContainer.querySelectorAll(".filtro-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        alvo.classList.add("is-active");
        applyFilter(categoriaInicial);
      } else {
        applyFilter("todas");
      }
    } else {
      applyFilter("todas");
    }
  }

  // --- Página de detalhe do produto ---
  const detalheContainer = document.querySelector("[data-produto-detalhe]");
  if (detalheContainer) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const p = id ? getProductById(id) : null;

    if (!p) {
      detalheContainer.innerHTML =
        '<p style="text-align:center;padding:60px 0;">Produto não encontrado. <a href="produtos.html">Voltar ao catálogo</a></p>';
    } else {
      document.title = p.nome + " — GV Óptica";
      const precoAntigo = p.precoAntigo
        ? '<span class="price--old">' + formatPrice(p.precoAntigo) + "</span>"
        : "";

      detalheContainer.innerHTML =
        '<div class="produto-detalhe__imagem"><img src="' + p.imagem + '" alt="' + p.nome + '"></div>' +
        '<div class="produto-detalhe__info">' +
          '<span class="produto-detalhe__categoria">' + p.categoriaLabel + "</span>" +
          '<h1 class="produto-detalhe__nome">' + p.nome + "</h1>" +
          '<div class="produto-detalhe__precos">' + precoAntigo +
            '<span class="price--highlight">' + formatPrice(p.preco) + "</span>" +
          "</div>" +
          '<p class="produto-detalhe__descricao">' + p.descricao + "</p>" +
          '<div class="qty-selector">' +
            '<button type="button" id="qty-minus">−</button>' +
            '<input type="text" id="qty-input" value="1" readonly>' +
            '<button type="button" id="qty-plus">+</button>' +
          "</div>" +
          '<div class="produto-detalhe__acoes">' +
            '<button class="btn btn--primary" data-add-to-cart="' + p.id + '">Adicionar ao carrinho</button>' +
            '<a class="btn btn--whatsapp" href="' + linkWhatsApp("Olá! Tenho interesse no produto: " + p.nome + " (" + formatPrice(p.preco) + ")") + '" target="_blank">Perguntar no WhatsApp</a>' +
          "</div>" +
        "</div>";

      bindAddToCartButtons(detalheContainer);

      const qtyInput = document.getElementById("qty-input");
      document.getElementById("qty-minus").addEventListener("click", function () {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
      });
      document.getElementById("qty-plus").addEventListener("click", function () {
        qtyInput.value = parseInt(qtyInput.value, 10) + 1;
      });
    }
  }

  // --- Categorias da home (geradas a partir do catálogo) ---
  const categoriasContainer = document.querySelector("[data-categorias-home]");
  if (categoriasContainer) {
    const cats = getAllCategories();
    categoriasContainer.innerHTML = cats
      .map(function (c) {
        const sample = getProductsByCategory(c.value)[0];
        const img = sample ? sample.imagem : "";
        return (
          '<a href="produtos.html?categoria=' + c.value + '" class="categoria-item">' +
            '<img src="' + img + '" alt="' + c.label + '">' +
            "<span>" + c.label + "</span>" +
          "</a>"
        );
      })
      .join("");
  }
});
