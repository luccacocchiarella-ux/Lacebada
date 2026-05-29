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
};

let stockBySku = { ...fallbackStock };
let cart = [];

const products = {
  'torpedo-joyero': {
    name: 'Torpedo cincelado joyero',
    price: 60000,
    qtyInputId: 'mateQty',
    buttonSelector: '[data-product-id="torpedo-joyero"]',
    stockMessageId: 'mateStockMessage',
    getOptions: () => ({ color: document.getElementById('mateColorSelect').value }),
    getQty: () => Number(document.getElementById('mateQty').value || 1),
    getSku: (options) => ({
      Suela: 'torpedo-suela',
      Borravino: 'torpedo-borravino',
      Chocolate: 'torpedo-chocolate',
      Negro: 'torpedo-negro',
    }[options.color]),
  },
  'bombillon-simple': {
    name: 'Bombillón anilla simple',
    price: 30000,
    qtyInputId: 'bombillonSimpleQty',
    buttonSelector: '[data-product-id="bombillon-simple"]',
    stockMessageId: 'bombillonSimpleStockMessage',
    getOptions: () => ({
      formato: document.getElementById('bombillonSimpleShapeSelect').value,
      pico: document.getElementById('bombillonSimpleTipSelect').value,
    }),
    getQty: () => Number(document.getElementById('bombillonSimpleQty').value || 1),
    getSku: (options) => `bombillon-anilla-simple-${normalizeSlug(options.formato)}-${normalizeSlug(options.pico)}`,
  },
  'bombillon-premium': {
    name: 'Bombillón cincelado premium ancho',
    price: 32000,
    qtyInputId: 'bombillonPremiumQty',
    buttonSelector: '[data-product-id="bombillon-premium"]',
    stockMessageId: 'bombillonPremiumStockMessage',
    getOptions: () => ({
      formato: document.getElementById('bombillonPremiumShapeSelect').value,
      pico: document.getElementById('bombillonPremiumTipSelect').value,
    }),
    getQty: () => Number(document.getElementById('bombillonPremiumQty').value || 1),
    getSku: (options) => `bombillon-cincelado-premium-ancho-${normalizeSlug(options.formato)}-${normalizeSlug(options.pico)}`,
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
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
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

  if (!item || item.activo === false) return 0;

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

function updateProductPriceUI(productId) {
  const product = products[productId];
  const options = product.getOptions();
  const sku = product.getSku(options);
  const price = getPriceForSku(sku, product.price);

  const priceElementMap = {
    'torpedo-joyero': ['matePrice', 'heroProductPrice'],
    'bombillon-simple': ['bombillonSimplePrice'],
    'bombillon-premium': ['bombillonPremiumPrice'],
  };

  (priceElementMap[productId] || []).forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = formatCurrency(price);
  });
}

function getReservedQtyForSku(sku) {
  return cart.filter(item => item.sku === sku).reduce((acc, item) => acc + item.qty, 0);
}

function getRemainingStock(productId) {
  const product = products[productId];
  const options = product.getOptions();
  const sku = product.getSku(options);
  const stock = getStockForSku(sku);
  const reserved = getReservedQtyForSku(sku);

  return { sku, stock, reserved, remaining: Math.max(0, stock - reserved) };
}

function updateProductStockUI(productId) {
  const product = products[productId];
  const qtyInput = document.getElementById(product.qtyInputId);
  const button = document.querySelector(product.buttonSelector);
  const message = document.getElementById(product.stockMessageId);
  const stockInfo = getRemainingStock(productId);

  if (!qtyInput || !button || !message) return;

  if (stockInfo.remaining <= 0) {
    qtyInput.value = 1;
    qtyInput.disabled = true;
    button.disabled = true;
    button.classList.add('disabled');
    message.textContent = 'Sin stock';
    message.classList.add('out-of-stock');
    return;
  }

  qtyInput.disabled = false;
  button.disabled = false;
  button.classList.remove('disabled');
  qtyInput.max = stockInfo.remaining;
  message.textContent = 'Disponible';
  message.classList.remove('out-of-stock');

  if (Number(qtyInput.value || 1) > stockInfo.remaining) {
    qtyInput.value = stockInfo.remaining;
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
  } else {
    cart.push({ key: sku, sku, productId, name: product.name, price: unitPrice, options, qty: requestedQty });
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

  return `Hola La Cebada, quiero finalizar esta compra:

${lines}

Total estimado: ${formatCurrency(getTotal())}

Datos para el envío:
Nombre: ${order.nombre}
Teléfono: ${order.telefono}
Email: ${order.email}
Provincia: ${order.provincia}
Localidad: ${order.localidad}
Dirección: ${order.direccion}
Código postal: ${order.codigoPostal}

Medio de pago: Transferencia bancaria`;
}

async function saveOrderToGoogleSheets(order) {
  await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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

  if (changed) renderCart();
  updateAllProductStockUI();
}

function loadStockFromGoogleSheets() {
  return new Promise((resolve, reject) => {
    const callbackName = `stockCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timeout al cargar stock'));
    }, 9000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
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

      stockBySku = { ...fallbackStock, ...nextStock };
      syncCartWithUpdatedStock();
      resolve(stockBySku);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('No se pudo cargar stock'));
    };

    const separator = GOOGLE_SHEETS_WEB_APP_URL.includes('?') ? '&' : '?';
    script.src = `${GOOGLE_SHEETS_WEB_APP_URL}${separator}callback=${callbackName}&_=${Date.now()}`;
    document.body.appendChild(script);
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
  const mateThumbButtons = document.querySelectorAll('#mateThumbs .thumb');
  const mateMainImage = document.getElementById('mateMainImage');
  const mateColorSelect = document.getElementById('mateColorSelect');
  const mainZoomButton = document.querySelector('.gallery-main-button');

  mateThumbButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      mateThumbButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      mateMainImage.src = button.dataset.image;
      mateMainImage.alt = `Mate Torpedo cincelado joyero color ${button.dataset.colorName}`;

      if (mainZoomButton) {
        mainZoomButton.dataset.full = button.dataset.image;
        mainZoomButton.dataset.alt = `Mate Torpedo cincelado joyero color ${button.dataset.colorName}`;
      }

      mateColorSelect.selectedIndex = index;
      updateProductStockUI('torpedo-joyero');
    });
  });

  mateColorSelect?.addEventListener('change', () => {
    const selected = [...mateThumbButtons].find(btn => btn.dataset.colorName.toLowerCase() === mateColorSelect.value.toLowerCase());
    if (selected) selected.click();
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
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProductGallery();
  initCart();
  initScrollButtons();

  document.getElementById('year').textContent = new Date().getFullYear();

  renderCart();
  updateAllProductStockUI();

  loadStockFromGoogleSheets().catch(error => {
    console.warn('Usando stock de respaldo porque no se pudo leer Google Sheets:', error);
    updateAllProductStockUI();
  });
});
