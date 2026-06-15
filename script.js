const WHATSAPP_NUMBER = '541150373123';
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbysoYTLNiyI71_FAz7wxOZtyYDIWDtRSGgDeb7Hx6cyaKEb-N5fzgivaQZEoC61TnV5/exec';

const fallbackStock = {
  'torpedo-suela': { stock: 2, activo: true, precio: 60000 },
  'torpedo-borravino': { stock: 1, activo: true, precio: 60000 },
  'torpedo-chocolate': { stock: 1, activo: true, precio: 60000 },
  'torpedo-negro': { stock: 1, activo: true, precio: 60000 },
  'bombillon-anilla-simple-curvo-bronce': { stock: 2, activo: true, precio: 30000 },
  'bombillon-anilla-simple-recto-bronce': { stock: 2, activo: true, precio: 30000 },
  'bombillon-cincelado-premium-ancho-curvo-bronce': { stock: 2, activo: true, precio: 32000 },
  'bombillon-cincelado-premium-ancho-curvo-alpaca': { stock: 1, activo: true, precio: 32000 },
  'torpedo-roma-negro': { stock: 1, activo: true, precio: 50000 },
  'torpedo-roma-borravino': { stock: 1, activo: true, precio: 50000 },
  'mate-criollito': { stock: 2, activo: true, precio: 15000 },
  'mate-coquito': { stock: 2, activo: true, precio: 28000 },
  'mate-imperial-cuero-crudo': { stock: 1, activo: true, precio: 45000 },
  'mate-imperial-liso': { stock: 1, activo: true, precio: 35000 },
  'matera-uruguaya': { stock: 2, activo: true, precio: 25000 },
  'bombillon-cincelado-colonial': { stock: 2, activo: true, precio: 25000 },
  'bombillon-cincelado-el-noble': { stock: 2, activo: true, precio: 25000 },
};

let stockBySku = { ...fallbackStock };
const CART_STORAGE_KEY = 'lacebada_cart';
let cart = loadCartFromStorage();
let activeCatalogFilter = 'all';

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    /* almacenamiento no disponible: el carrito vive solo en memoria */
  }
}

