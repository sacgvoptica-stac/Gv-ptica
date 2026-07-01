/* ============================================
   GV ÓPTICA — products.js
   Fonte única de dados de produtos.
   Usado por: produtos.html, produto.html,
   ofertas.html, carrinho.html (via id)
   ============================================ */

const PRODUCTS = [
  {
    id: "acuvue-moist",
    nome: "Acuvue Moist",
    categoria: "lentes-de-contato",
    categoriaLabel: "Lentes de Contato",
    preco: 399.0,
    precoAntigo: null,
    imagem: "assets/SITE/Categorias/Lente-de-Contato/Acuvue-Moist/acuvue-moist.webp",
    descricao:
      "Lentes de contato descartáveis com tecnologia de hidratação prolongada, ideais para uso diário e conforto durante todo o dia.",
    destaque: true,
    oferta: false,
  },
  {
    id: "acuvue-2",
    nome: "Acuvue 2",
    categoria: "lentes-de-contato",
    categoriaLabel: "Lentes de Contato",
    preco: 239.0,
    precoAntigo: 279.0,
    imagem: "assets/SITE/Categorias/Lente-de-Contato/Acuvue-2/acuvue-2.png",
    descricao:
      "Lentes de contato quinzenais com excelente custo-benefício, proporcionando visão nítida e confortável.",
    destaque: true,
    oferta: true,
  },
  {
    id: "acuvue-oasys",
    nome: "Acuvue Oasys",
    categoria: "lentes-de-contato",
    categoriaLabel: "Lentes de Contato",
    preco: 459.0,
    precoAntigo: null,
    imagem: "assets/SITE/Categorias/Lente-de-Contato/Acuvue-Oasys/foto.png",
    descricao:
      "Tecnologia avançada de silicone hidrogel, oferecendo alta permeabilidade ao oxigênio para máximo conforto.",
    destaque: true,
    oferta: false,
  },
  {
    id: "biofinity",
    nome: "Biofinity",
    categoria: "lentes-de-contato",
    categoriaLabel: "Lentes de Contato",
    preco: 279.0,
    precoAntigo: 329.0,
    imagem: "assets/SITE/Categorias/Lente-de-Contato/Biofinity/Biofinity.png",
    descricao:
      "Lentes mensais de silicone hidrogel com hidratação natural, sem necessidade de troca frequente.",
    destaque: false,
    oferta: true,
  },
  {
    id: "armacao-classica",
    nome: "Armação Clássica",
    categoria: "armacoes",
    categoriaLabel: "Armações",
    preco: 189.0,
    precoAntigo: null,
    imagem: "assets/SITE/Categorias/Armacoes/capa.png",
    descricao:
      "Armação em acetato de alta qualidade, design atemporal que combina com qualquer estilo. Consulte modelos disponíveis na loja.",
    destaque: true,
    oferta: false,
  },
  {
    id: "oculos-sol-premium",
    nome: "Óculos de Sol Premium",
    categoria: "oculos-de-sol",
    categoriaLabel: "Óculos de Sol",
    preco: 259.0,
    precoAntigo: 319.0,
    imagem: "assets/SITE/Categorias/Oculos-de-Sol/capa.png",
    descricao:
      "Proteção UV400 com lentes polarizadas e armação resistente. Estilo e proteção para o dia a dia.",
    destaque: true,
    oferta: true,
  },
  {
    id: "lente-oftalmica-multi",
    nome: "Lente Oftálmica Multifocal",
    categoria: "lentes-oftalmicas",
    categoriaLabel: "Lentes Oftálmicas",
    preco: 449.0,
    precoAntigo: null,
    imagem: "assets/SITE/Categorias/Lente-Oftalmica/capa.png",
    descricao:
      "Lentes multifocais com tecnologia de transição suave, corrigindo visão de perto e de longe sem linhas visíveis.",
    destaque: false,
    oferta: false,
  },
  {
    id: "oculos-completo-kit",
    nome: "Óculos Completo (Armação + Lente)",
    categoria: "oculos-completo",
    categoriaLabel: "Óculos Completo",
    preco: 349.0,
    precoAntigo: 429.0,
    imagem: "assets/SITE/Categorias/Oculos-Completo/capa.png",
    descricao:
      "Kit completo com armação à sua escolha e lente com tratamento antirreflexo incluído.",
    destaque: true,
    oferta: true,
  },
  {
    id: "acessorio-estojo",
    nome: "Estojo + Kit de Limpeza",
    categoria: "acessorios",
    categoriaLabel: "Acessórios",
    preco: 49.0,
    precoAntigo: null,
    imagem: "assets/SITE/Categorias/AcessoriosDeLente/capa.png",
    descricao:
      "Estojo rígido para armazenamento seguro, acompanhado de flanela e solução de limpeza para lentes.",
    destaque: false,
    oferta: false,
  },
];

/* Helpers de acesso ao catálogo */
function getProductById(id) {
  return PRODUCTS.find(function (p) {
    return p.id === id;
  });
}

function getProductsByCategory(categoria) {
  if (!categoria || categoria === "todas") return PRODUCTS.slice();
  return PRODUCTS.filter(function (p) {
    return p.categoria === categoria;
  });
}

function getOfferProducts() {
  return PRODUCTS.filter(function (p) {
    return p.oferta;
  });
}

function getFeaturedProducts() {
  return PRODUCTS.filter(function (p) {
    return p.destaque;
  });
}

function getAllCategories() {
  const seen = {};
  const list = [];
  PRODUCTS.forEach(function (p) {
    if (!seen[p.categoria]) {
      seen[p.categoria] = true;
      list.push({ value: p.categoria, label: p.categoriaLabel });
    }
  });
  return list;
}

function formatPrice(value) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}
