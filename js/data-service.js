
const DataService = (function () {
  const KEYS = {
    USERS: "gv_users",
    SESSION: "gv_session",
    CART: "gv_cart",
  };

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

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

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

  function logout() {
    localStorage.removeItem(KEYS.SESSION);
  }

  function getCurrentUser() {
    return readJSON(KEYS.SESSION, null);
  }

  function getCart() {
    return readJSON(KEYS.CART, []);
  }

  function addToCart(productId, qty, payment) {
    qty = qty || 1;
    payment = payment === "avista" ? "avista" : "parcelado";
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.qty += qty;
      existing.payment = payment;
    } else {
      cart.push({ productId: productId, qty: qty, payment: payment });
    }
    writeJSON(KEYS.CART, cart);
    return cart;
  }

  function updatePayment(productId, payment) {
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) existing.payment = payment === "avista" ? "avista" : "parcelado";
    writeJSON(KEYS.CART, cart);
    return cart;
  }

  function removeFromCart(productId) {
    const cart = getCart().filter((item) => item.productId !== productId);
    writeJSON(KEYS.CART, cart);
    return cart;
  }

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

  function clearCart() {
    writeJSON(KEYS.CART, []);
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function getCartDetailed() {
    return getCart()
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        const payment = item.payment === "avista" ? "avista" : "parcelado";
        const precoUnitario =
          payment === "avista" && product.precoAVista != null ? product.precoAVista : product.preco;
        return {
          product: product,
          qty: item.qty,
          payment: payment,
          precoUnitario: precoUnitario,
          subtotal: precoUnitario * item.qty,
        };
      })
      .filter(Boolean);
  }

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
    updatePayment,
    removeFromCart,
    updateQty,
    clearCart,
    getCartCount,
    getCartDetailed,
    getCartTotal,
  };
})();