const products = {
  'torpedo-joyero': {
    name: 'Torpedo cincelado joyero',
    categoryLabel: 'Mate · Torpedo',
    price: 60000,
    skus: ['torpedo-suela', 'torpedo-borravino', 'torpedo-chocolate', 'torpedo-negro'],
    qtyInputId: 'mateQty',
    buttonSelector: '[data-product-id="torpedo-joyero"]',
    stockMessageId: 'mateStockMessage',
    detailPriceIds: ['matePrice', 'heroProductPrice'],
    catalogPriceId: 'catalogPriceTorpedo',
    cardStockSelector: '[data-card-stock="torpedo-joyero"]',
    getOptions: () => ({ color: document.getElementById('mateColorSelect')?.value || 'Suela' }),
    getQty: () => Number(document.getElementById('mateQty')?.value || 1),
    getSku: (options) => ({
      Suela: 'torpedo-suela',
      Borravino: 'torpedo-borravino',
      Chocolate: 'torpedo-chocolate',
      Negro: 'torpedo-negro',
    }[options.color] || 'torpedo-suela'),
  },
  'bombillon-simple': {
    name: 'Bombillón anilla simple',
    categoryLabel: 'Bombillón',
    price: 30000,
    skus: ['bombillon-anilla-simple-curvo-bronce', 'bombillon-anilla-simple-recto-bronce'],
    qtyInputId: 'bombillonSimpleQty',
    buttonSelector: '[data-product-id="bombillon-simple"]',
    stockMessageId: 'bombillonSimpleStockMessage',
    detailPriceIds: ['bombillonSimplePrice'],
    catalogPriceId: 'catalogPriceBombillonSimple',
    cardStockSelector: '[data-card-stock="bombillon-simple"]',
    getOptions: () => ({
      formato: document.getElementById('bombillonSimpleShapeSelect')?.value || 'Curvo',
      pico: document.getElementById('bombillonSimpleTipSelect')?.value || 'Bronce',
    }),
    getQty: () => Number(document.getElementById('bombillonSimpleQty')?.value || 1),
    getSku: (options) => `bombillon-anilla-simple-${normalizeSlug(options.formato)}-${normalizeSlug(options.pico)}`,
  },
  'bombillon-premium': {
    name: 'Bombillón cincelado premium ancho',
    categoryLabel: 'Bombillón premium',
    price: 32000,
    skus: ['bombillon-cincelado-premium-ancho-curvo-bronce', 'bombillon-cincelado-premium-ancho-curvo-alpaca'],
    qtyInputId: 'bombillonPremiumQty',
    buttonSelector: '[data-product-id="bombillon-premium"]',
    stockMessageId: 'bombillonPremiumStockMessage',
    detailPriceIds: ['bombillonPremiumPrice'],
    catalogPriceId: 'catalogPriceBombillonPremium',
    cardStockSelector: '[data-card-stock="bombillon-premium"]',
    getOptions: () => ({
      formato: document.getElementById('bombillonPremiumShapeSelect')?.value || 'Curvo',
      pico: document.getElementById('bombillonPremiumTipSelect')?.value || 'Bronce',
    }),
    getQty: () => Number(document.getElementById('bombillonPremiumQty')?.value || 1),
    getSku: (options) => `bombillon-cincelado-premium-ancho-${normalizeSlug(options.formato)}-${normalizeSlug(options.pico)}`,
  },
  'torpedo-roma': {
    name: 'Mate Torpedo Roma',
    categoryLabel: 'Mate · Torpedo',
    price: 50000,
    skus: ['torpedo-roma-negro', 'torpedo-roma-borravino'],
    qtyInputId: 'torpedoRomaQty',
    buttonSelector: '[data-product-id="torpedo-roma"]',
    stockMessageId: 'torpedoRomaStockMessage',
    detailPriceIds: ['torpedoRomaPrice'],
    catalogPriceId: 'catalogPriceTorpedoRoma',
    cardStockSelector: '[data-card-stock="torpedo-roma"]',
    getOptions: () => ({ color: document.getElementById('torpedoRomaColorSelect')?.value || 'Negro' }),
    getQty: () => Number(document.getElementById('torpedoRomaQty')?.value || 1),
    getSku: (options) => ({
      Negro: 'torpedo-roma-negro',
      Borravino: 'torpedo-roma-borravino',
    }[options.color] || 'torpedo-roma-negro'),
  },
  'mate-criollito': {
    name: 'Mate Criollito',
    categoryLabel: 'Mate · Camionero',
    price: 15000,
    skus: ['mate-criollito'],
    qtyInputId: 'mateCriollitoQty',
    buttonSelector: '[data-product-id="mate-criollito"]',
    stockMessageId: 'mateCriollitoStockMessage',
    detailPriceIds: ['mateCriollitoPrice'],
    catalogPriceId: 'catalogPriceMateCriollito',
    cardStockSelector: '[data-card-stock="mate-criollito"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('mateCriollitoQty')?.value || 1),
    getSku: () => 'mate-criollito',
  },
  'mate-coquito': {
    name: 'Mate Coquito',
    categoryLabel: 'Mate · Camionero',
    price: 28000,
    skus: ['mate-coquito'],
    qtyInputId: 'mateCoquitoQty',
    buttonSelector: '[data-product-id="mate-coquito"]',
    stockMessageId: 'mateCoquitoStockMessage',
    detailPriceIds: ['mateCoquitoPrice'],
    catalogPriceId: 'catalogPriceMateCoquito',
    cardStockSelector: '[data-card-stock="mate-coquito"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('mateCoquitoQty')?.value || 1),
    getSku: () => 'mate-coquito',
  },
  'mate-imperial-cuero-crudo': {
    name: 'Mate Imperial Cuero Crudo',
    categoryLabel: 'Mate · Imperial',
    price: 45000,
    skus: ['mate-imperial-cuero-crudo'],
    qtyInputId: 'mateImperialCueroCrudoQty',
    buttonSelector: '[data-product-id="mate-imperial-cuero-crudo"]',
    stockMessageId: 'mateImperialCueroCrudoStockMessage',
    detailPriceIds: ['mateImperialCueroCrudoPrice'],
    catalogPriceId: 'catalogPriceMateImperialCueroCrudo',
    cardStockSelector: '[data-card-stock="mate-imperial-cuero-crudo"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('mateImperialCueroCrudoQty')?.value || 1),
    getSku: () => 'mate-imperial-cuero-crudo',
  },
  'mate-imperial-liso': {
    name: 'Mate Imperial Liso',
    categoryLabel: 'Mate · Imperial',
    price: 35000,
    skus: ['mate-imperial-liso'],
    qtyInputId: 'mateImperialLisoQty',
    buttonSelector: '[data-product-id="mate-imperial-liso"]',
    stockMessageId: 'mateImperialLisoStockMessage',
    detailPriceIds: ['mateImperialLisoPrice'],
    catalogPriceId: 'catalogPriceMateImperialLiso',
    cardStockSelector: '[data-card-stock="mate-imperial-liso"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('mateImperialLisoQty')?.value || 1),
    getSku: () => 'mate-imperial-liso',
  },
  'matera-uruguaya': {
    name: 'Matera Uruguaya',
    categoryLabel: 'Matera',
    price: 25000,
    skus: ['matera-uruguaya'],
    qtyInputId: 'materaUruguayaQty',
    buttonSelector: '[data-product-id="matera-uruguaya"]',
    stockMessageId: 'materaUruguayaStockMessage',
    detailPriceIds: ['materaUruguayaPrice'],
    catalogPriceId: 'catalogPriceMateraUruguaya',
    cardStockSelector: '[data-card-stock="matera-uruguaya"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('materaUruguayaQty')?.value || 1),
    getSku: () => 'matera-uruguaya',
  },
  'bombillon-cincelado-colonial': {
    name: 'Bombillón Cincelado Colonial',
    categoryLabel: 'Bombillón',
    price: 25000,
    skus: ['bombillon-cincelado-colonial'],
    qtyInputId: 'bombillonColonialQty',
    buttonSelector: '[data-product-id="bombillon-cincelado-colonial"]',
    stockMessageId: 'bombillonColonialStockMessage',
    detailPriceIds: ['bombillonColonialPrice'],
    catalogPriceId: 'catalogPriceBombillonColonial',
    cardStockSelector: '[data-card-stock="bombillon-cincelado-colonial"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('bombillonColonialQty')?.value || 1),
    getSku: () => 'bombillon-cincelado-colonial',
  },
  'bombillon-cincelado-el-noble': {
    name: 'Bombillón Cincelado El Noble',
    categoryLabel: 'Bombillón',
    price: 25000,
    skus: ['bombillon-cincelado-el-noble'],
    qtyInputId: 'bombillonNobleQty',
    buttonSelector: '[data-product-id="bombillon-cincelado-el-noble"]',
    stockMessageId: 'bombillonNobleStockMessage',
    detailPriceIds: ['bombillonNoblePrice'],
    catalogPriceId: 'catalogPriceBombillonNoble',
    cardStockSelector: '[data-card-stock="bombillon-cincelado-el-noble"]',
    getOptions: () => ({}),
    getQty: () => Number(document.getElementById('bombillonNobleQty')?.value || 1),
    getSku: () => 'bombillon-cincelado-el-noble',
  }
};

