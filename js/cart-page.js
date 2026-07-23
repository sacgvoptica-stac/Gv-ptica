
function renderCartPage() {
  const listEl = document.querySelector("[data-cart-list]");
  const emptyEl = document.querySelector("[data-cart-empty]");
  const layoutEl = document.querySelector("[data-cart-layout]");
  if (!listEl) return;

  const items = DataService.getCartDetailed();

  if (items.length === 0) {
    if (layoutEl) layoutEl.style.display = "none";
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }

  if (layoutEl) layoutEl.style.display = "grid";
  if (emptyEl) emptyEl.style.display = "none";

  listEl.innerHTML = items
    .map(function (item) {
      const p = item.product;
      const temAvista = p.precoAVista != null;
      const formaPagamento = temAvista
        ? '<div class="cart-item__pagamento" data-cart-pagamento="' + p.id + '">' +
            '<button type="button" class="cart-item__pagamento-btn' + (item.payment === "parcelado" ? " is-active" : "") + '" data-cart-payment="' + p.id + '" data-value="parcelado">' +
              (p.parcelas || 10) + "x de " + formatPrice(p.preco / (p.parcelas || 10)) +
            "</button>" +
            '<button type="button" class="cart-item__pagamento-btn' + (item.payment === "avista" ? " is-active" : "") + '" data-cart-payment="' + p.id + '" data-value="avista">' +
              formatPrice(p.precoAVista) + " à vista (10% off)" +
            "</button>" +
          "</div>"
        : "";
      return (
        '<div class="cart-item reveal" data-cart-item="' + p.id + '">' +
          '<a href="produto.html?id=' + p.id + '" class="cart-item__image"><img src="' + p.imagem + '" alt="' + p.nome + '"></a>' +
          '<div class="cart-item__info">' +
            '<a href="produto.html?id=' + p.id + '" class="cart-item__name-link"><p class="cart-item__name">' + p.nome + "</p></a>" +
            '<p class="cart-item__price">' + formatPrice(item.precoUnitario) + " cada</p>" +
            formaPagamento +
            '<div class="cart-item__qty">' +
              '<div class="qty-selector">' +
                '<button type="button" data-qty-minus="' + p.id + '">−</button>' +
                '<input type="text" value="' + item.qty + '" readonly>' +
                '<button type="button" data-qty-plus="' + p.id + '">+</button>' +
              "</div>" +
              '<button class="cart-item__remove" data-remove="' + p.id + '">Remover</button>' +
            "</div>" +
          "</div>" +
          '<div class="cart-item__subtotal">' + formatPrice(item.subtotal) + "</div>" +
        "</div>"
      );
    })
    .join("");

  if (window.ScrollReveal) ScrollReveal.refresh(listEl);

  const totalEl = document.querySelector("[data-cart-total]");
  if (totalEl) totalEl.textContent = formatPrice(DataService.getCartTotal());

  const countEl = document.querySelector("[data-cart-item-count]");
  if (countEl) {
    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = totalQty;
  }

  listEl.querySelectorAll("[data-qty-plus]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-qty-plus");
      const current = DataService.getCart().find((i) => i.productId === id);
      DataService.updateQty(id, (current ? current.qty : 0) + 1);
      renderCartPage();
      atualizarBadgeCarrinho();
    });
  });
  listEl.querySelectorAll("[data-qty-minus]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-qty-minus");
      const current = DataService.getCart().find((i) => i.productId === id);
      DataService.updateQty(id, (current ? current.qty : 1) - 1);
      renderCartPage();
      atualizarBadgeCarrinho();
    });
  });
  listEl.querySelectorAll("[data-remove]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      DataService.removeFromCart(btn.getAttribute("data-remove"));
      renderCartPage();
      atualizarBadgeCarrinho();
    });
  });
  listEl.querySelectorAll("[data-cart-payment]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-cart-payment");
      const value = btn.getAttribute("data-value");
      DataService.updatePayment(id, value);
      renderCartPage();
    });
  });
}

function montarMensagemPedido() {
  const items = DataService.getCartDetailed();
  let msg = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
  items.forEach(function (item) {
    const formaLabel = item.payment === "avista" ? "à vista, 10% off" : (item.product.parcelas || 10) + "x sem juros";
    msg += "• " + item.product.nome + " x" + item.qty + " (" + formaLabel + ") — " + formatPrice(item.subtotal) + "\n";
  });
  msg += "\nTotal: " + formatPrice(DataService.getCartTotal());
  return msg;
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector("[data-cart-list]")) return;

  renderCartPage();

  const checkoutBtn = document.querySelector("[data-checkout-whatsapp]");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (DataService.getCartDetailed().length === 0) return;
      window.open(linkWhatsApp(montarMensagemPedido()), "_blank");
    });
  }
});
