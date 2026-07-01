/* ============================================
   GV ÓPTICA — data-service.js
   ============================================
   Camada única de acesso a dados de AUTENTICAÇÃO
   e CARRINHO. Hoje implementada com localStorage
   (modo demonstração). Todas as páginas chamam
   SOMENTE as funções deste arquivo — nunca acessam
   localStorage diretamente.

   PARA CONECTAR UM BACKEND REAL (Firebase/Supabase)
   NO FUTURO:
   Basta reescrever o corpo das funções abaixo para
   chamar a API/SDK escolhida, mantendo a MESMA
   assinatura (nome, parâmetros e formato do retorno).
   Nenhuma outra página do site precisa mudar.
   ============================================ */

const DataService = (function () {
  const KEYS = {
    USERS: "gv_users",
    SESSION: "gv_session",
    CART: "gv_cart",
  };

  // ---------- Helpers internos ----------
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error("DataService: erro ao ler", key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("DataService: erro ao salvar", key, e);
      return false;
    }
  }

  // Hash simples só para não guardar senha em texto puro no demo.
  // NÃO é criptografia segura — trocar por backend real antes de produção.
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  /**
   * Cadastra um novo usuário.
   * @returns {{ok: boolean, error?: string, user?: object}}
   */
  async function register(name, email, password) {
    const users = readJSON(KEYS.USERS, []);
    const emailNorm = email.trim().toLowerCase();

    if (!name || !emailNorm || !password) {
      return { ok: false, error: "Preencha todos os campos." };
    }
    if (password.length < 4) {
      return { ok: false, error: "A senha precisa ter pelo menos 4 caracteres." };
    }
    if (users.some((u) => u.email === emailNorm)) {
      return { ok: false, error: "Já existe uma conta com esse e-mail." };
    }

    const user = {
      id: "u_" + Date.now(),
      name: name.trim(),
      email: emailNorm,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeJSON(KEYS.USERS, users);

    const session = { userId: user.id, name: user.name, email: user.email };
    writeJSON(KEYS.SESSION, session);

    return { ok: true, user: session };
  }

  /**
   * Autentica um usuário existente.
   * @returns {{ok: boolean, error?: string, user?: object}}
   */
  async function login(email, password) {
    const users = readJSON(KEYS.USERS, []);
    const emailNorm = email.trim().toLowerCase();
    const found = users.find((u) => u.email === emailNorm);

    if (!found || found.passwordHash !== simpleHash(password)) {
      return { ok: false, error: "E-mail ou senha incorretos." };
    }

    const session = { userId: found.id, name: found.name, email: found.email };
    writeJSON(KEYS.SESSION, session);

    return { ok: true, user: session };
  }

  /** Encerra a sessão atual. */
  function logout() {
    localStorage.removeItem(KEYS.SESSION);
  }

  /** Retorna o usuário logado (ou null). */
  function getCurrentUser() {
    return readJSON(KEYS.SESSION, null);
  }

  // ============================================
  // CARRINHO
  // ============================================

  /** Retorna o carrinho atual: array de {productId, qty} */
  function getCart() {
    return readJSON(KEYS.CART, []);
  }

  /** Adiciona um produto (ou soma quantidade se já existir). */
  function addToCart(productId, qty) {
    qty = qty || 1;
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId: productId, qty: qty });
    }
    writeJSON(KEYS.CART, cart);
    return cart;
  }

  /** Remove um produto do carrinho por completo. */
  function removeFromCart(productId) {
    const cart = getCart().filter((item) => item.productId !== productId);
    writeJSON(KEYS.CART, cart);
    return cart;
  }

  /** Atualiza a quantidade de um item (remove se qty <= 0). */
  function updateQty(productId, qty) {
    let cart = getCart();
    if (qty <= 0) {
      cart = cart.filter((item) => item.productId !== productId);
    } else {
      const existing = cart.find((item) => item.productId === productId);
      if (existing) existing.qty = qty;
    }
    writeJSON(KEYS.CART, cart);
    return cart;
  }

  /** Esvazia o carrinho. */
  function clearCart() {
    writeJSON(KEYS.CART, []);
  }

  /** Retorna a soma de quantidades no carrinho (para o badge do header). */
  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  /**
   * Retorna os itens do carrinho já combinados com os dados
   * do produto (nome, preço, imagem) vindos de products.js.
   */
  function getCartDetailed() {
    return getCart()
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          product: product,
          qty: item.qty,
          subtotal: product.preco * item.qty,
        };
      })
      .filter(Boolean);
  }

  /** Retorna o valor total do carrinho. */
  function getCartTotal() {
    return getCartDetailed().reduce((sum, item) => sum + item.subtotal, 0);
  }

  return {
    register,
    login,
    logout,
    getCurrentUser,
    getCart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    getCartCount,
    getCartDetailed,
    getCartTotal,
  };
})();