const catalogCopy = {
  all: {
    title: 'Todos los productos',
    subtitle: 'Explorá nuestra selección de mates y bombillones. Elegí una categoría o abrí un producto para ver detalles, variantes y agregarlo al carrito.',
    breadcrumb: 'Inicio · Catálogo'
  },
  mates: {
    title: 'Mates',
    subtitle: 'Todos los mates disponibles en La Cebada.',
    breadcrumb: 'Inicio · Catálogo · Mates'
  },
  torpedos: {
    title: 'Torpedos',
    subtitle: 'Mates torpedo de primera calidad, con estilo clásico y presencia artesanal.',
    breadcrumb: 'Inicio · Mates · Torpedos'
  },
  bombillones: {
    title: 'Bombillones',
    subtitle: 'Bombillones seleccionados para acompañar tu ritual matero.',
    breadcrumb: 'Inicio · Catálogo · Bombillones'
  },
  materas: {
    title: 'Materas',
    subtitle: 'Materas para llevar tu mate a todos lados.',
    breadcrumb: 'Inicio · Catálogo · Materas'
  },
  imperiales: {
    title: 'Imperiales',
    subtitle: 'Mates imperiales, en sus versiones premium y económica.',
    breadcrumb: 'Inicio · Mates · Imperiales'
  },
  'imperiales-premium': {
    title: 'Imperiales · Sección Premium',
    subtitle: 'Mates imperiales de nuestra línea premium.',
    breadcrumb: 'Inicio · Mates · Premium · Imperiales'
  },
  'imperiales-economica': {
    title: 'Imperiales · Sección Económica',
    subtitle: 'Mates imperiales de nuestra línea económica.',
    breadcrumb: 'Inicio · Mates · Económica · Imperiales'
  },
  camioneros: {
    title: 'Camioneros',
    subtitle: 'Mates camioneros de primera calidad.',
    breadcrumb: 'Inicio · Mates · Camioneros'
  },
  premium: {
    title: 'Mates · Sección Premium',
    subtitle: 'Nuestra línea premium de mates.',
    breadcrumb: 'Inicio · Mates · Premium'
  },
  economica: {
    title: 'Mates · Sección Económica',
    subtitle: 'Nuestra línea económica de mates.',
    breadcrumb: 'Inicio · Mates · Económica'
  }
};

function normalizeSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function optionText(options) {
  return Object.entries(options)
    .map(([key, value]) => `${capitalize(key)}: ${value}`)
    .join(', ');
}

function getStockForSku(sku) {
  const item = stockBySku[sku];

  if (!item || item.activo === false) {
    return 0;
  }

  return Math.max(0, Number(item.stock || 0));
}

function getPriceForSku(sku, fallbackPrice) {
  const item = stockBySku[sku];
  const price = Number(item && item.precio);

  if (Number.isFinite(price) && price > 0) {
    return price;
  }

  return fallbackPrice;
}

function getProductCatalogPrice(productId) {
  const product = products[productId];
  const availableSku = product.skus.find(sku => getStockForSku(sku) > 0) || product.skus[0];
  return getPriceForSku(availableSku, product.price);
}

function getReservedQtyForSku(sku) {
  return cart
    .filter(item => item.sku === sku)
    .reduce((acc, item) => acc + item.qty, 0);
}

function getRemainingStock(productId) {
  const product = products[productId];
  const options = product.getOptions();
  const sku = product.getSku(options);
  const stock = getStockForSku(sku);
  const reserved = getReservedQtyForSku(sku);

  return {
    sku,
    stock,
    reserved,
    remaining: Math.max(0, stock - reserved),
  };
}

function isProductAvailable(productId) {
  const product = products[productId];
  return product.skus.some(sku => getStockForSku(sku) > 0);
}

