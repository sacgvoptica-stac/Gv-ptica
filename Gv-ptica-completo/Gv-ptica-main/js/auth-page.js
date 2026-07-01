/* ============================================
   GV ÓPTICA — auth-page.js
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  const authRoot = document.querySelector("[data-auth-root]");
  if (!authRoot) return;

  const loggedView = document.querySelector("[data-account-logged]");
  const formsView = document.querySelector("[data-auth-forms]");

  function refreshView() {
    const user = DataService.getCurrentUser();
    if (user) {
      loggedView.style.display = "block";
      formsView.style.display = "none";
      document.querySelector("[data-user-name]").textContent = user.name;
      document.querySelector("[data-user-email]").textContent = user.email;
      document.querySelector("[data-user-initial]").textContent = user.name.charAt(0).toUpperCase();
    } else {
      loggedView.style.display = "none";
      formsView.style.display = "block";
    }
  }

  // --- Alternância de abas Login / Cadastro ---
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector('[data-panel="' + tab.getAttribute("data-tab") + '"]').classList.add("is-active");
    });
  });

  // --- Formulário de login ---
  const loginForm = document.querySelector("[data-login-form]");
  const loginError = document.querySelector("[data-login-error]");
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;
    const result = await DataService.login(email, senha);
    if (!result.ok) {
      loginError.textContent = result.error;
      loginError.classList.add("is-visible");
      return;
    }
    loginError.classList.remove("is-visible");
    atualizarSaudacaoConta();
    refreshView();
  });

  // --- Formulário de cadastro ---
  const registerForm = document.querySelector("[data-register-form]");
  const registerError = document.querySelector("[data-register-error]");
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const nome = document.getElementById("register-nome").value;
    const email = document.getElementById("register-email").value;
    const senha = document.getElementById("register-senha").value;
    const result = await DataService.register(nome, email, senha);
    if (!result.ok) {
      registerError.textContent = result.error;
      registerError.classList.add("is-visible");
      return;
    }
    registerError.classList.remove("is-visible");
    atualizarSaudacaoConta();
    refreshView();
  });

  // --- Logout ---
  const logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      DataService.logout();
      atualizarSaudacaoConta();

      // Sempre volta para a aba de login ao sair
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      document.querySelector('[data-tab="login"]').classList.add("is-active");
      document.querySelector('[data-panel="login"]').classList.add("is-active");

      refreshView();
    });
  }

  refreshView();
});
