
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = document.getElementById("contato-nome").value.trim();
    const assunto = document.getElementById("contato-assunto").value.trim();
    const mensagem = document.getElementById("contato-mensagem").value.trim();

    if (!nome || !mensagem) return;

    const texto =
      "Olá! Meu nome é " + nome +
      (assunto ? "\nAssunto: " + assunto : "") +
      "\n\nMensagem: " + mensagem;

    window.open(linkWhatsApp(texto), "_blank");
    form.reset();
  });
});