function updateProductPriceUI(productId) {
  const product = products[productId];
  const options = product.getOptions();
  const selectedSku = product.getSku(options);
  const selectedPrice = getPriceForSku(selectedSku, product.price);
  const catalogPrice = getProductCatalogPrice(productId);

  product.detailPriceIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = formatCurrency(selectedPrice);
  });

  const catalogPriceElement = document.getElementById(product.catalogPriceId);
  if (catalogPriceElement) catalogPriceElement.textContent = formatCurrency(catalogPrice);
}

function updateProductStockUI(productId) {
  const product = products[productId];
  const qtyInput = document.getElementById(product.qtyInputId);
  const button = document.querySelector(product.buttonSelector);
  const message = document.getElementById(product.stockMessageId);
  const stockInfo = getRemainingStock(productId);

  if (qtyInput && button && message) {
    qtyInput.max = Math.max(1, stockInfo.remaining);

    if (stockInfo.remaining <= 0) {
      qtyInput.value = 1;
      qtyInput.disabled = true;
      button.disabled = true;
      button.classList.add('disabled');
      message.textContent = 'Sin stock';
      message.classList.add('out-of-stock');
    } else {
      qtyInput.disabled = false;
      button.disabled = false;
      button.classList.remove('disabled');
      message.textContent = 'Disponible';
      message.classList.remove('out-of-stock');

      if (Number(qtyInput.value || 1) > stockInfo.remaining) {
        qtyInput.value = stockInfo.remaining;
      }
    }
  }

  const card = document.querySelector(`[data-catalog-card][data-product-id="${productId}"]`);
  const ribbon = document.querySelector(product.cardStockSelector);
  const available = isProductAvailable(productId);

  if (card) {
    card.classList.toggle('is-out-of-stock', !available);
  }

  if (ribbon) {
    ribbon.textContent = available ? '' : 'Sin stock';
    ribbon.hidden = available;
  }
}

function updateAllProductStockUI() {
  Object.keys(products).forEach(productId => {
    updateProductPriceUI(productId);
    updateProductStockUI(productId);
  });
}

function addToCart(productId) {
  const product = products[productId];
  const options = product.getOptions();
  const sku = product.getSku(options);
  const requestedQty = Math.max(1, product.getQty());
  const unitPrice = getPriceForSku(sku, product.price);
  const stock = getStockForSku(sku);
  const reserved = getReservedQtyForSku(sku);
  const remaining = Math.max(0, stock - reserved);

  if (remaining <= 0) {
    alert('Esta variante está sin stock.');
    updateAllProductStockUI();
    return;
  }

  if (requestedQty > remaining) {
    alert('No hay stock suficiente para esa cantidad.');
    updateAllProductStockUI();
    return;
  }

  const existing = cart.find(item => item.sku === sku);

  if (existing) {
    existing.qty += requestedQty;
    existing.price = unitPrice;
  } else {
    cart.push({
      key: sku,
      sku,
      productId,
      name: product.name,
      price: unitPrice,
      options,
      qty: requestedQty,
    });
  }

  renderCart();
  updateAllProductStockUI();
  openCart();
}

function removeItem(itemKey) {
  cart = cart.filter(item => item.key !== itemKey);
  renderCart();
  updateAllProductStockUI();
}

function changeQty(itemKey, delta) {
  const item = cart.find(cartItem => cartItem.key === itemKey);
  if (!item) return;

  if (delta > 0) {
    const stock = getStockForSku(item.sku);
    const reserved = getReservedQtyForSku(item.sku);

    if (reserved >= stock) {
      alert('No hay stock suficiente para agregar más unidades.');
      return;
    }
  }

  item.qty = Math.max(1, item.qty + delta);
  renderCart();
  updateAllProductStockUI();
}

function getTotal() {
  return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const checkoutButton = document.getElementById('checkoutWhatsappButton');

  if (!cartItems) return;

  cartItems.innerHTML = '';
  emptyCartMessage.style.display = cart.length === 0 ? 'block' : 'none';

  cart.forEach(item => {
    const article = document.createElement('article');
    article.className = 'cart-item';

    const optionsList = Object.entries(item.options)
      .map(([key, value]) => `<p><strong>${capitalize(key)}:</strong> ${value}</p>`)
      .join('');

    article.innerHTML = `
      <div class="cart-item-top">
        <div>
          <h4>${item.name}</h4>
          ${optionsList}
          <small>${formatCurrency(item.price)} c/u</small>
        </div>
        <button type="button" data-remove="${item.key}">Eliminar</button>
      </div>
      <div class="cart-item-actions">
        <div>
          <button type="button" data-qty="minus" data-key="${item.key}">-</button>
          <span style="padding:0 10px;font-weight:800;">${item.qty}</span>
          <button type="button" data-qty="plus" data-key="${item.key}">+</button>
        </div>
        <strong>${formatCurrency(item.price * item.qty)}</strong>
      </div>
    `;

    cartItems.appendChild(article);
  });

  document.querySelectorAll('[data-remove]').forEach(button => {
    button.addEventListener('click', () => removeItem(button.dataset.remove));
  });

  document.querySelectorAll('[data-qty]').forEach(button => {
    button.addEventListener('click', () => {
      const delta = button.dataset.qty === 'plus' ? 1 : -1;
      changeQty(button.dataset.key, delta);
    });
  });

  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  cartTotal.textContent = formatCurrency(getTotal());
  cartCount.textContent = itemCount;
  if (checkoutButton) checkoutButton.disabled = cart.length === 0;

  saveCart();
}

