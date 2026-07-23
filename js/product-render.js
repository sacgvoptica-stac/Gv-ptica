
function renderProductCard(p) {
  const semEstoque = p.emEstoque === false;
  const badge = semEstoque
    ? '<span class="product-card__badge product-card__badge--indisponivel">SEM ESTOQUE</span>'
    : p.oferta
    ? '<span class="product-card__badge">OFERTA</span>'
    : "";
  const precoAntigo = p.precoAntigo
    ? '<span class="price--old">' + formatPrice(p.precoAntigo) + "</span>"
    : "";
  const avista = p.precoAVista
    ? '<div class="price-avista">ou ' + formatPrice(p.precoAVista) + " à vista <span>(10% off)</span></div>"
    : "";
  const precoPrincipal = p.preco != null
    ? '<span class="price--highlight">' + formatPrice(p.preco) + "</span>"
    : '<span class="price--highlight price--indisponivel">Indisponível</span>';

  const cta = semEstoque
    ? '<button class="btn btn--outline btn--sm btn--block" disabled>Sem estoque</button>'
    : '<button class="btn btn--outline btn--sm btn--block" data-add-to-cart="' + p.id + '">Adicionar ao carrinho</button>';

  return (
    '<div class="product-card reveal' + (semEstoque ? " product-card--indisponivel" : "") + '">' +
      badge +
      '<a href="produto.html?id=' + p.id + '" class="product-card__image">' +
        '<img src="' + p.imagem + '" alt="' + p.nome + '" loading="lazy">' +
      "</a>" +
      '<div class="product-card__body">' +
        '<span class="product-card__category">' + p.categoriaLabel + "</span>" +
        '<h3 class="product-card__name"><a href="produto.html?id=' + p.id + '">' + p.nome + "</a></h3>" +
        '<div class="product-card__prices">' +
          precoAntigo +
          precoPrincipal +
          (semEstoque ? "" : avista) +
        "</div>" +
      "</div>" +
      '<div class="product-card__cta">' +
        cta +
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
  if (window.ScrollReveal) ScrollReveal.refresh(container);
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
  document.querySelectorAll("[data-product-container]").forEach(function (container) {
    const source = container.getAttribute("data-product-container");
    let products;
    if (source === "featured") products = getFeaturedProducts();
    else if (source === "featured-1") {
      const todos = getFeaturedProducts();
      const meio = Math.ceil(todos.length / 2);
      products = todos.slice(0, meio);
    }
    else if (source === "featured-2") {
      const todos = getFeaturedProducts();
      const meio = Math.ceil(todos.length / 2);
      products = todos.slice(meio);
    }
    else if (source === "offers") products = getOfferProducts();
    else products = getProductsByCategory("todas");

    renderProductList(container, products);
    bindAddToCartButtons(container);
  });

  const filtrosContainer = document.querySelector("[data-filtros]");
  const catalogContainer = document.querySelector("[data-catalog]");
  if (filtrosContainer && catalogContainer) {
    const categorias = getAllCategories();
    let html = '<button class="filtro-btn is-active" data-categoria="todas">Todas</button>';
    categorias.forEach(function (c) {
      if (c.locked) {
        html +=
          '<button type="button" class="filtro-btn filtro-btn--bloqueado" data-categoria="' + c.value + '" disabled title="Categoria em breve">' +
            c.label + '<span class="filtro-btn__tag">Em breve</span>' +
          "</button>";
      } else {
        html += '<button class="filtro-btn" data-categoria="' + c.value + '">' + c.label + "</button>";
      }
    });
    filtrosContainer.innerHTML = html;

    const subtitleEl = document.querySelector("[data-catalog-subtitle]");
    const precoMinInput = document.querySelector("[data-preco-min]");
    const precoMaxInput = document.querySelector("[data-preco-max]");
    const ordenarSelect = document.querySelector("[data-ordenar]");
    const marcaSelect = document.querySelector("[data-marca]");

    if (marcaSelect) {
      const marcas = getAllBrands();
      marcas.forEach(function (m) {
        const opt = document.createElement("option");
        opt.value = m.value;
        opt.textContent = m.label;
        marcaSelect.appendChild(opt);
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const termoBusca = urlParams.get("busca") || "";

    let categoriaAtual = "todas";

    function aplicarTudo() {
      let lista = termoBusca
        ? buscarProdutos(termoBusca, 999)
        : getProductsByCategory(categoriaAtual);

      if (termoBusca && categoriaAtual !== "todas") {
        lista = lista.filter(function (p) { return p.categoria === categoriaAtual; });
      }

      const marcaAtual = marcaSelect ? marcaSelect.value : "todas";
      if (marcaAtual && marcaAtual !== "todas") {
        lista = lista.filter(function (p) { return p.marca === marcaAtual; });
      }

      const min = parseFloat(precoMinInput.value);
      const max = parseFloat(precoMaxInput.value);
      if (!isNaN(min)) lista = lista.filter(function (p) { return p.preco >= min; });
      if (!isNaN(max)) lista = lista.filter(function (p) { return p.preco <= max; });

      const ordenacao = ordenarSelect.value;
      if (ordenacao === "menor-preco") {
        lista = lista.slice().sort(function (a, b) { return a.preco - b.preco; });
      } else if (ordenacao === "maior-preco") {
        lista = lista.slice().sort(function (a, b) { return b.preco - a.preco; });
      }

      if (subtitleEl) {
        subtitleEl.textContent = termoBusca
          ? 'Resultados para "' + termoBusca + '" (' + lista.length + ")"
          : "Filtre por categoria para encontrar o que procura";
      }

      renderProductList(catalogContainer, lista);
      bindAddToCartButtons(catalogContainer);
    }

    filtrosContainer.querySelectorAll(".filtro-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filtrosContainer.querySelectorAll(".filtro-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        categoriaAtual = btn.getAttribute("data-categoria");
        aplicarTudo();
      });
    });

    const aplicarPrecoBtn = document.querySelector("[data-aplicar-preco]");
    const limparPrecoBtn = document.querySelector("[data-limpar-preco]");
    if (aplicarPrecoBtn) aplicarPrecoBtn.addEventListener("click", aplicarTudo);
    if (limparPrecoBtn) {
      limparPrecoBtn.addEventListener("click", function () {
        precoMinInput.value = "";
        precoMaxInput.value = "";
        aplicarTudo();
      });
    }
    [precoMinInput, precoMaxInput].forEach(function (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") aplicarTudo();
      });
    });
    ordenarSelect.addEventListener("change", aplicarTudo);
    if (marcaSelect) marcaSelect.addEventListener("change", aplicarTudo);

    const marcaInicial = urlParams.get("marca");
    if (marcaInicial && marcaSelect) {
      const opcaoExiste = Array.from(marcaSelect.options).some(function (o) { return o.value === marcaInicial; });
      if (opcaoExiste) marcaSelect.value = marcaInicial;
    }

    const categoriaInicial = urlParams.get("categoria");
    if (categoriaInicial && !isCategoriaBloqueada(categoriaInicial)) {
      const alvo = filtrosContainer.querySelector('[data-categoria="' + categoriaInicial + '"]');
      if (alvo) {
        filtrosContainer.querySelectorAll(".filtro-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        alvo.classList.add("is-active");
        categoriaAtual = categoriaInicial;
      }
    }

    aplicarTudo();
  }

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
      const semEstoque = p.emEstoque === false;
      const precoAntigo = p.precoAntigo
        ? '<span class="price--old">' + formatPrice(p.precoAntigo) + "</span>"
        : "";
      const temOpcoesPagamento = p.precoAVista != null && p.preco != null && !semEstoque;
      const pagamento = temOpcoesPagamento
        ? '<div class="pagamento-opcoes" data-pagamento-opcoes role="radiogroup" aria-label="Forma de pagamento">' +
            '<button type="button" class="pagamento-opcao pagamento-opcao--parcelado is-active" data-pagamento="parcelado" role="radio" aria-checked="true">' +
              '<strong>' + (p.parcelas || 10) + 'x de ' + formatPrice(p.preco / (p.parcelas || 10)) + '</strong>' +
              '<span>sem juros no cartão · total ' + formatPrice(p.preco) + '</span>' +
            "</button>" +
            '<button type="button" class="pagamento-opcao pagamento-opcao--avista" data-pagamento="avista" role="radio" aria-checked="false">' +
              '<strong>' + formatPrice(p.precoAVista) + ' à vista</strong>' +
              '<span>10% de desconto (Pix / dinheiro)</span>' +
            "</button>" +
          "</div>"
        : "";
      const precoPrincipalInicial = p.preco != null
        ? formatPrice(p.preco)
        : "Indisponível";
      const precoPrincipal =
        '<span class="price--highlight' + (p.preco == null ? " price--indisponivel" : "") + '" data-preco-principal>' +
          precoPrincipalInicial +
        "</span>";
      const disponibilidadeBadge = semEstoque
        ? '<span class="product-card__badge product-card__badge--indisponivel produto-detalhe__badge">SEM ESTOQUE</span>'
        : "";

      const galeria = p.imagens && p.imagens.length > 1
        ? '<div class="produto-detalhe__thumbs">' +
            p.imagens.map(function (img, idx) {
              return '<button type="button" class="produto-thumb' + (idx === 0 ? " is-active" : "") + '" data-thumb="' + img + '"><img src="' + img + '" alt="' + p.nome + " " + (idx + 1) + '"></button>';
            }).join("") +
          "</div>"
        : "";

      detalheContainer.innerHTML =
        '<div class="reveal reveal--left">' +
          '<div class="produto-detalhe__imagem" data-zoom-wrapper>' +
            '<img src="' + p.imagem + '" alt="' + p.nome + '" data-zoom-image>' +
            '<button type="button" class="zoom-hint" data-zoom-open aria-label="Ampliar imagem">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>' +
            "</button>" +
          "</div>" +
          galeria +
        "</div>" +
        '<div class="produto-detalhe__info reveal reveal--right">' +
          '<span class="produto-detalhe__categoria">' + p.categoriaLabel + "</span>" +
          disponibilidadeBadge +
          '<h1 class="produto-detalhe__nome">' + p.nome + "</h1>" +
          '<div class="produto-detalhe__precos">' + precoAntigo +
            precoPrincipal +
          "</div>" +
          pagamento +
          '<p class="produto-detalhe__descricao">' + p.descricao + "</p>" +
          (semEstoque
            ? '<div class="produto-detalhe__acoes">' +
                '<button class="btn btn--primary" disabled>Sem estoque</button>' +
                '<a class="btn btn--whatsapp" href="' + linkWhatsApp("Olá! Gostaria de saber sobre a disponibilidade do produto: " + p.nome) + '" target="_blank">Perguntar no WhatsApp</a>' +
              "</div>"
            : '<div class="qty-selector">' +
                '<button type="button" id="qty-minus">−</button>' +
                '<input type="text" id="qty-input" value="1" readonly>' +
                '<button type="button" id="qty-plus">+</button>' +
              "</div>" +
              '<div class="produto-detalhe__acoes">' +
                '<button class="btn btn--primary" data-add-to-cart="' + p.id + '" data-payment-aware>Adicionar ao carrinho</button>' +
                '<a class="btn btn--whatsapp" data-whatsapp-link href="#" target="_blank">Perguntar no WhatsApp</a>' +
              "</div>") +
        "</div>";

      let formaPagamentoAtual = "parcelado";

      function mensagemWhatsApp() {
        if (formaPagamentoAtual === "avista" && p.precoAVista != null) {
          return (
            "Olá! Tenho interesse no produto: " + p.nome +
            " — à vista " + formatPrice(p.precoAVista) + " (10% de desconto, Pix/dinheiro)"
          );
        }
        return (
          "Olá! Tenho interesse no produto: " + p.nome +
          " — " + (p.parcelas || 10) + "x de " + formatPrice(p.preco / (p.parcelas || 10)) +
          " (total " + formatPrice(p.preco) + ")"
        );
      }

      function atualizarPagamentoUI() {
        const precoEl = detalheContainer.querySelector("[data-preco-principal]");
        if (precoEl) {
          precoEl.textContent =
            formaPagamentoAtual === "avista" && p.precoAVista != null
              ? formatPrice(p.precoAVista)
              : formatPrice(p.preco);
        }
        const whatsappEl = detalheContainer.querySelector("[data-whatsapp-link]");
        if (whatsappEl) whatsappEl.href = linkWhatsApp(mensagemWhatsApp());
      }

      const botoesPagamento = detalheContainer.querySelectorAll("[data-pagamento]");
      botoesPagamento.forEach(function (btn) {
        btn.addEventListener("click", function () {
          formaPagamentoAtual = btn.getAttribute("data-pagamento");
          botoesPagamento.forEach(function (b) {
            b.classList.remove("is-active");
            b.setAttribute("aria-checked", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-checked", "true");
          atualizarPagamentoUI();
        });
      });
      atualizarPagamentoUI();

      if (window.ScrollReveal) ScrollReveal.refresh(detalheContainer);

      const addToCartBtn = detalheContainer.querySelector("[data-payment-aware]");
      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", function () {
          const qtyInput = document.getElementById("qty-input");
          const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
          DataService.addToCart(p.id, qty, formaPagamentoAtual);
          atualizarBadgeCarrinho();
          const original = addToCartBtn.textContent;
          addToCartBtn.textContent = "Adicionado ✓";
          addToCartBtn.disabled = true;
          setTimeout(function () {
            addToCartBtn.textContent = original;
            addToCartBtn.disabled = false;
          }, 1200);
        });
      }

      setupImageZoom(detalheContainer);

      const mainImg = detalheContainer.querySelector("[data-zoom-image]");
      detalheContainer.querySelectorAll("[data-thumb]").forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          const newSrc = thumb.getAttribute("data-thumb");
          mainImg.src = newSrc;
          detalheContainer.querySelectorAll("[data-thumb]").forEach(function (t) {
            t.classList.remove("is-active");
          });
          thumb.classList.add("is-active");
        });
      });

      const qtyInput = document.getElementById("qty-input");
      const qtyMinus = document.getElementById("qty-minus");
      const qtyPlus = document.getElementById("qty-plus");
      if (qtyInput && qtyMinus && qtyPlus) {
        qtyMinus.addEventListener("click", function () {
          qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
        });
        qtyPlus.addEventListener("click", function () {
          qtyInput.value = parseInt(qtyInput.value, 10) + 1;
        });
      }
    }
  }

  const categoriasContainer = document.querySelector("[data-categorias-home]");
  if (categoriasContainer) {
    const cats = getAllCategories();
    categoriasContainer.innerHTML = cats
      .map(function (c) {
        if (c.locked && c.semImagem) {
          return (
            '<div class="categoria-item categoria-item--bloqueada categoria-item--sem-imagem reveal reveal--scale" aria-disabled="true" title="Categoria em breve">' +
              '<span class="categoria-item__img-wrap categoria-item__img-wrap--placeholder">' +
                '<span class="categoria-item__lock categoria-item__lock--estatico">Em breve</span>' +
              "</span>" +
              "<span>" + c.label + "</span>" +
            "</div>"
          );
        }
        const img = getCategoryThumbnail(c.value);
        if (c.locked) {
          return (
            '<div class="categoria-item categoria-item--bloqueada reveal reveal--scale" aria-disabled="true" title="Categoria em breve">' +
              '<span class="categoria-item__img-wrap">' +
                '<img src="' + img + '" alt="' + c.label + '">' +
                '<span class="categoria-item__lock">Em breve</span>' +
              "</span>" +
              "<span>" + c.label + "</span>" +
            "</div>"
          );
        }
        return (
          '<a href="produtos.html?categoria=' + c.value + '" class="categoria-item reveal reveal--scale">' +
            '<span class="categoria-item__img-wrap"><img src="' + img + '" alt="' + c.label + '"></span>' +
            "<span>" + c.label + "</span>" +
          "</a>"
        );
      })
      .join("");
    if (window.ScrollReveal) ScrollReveal.refresh(categoriasContainer);
  }
});
