
function normalizarTexto(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarProdutos(termo, limite) {
  const termoNorm = normalizarTexto(termo.trim());
  if (!termoNorm) return [];

  return PRODUCTS.filter(function (p) {
    if (typeof isCategoriaBloqueada === "function" && isCategoriaBloqueada(p.categoria)) return false;
    const alvo = normalizarTexto(p.nome + " " + p.categoriaLabel);
    return alvo.indexOf(termoNorm) !== -1;
  }).slice(0, limite || 8);
}

function renderSuggestion(p) {
  return (
    '<a href="produto.html?id=' + p.id + '" class="search-suggestion">' +
      '<img src="' + p.imagem + '" alt="' + p.nome + '">' +
      '<div class="search-suggestion__info">' +
        '<span class="search-suggestion__name">' + p.nome + "</span>" +
        '<span class="search-suggestion__price">' + formatPrice(p.preco) + "</span>" +
      "</div>" +
    "</a>"
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector("[data-search-root]");
  if (!root) return;

  const input = root.querySelector("[data-search-input]");
  const box = root.querySelector("[data-search-suggestions]");

  function closeBox() {
    box.classList.remove("is-open");
    box.innerHTML = "";
  }

  function irParaResultados() {
    const termo = input.value.trim();
    if (!termo) return;
    window.location.href = "produtos.html?busca=" + encodeURIComponent(termo);
  }

  input.addEventListener("input", function () {
    const termo = input.value;
    if (termo.trim().length < 2) {
      closeBox();
      return;
    }
    const resultados = buscarProdutos(termo, 6);
    if (resultados.length === 0) {
      box.innerHTML = '<div class="search-suggestion search-suggestion--empty">Nenhum produto encontrado</div>';
      box.classList.add("is-open");
      return;
    }
    box.innerHTML = resultados.map(renderSuggestion).join("");
    box.classList.add("is-open");
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      irParaResultados();
    }
    if (e.key === "Escape") {
      closeBox();
      input.blur();
    }
  });

  document.addEventListener("click", function (e) {
    if (!root.contains(e.target)) closeBox();
  });
});