function validateCartAgainstStock() {
  for (const item of cart) {
    const stock = getStockForSku(item.sku);
    const qtyInCart = getReservedQtyForSku(item.sku);

    if (stock <= 0) {
      alert(`La variante ${item.name} (${optionText(item.options)}) está sin stock.`);
      return false;
    }

    if (qtyInCart > stock) {
      alert(`No hay stock suficiente para ${item.name} (${optionText(item.options)}).`);
      return false;
    }
  }

  return true;
}

function buildOrderPayload(formData) {
  return {
    nombre: formData.get('nombre') || '',
    telefono: formData.get('telefono') || '',
    email: formData.get('email') || '',
    provincia: formData.get('provincia') || '',
    localidad: formData.get('localidad') || '',
    direccion: formData.get('direccion') || '',
    barrio: formData.get('barrio') || '',
    departamento: formData.get('departamento') || '',
    codigoPostal: formData.get('codigoPostal') || '',
    productos: cart.map(item => item.name).join(' | '),
    cantidades: cart.map(item => String(item.qty)).join(' | '),
    variantes: cart.map(item => optionText(item.options)).join(' | '),
    total: formatCurrency(getTotal()),
    medioPago: 'Transferencia bancaria',
  };
}

function buildWhatsappMessage(order) {
  const lines = cart.map((item, index) => {
    return `${index + 1}. ${item.name} | ${optionText(item.options)} | Cantidad: ${item.qty} | Subtotal: ${formatCurrency(item.price * item.qty)}`;
  }).join('\n');

  const envio = [
    `Nombre: ${order.nombre}`,
    `Teléfono: ${order.telefono}`,
    `Email: ${order.email}`,
    `Provincia: ${order.provincia}`,
    `Localidad: ${order.localidad}`,
    `Dirección: ${order.direccion}`,
  ];
  if (order.barrio) envio.push(`Barrio: ${order.barrio}`);
  if (order.departamento) envio.push(`Depto/Piso: ${order.departamento}`);
  envio.push(`Código postal: ${order.codigoPostal}`);

  return `Hola La Cebada, quiero finalizar esta compra:

${lines}

Total estimado: ${formatCurrency(getTotal())}

Datos para el envío:
${envio.join('\n')}

Medio de pago: Transferencia bancaria`;
}

async function saveOrderToGoogleSheets(order) {
  await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(order),
  });
}

function syncCartWithUpdatedStock() {
  let changed = false;

  cart = cart
    .map(item => {
      const stock = getStockForSku(item.sku);

      if (stock <= 0) {
        changed = true;
        return null;
      }

      const product = products[item.productId];
      const updatedPrice = getPriceForSku(item.sku, product.price);
      let updatedItem = item;

      if (item.price !== updatedPrice) {
        changed = true;
        updatedItem = { ...updatedItem, price: updatedPrice };
      }

      if (updatedItem.qty > stock) {
        changed = true;
        return { ...updatedItem, qty: stock };
      }

      return updatedItem;
    })
    .filter(Boolean);

  if (changed) {
    renderCart();
  }

  updateAllProductStockUI();
}

function loadStockFromGoogleSheets() {
  return new Promise((resolve, reject) => {
    const callbackName = `stockCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const jsonpScript = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timeout al cargar stock'));
    }, 9000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      jsonpScript.remove();
    }

    window[callbackName] = (response) => {
      cleanup();

      if (!response || response.ok !== true || !Array.isArray(response.stock)) {
        reject(new Error('Respuesta de stock inválida'));
        return;
      }

      const nextStock = {};

      response.stock.forEach(item => {
        if (!item.sku) return;

        nextStock[item.sku] = {
          stock: Number(item.stock || 0),
          activo: item.activo !== false,
          precio: Number(item.precio || item.price || 0),
        };
      });

      stockBySku = {
        ...fallbackStock,
        ...nextStock,
      };

      syncCartWithUpdatedStock();
      resolve(stockBySku);
    };

    jsonpScript.onerror = () => {
      cleanup();
      reject(new Error('No se pudo cargar stock'));
    };

    const separator = GOOGLE_SHEETS_WEB_APP_URL.includes('?') ? '&' : '?';
    jsonpScript.src = `${GOOGLE_SHEETS_WEB_APP_URL}${separator}callback=${callbackName}&_=${Date.now()}`;
    document.body.appendChild(jsonpScript);
  });
}

function openCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');

  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('visible');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');

  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('visible');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function showCatalog(filter = 'all', shouldScroll = true) {
  activeCatalogFilter = filter;
  const listView = document.getElementById('catalogListView');
  const detailView = document.getElementById('catalogDetailView');
  const title = document.getElementById('catalogTitle');
  const subtitle = document.getElementById('catalogSubtitle');
  const breadcrumb = document.getElementById('catalogBreadcrumb');
  const copy = catalogCopy[filter] || catalogCopy.all;

  if (detailView) detailView.hidden = true;
  if (listView) listView.hidden = false;

  document.querySelectorAll('[data-detail-panel]').forEach(panel => {
    panel.hidden = true;
  });

  if (title) title.textContent = copy.title;
  if (subtitle) subtitle.textContent = copy.subtitle;
  if (breadcrumb) breadcrumb.textContent = copy.breadcrumb;

  // Mates se agrupan por ESTILO (Torpedos, Imperiales, Camioneros). La sección
  // (premium/economica) es un atributo de cada producto, no una división visual.
  const typeFilters = ['torpedos', 'imperiales', 'camioneros']; // un estilo puntual
  const sectionFilters = ['premium', 'economica'];              // una sección entera
  // Filtros combinados estilo+sección: un mismo estilo (ej. Imperiales) que existe
  // en ambas secciones, acotado a una sola (ej. solo los Imperiales premium).
  const comboFilters = {
    'imperiales-premium': { type: 'imperiales', section: 'premium' },
    'imperiales-economica': { type: 'imperiales', section: 'economica' },
  };
  const combo = comboFilters[filter];
  const isTypeFilter = typeFilters.includes(filter);
  const isSectionFilter = sectionFilters.includes(filter);
  const isMatesScoped = isTypeFilter || isSectionFilter || !!combo || filter === 'mates';

  // Cada filtro apunta a una categoría principal del catálogo.
  const filterToCategory = {
    bombillones: 'bombillones',
    materas: 'materas',
  };
  const targetCategory = isMatesScoped ? 'mates' : filterToCategory[filter];

  document.querySelectorAll('.catalog-category').forEach(section => {
    const visible = filter === 'all' || section.dataset.category === targetCategory;
    section.hidden = !visible;
  });

  // Productos de Mates: al filtrar por sección (o combinado), se ocultan los de la otra sección.
  document.querySelectorAll('.catalog-category[data-category="mates"] .catalog-product-card[data-section]').forEach(card => {
    if (isSectionFilter) {
      card.hidden = card.dataset.section !== filter;
    } else if (combo) {
      card.hidden = card.dataset.section !== combo.section;
    } else {
      card.hidden = false;
    }
  });

  // Grupos por estilo: por estilo puntual, combinado, o los que tengan al menos un producto visible.
  document.querySelectorAll('.catalog-category[data-category="mates"] .catalog-type-group').forEach(group => {
    if (isTypeFilter) {
      group.hidden = group.dataset.type !== filter;
    } else if (combo) {
      group.hidden = group.dataset.type !== combo.type;
    } else if (isSectionFilter) {
      group.hidden = !group.querySelector(`.catalog-product-card[data-section="${filter}"]`);
    } else {
      group.hidden = false;
    }
  });

  document.querySelectorAll('[data-catalog-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.catalogFilter === filter);
  });

  updateAllProductStockUI();

  if (shouldScroll) {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function showProductDetail(productId) {
  const listView = document.getElementById('catalogListView');
  const detailView = document.getElementById('catalogDetailView');

  if (listView) listView.hidden = true;
  if (detailView) detailView.hidden = false;

  document.querySelectorAll('[data-detail-panel]').forEach(panel => {
    panel.hidden = panel.dataset.detailPanel !== productId;
  });

  updateAllProductStockUI();

  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initCatalog() {
  const hasCatalog = !!document.getElementById('catalogListView');

  document.querySelectorAll('[data-catalog-filter]').forEach(element => {
    element.addEventListener('click', (event) => {
      // En otras páginas, dejamos que el enlace navegue a /catalogo#cat=...
      if (!hasCatalog) return;
      event.preventDefault();
      showCatalog(element.dataset.catalogFilter || 'all');
      const navLinks = document.querySelector('.nav-links');
      const navToggle = document.querySelector('.nav-toggle');
      navLinks?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('[data-open-product]').forEach(button => {
    button.addEventListener('click', () => {
      showProductDetail(button.dataset.openProduct);
    });
  });

  document.getElementById('backToCatalogButton')?.addEventListener('click', () => {
    showCatalog(activeCatalogFilter);
  });
}

function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  navToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initProductGallery() {
  // Galería genérica por atributos: cada thumb tiene data-image y (opcional)
  // data-variant; el <select data-image-variant> de su panel sincroniza la foto.
  document.querySelectorAll('[data-detail-thumb]').forEach(button => {
    button.addEventListener('click', () => {
      const gallery = button.closest('.detail-gallery');
      const panel = button.closest('[data-detail-panel]');
      const image = button.dataset.image;
      const alt = button.dataset.alt || '';

      gallery.querySelectorAll('[data-detail-thumb]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');

      const mainImage = gallery.querySelector('.detail-main-image');
      const zoomButton = gallery.querySelector('.detail-main-image-button');

      if (mainImage) {
        mainImage.src = image;
        if (alt) mainImage.alt = alt;
      }

      if (zoomButton) {
        zoomButton.dataset.full = image;
        if (alt) zoomButton.dataset.alt = alt;
      }

      const variant = button.dataset.variant;
      const variantSelect = panel?.querySelector('select[data-image-variant]');
      if (variant && variantSelect && variantSelect.value !== variant) {
        variantSelect.value = variant;
      }

      const productId = panel?.dataset.detailPanel;
      if (productId && products[productId]) {
        updateProductStockUI(productId);
        updateProductPriceUI(productId);
      }
    });
  });

  document.querySelectorAll('select[data-image-variant]').forEach(select => {
    select.addEventListener('change', () => {
      const panel = select.closest('[data-detail-panel]');
      const thumb = panel?.querySelector(`[data-detail-thumb][data-variant="${select.value}"]`);

      if (thumb) {
        thumb.click();
      } else {
        const productId = panel?.dataset.detailPanel;
        if (productId && products[productId]) {
          updateProductStockUI(productId);
          updateProductPriceUI(productId);
        }
      }
    });
  });

  document.querySelectorAll('.image-zoom').forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.getElementById('imageModal');
      const modalImage = document.getElementById('modalImage');

      modalImage.src = button.dataset.full;
      modalImage.alt = button.dataset.alt || '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    });
  });

  document.getElementById('modalClose')?.addEventListener('click', closeImageModal);
  document.getElementById('imageModal')?.addEventListener('click', event => {
    if (event.target.id === 'imageModal') closeImageModal();
  });
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function initCart() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => addToCart(button.dataset.productId));
  });

  document.getElementById('openCartButton')?.addEventListener('click', openCart);
  document.getElementById('closeCartButton')?.addEventListener('click', closeCart);
  document.getElementById('cartBackdrop')?.addEventListener('click', closeCart);

  document.querySelectorAll('[data-stock-watch]').forEach(element => {
    element.addEventListener('change', updateAllProductStockUI);
    element.addEventListener('input', updateAllProductStockUI);
  });

  document.getElementById('checkoutForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    if (!validateCartAgainstStock()) {
      updateAllProductStockUI();
      return;
    }

    const checkoutButton = document.getElementById('checkoutWhatsappButton');
    const originalHTML = checkoutButton.innerHTML;
    const formData = new FormData(event.currentTarget);
    const order = buildOrderPayload(formData);
    const message = buildWhatsappMessage(order);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    checkoutButton.disabled = true;
    checkoutButton.innerHTML = 'Registrando pedido...';

    try {
      await saveOrderToGoogleSheets(order);
    } catch (error) {
      console.warn('No se pudo confirmar el guardado en Google Sheets:', error);
    } finally {
      checkoutButton.disabled = false;
      checkoutButton.innerHTML = originalHTML;
      window.open(whatsappUrl, '_blank', 'noopener');
    }
  });
}

function initScrollButtons() {
  document.getElementById('scrollToProducts')?.addEventListener('click', () => {
    showCatalog('all');
  });
}

// Fondo del hero (Home): rota las fotos con fundido cruzado. Carga cada imagen
// recién cuando se necesita (la 1ª ya viene inline) para no frenar la página.
function initHeroSlideshow() {
  const box = document.querySelector('[data-hero-slideshow]');
  if (!box) return;

  const slides = Array.from(box.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  // Respetar "reducir movimiento": queda solo la primera foto, fija.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const loaded = new Set([0]);
  function loadSlide(index) {
    const slide = slides[index];
    if (!slide || loaded.has(index)) return Promise.resolve();
    const url = slide.dataset.bg;
    if (!url) { loaded.add(index); return Promise.resolve(); }
    return new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => {
        slide.style.backgroundImage = `url('${url}')`;
        loaded.add(index);
        resolve();
      };
      img.src = url;
    });
  }

  let current = 0;
  async function advance() {
    const next = (current + 1) % slides.length;
    await loadSlide(next);
    slides[current].classList.remove('is-active');
    slides[next].classList.add('is-active');
    current = next;
    loadSlide((next + 1) % slides.length); // precarga la siguiente
  }

  loadSlide(1); // dejar lista la segunda
  window.setInterval(advance, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCatalog();
  initProductGallery();
  initCart();
  initScrollButtons();
  initShare();
  initHeroSlideshow();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderCart();
  applyInitialCatalogView();
  updateAllProductStockUI();

  loadStockFromGoogleSheets().catch(error => {
    console.warn('Usando stock de respaldo porque no se pudo leer Google Sheets:', error);
    updateAllProductStockUI();
  });
});

// En /catalogo: aplica el filtro o abre el producto según el hash de la URL
// (ej. /catalogo#cat=torpedos o /catalogo#torpedo-roma). En otras páginas no hace nada.
function applyInitialCatalogView() {
  if (!document.getElementById('catalogListView')) return;

  const hash = decodeURIComponent((location.hash || '').replace(/^#/, ''));

  if (hash.startsWith('cat=')) {
    showCatalog(hash.slice(4) || 'all', false);
  } else if (hash && products[hash]) {
    showCatalog('all', false);
    showProductDetail(hash);
  } else {
    showCatalog('all', false);
  }
}

let shareToastTimer = null;
function showToast(message) {
  let toast = document.getElementById('shareToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shareToast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(shareToastTimer);
  shareToastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
}

// Botón "Compartir" por producto + hoja de opciones (WhatsApp e Instagram primero).
// Solo se activa en la página del catálogo (donde existen los paneles de detalle).
function initShare() {
  if (!document.getElementById('catalogDetailView')) return;

  const shareIcons = {
    whatsapp: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.02 3.2A12.65 12.65 0 0 0 5.1 22.2L3.6 28.8l6.78-1.44A12.66 12.66 0 1 0 16.02 3.2Zm0 22.98c-1.95 0-3.76-.55-5.32-1.5l-.38-.23-4.02.85.88-3.9-.25-.4a10.13 10.13 0 1 1 9.09 5.18Zm5.72-7.58c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.24-.69.08-.31-.16-1.33-.49-2.54-1.57-.94-.84-1.57-1.88-1.76-2.19-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.39 4.76.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.86-.76 2.12-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.61-.37Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.8 19c-.2 1-.9 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.25.25-.46.46-.95.46l.34-4.9 8.9-8c.39-.34-.08-.53-.6-.19L6.3 12.9l-4.7-1.47c-1-.32-1-1 .22-1.48L20.4 3c.85-.31 1.6.2 1.5 1.3Z"/></svg>',
  };
  const shareLetters = { facebook: 'f', x: 'X', email: '✉', link: '🔗', more: '•••' };

  // Hoja de compartir (inyectada una sola vez)
  let modal = document.getElementById('shareModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'share-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="share-backdrop" data-share-close></div>' +
      '<div class="share-sheet" role="dialog" aria-label="Compartir producto">' +
        '<div class="share-sheet-header"><h3>Compartir</h3>' +
        '<button type="button" class="share-close" data-share-close aria-label="Cerrar">✕</button></div>' +
        '<p class="share-product" id="shareProductName"></p>' +
        '<div class="share-options" id="shareOptions"></div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  const optionsEl = modal.querySelector('#shareOptions');
  const nameEl = modal.querySelector('#shareProductName');

  function openShare(id, name) {
    // URL propia del producto (con og:image/título específicos) para que la
    // previsualización en redes muestre el producto y no el logo. La página
    // redirige a /catalogo#id para las personas.
    const url = `${location.origin}/producto/${id}`;
    const text = `Mirá este producto de La Cebada: ${name}`;
    const shareText = `${text} ${url}`;
    const enc = encodeURIComponent;

    nameEl.textContent = name;

    const opts = [
      { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${enc(shareText)}` },
      { key: 'instagram', label: 'Instagram', action: 'instagram' },
      { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
      { key: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
      { key: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
      { key: 'email', label: 'Email', href: `mailto:?subject=${enc('La Cebada')}&body=${enc(shareText)}` },
      { key: 'link', label: 'Copiar enlace', action: 'copy' },
    ];
    if (navigator.share) opts.push({ key: 'more', label: 'Más apps', action: 'native' });

    optionsEl.innerHTML = '';
    opts.forEach(o => {
      const el = o.href ? document.createElement('a') : document.createElement('button');
      el.className = `share-option share-${o.key}`;
      if (o.href) {
        el.href = o.href;
        el.target = '_blank';
        el.rel = 'noopener';
      } else {
        el.type = 'button';
      }
      el.innerHTML = `<span class="share-ic">${shareIcons[o.key] || shareLetters[o.key] || ''}</span><span>${o.label}</span>`;

      el.addEventListener('click', (event) => {
        if (o.action === 'copy') {
          event.preventDefault();
          copyLink(url);
        } else if (o.action === 'instagram') {
          event.preventDefault();
          copyLink(url, 'Enlace copiado: pegalo en tu historia o mensaje de Instagram');
          window.open('https://www.instagram.com/lacebada_ok/', '_blank', 'noopener');
        } else if (o.action === 'native') {
          event.preventDefault();
          navigator.share({ title: 'La Cebada', text, url }).catch(() => {});
        }
        closeShare();
      });

      optionsEl.appendChild(el);
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeShare() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function copyLink(url, message) {
    const done = () => showToast(message || 'Enlace copiado');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
    } else {
      fallbackCopy(url, done);
    }
  }

  function fallbackCopy(url, done) {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (error) { /* sin clipboard */ }
    ta.remove();
    done();
  }

  modal.querySelectorAll('[data-share-close]').forEach(button => {
    button.addEventListener('click', closeShare);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeShare();
  });

  // Inyectar el botón "Compartir" en cada panel de detalle (después del precio)
  document.querySelectorAll('.catalog-detail-panel').forEach(panel => {
    const info = panel.querySelector('.detail-info');
    if (!info || info.querySelector('.share-button')) return;

    const id = panel.dataset.detailPanel;
    const name = (panel.querySelector('h2')?.textContent || 'Producto').trim();
    const price = info.querySelector('.detail-price');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'share-button';
    button.setAttribute('aria-label', `Compartir ${name}`);
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 6.5 12 2.5l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span>Compartir</span>';
    button.addEventListener('click', () => openShare(id, name));

    if (price && price.nextSibling) {
      info.insertBefore(button, price.nextSibling);
    } else if (price) {
      price.insertAdjacentElement('afterend', button);
    } else {
      info.appendChild(button);
    }
  });
}
