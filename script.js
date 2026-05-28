const WHATSAPP_NUMBER = '541150373123';
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbysoYTLNiyI71_FAz7wxOZtyYDIWDtRSGgDeb7Hx6cyaKEb-N5fzgivaQZEoC61TnV5/exec';

const baseStock = {
  'torpedo-joyero|color:Suela': 2,
  'torpedo-joyero|color:Borravino': 1,
  'torpedo-joyero|color:Chocolate': 1,
  'torpedo-joyero|color:Negro': 1,
  'bombillon-simple|formato:Curvo|pico:Bronce': 2,
  'bombillon-simple|formato:Recto|pico:Bronce': 2,
  'bombillon-premium|formato:Curvo|pico:Bronce': 2,
  'bombillon-premium|formato:Curvo|pico:Alpaca': 1,
};

const products = {
  'torpedo-joyero': {
    name: 'Torpedo cincelado joyero',
    price: 60000,
    stockMessageId: 'mateStockMessage',
    qtyInputId: 'mateQty',
    getOptions: () => ({
      color: document.getElementById('mateColorSelect').value,
    }),
  },
  'bombillon-simple': {
    name: 'Bombillón anilla simple',
    price: 30000,
    stockMessageId: 'bombillonSimpleStockMessage',
    qtyInputId: 'bombillonSimpleQty',
    getOptions: () => ({
      formato: document.getElementById('bombillonSimpleShapeSelect').value,
      pico: document.getElementById('bombillonSimpleTipSelect').value,
    }),
  },
  'bombillon-premium': {
    name: 'Bombillón cincelado premium ancho',
    price: 32000,
    stockMessageId: 'bombillonPremiumStockMessage',
    qtyInputId: 'bombillonPremiumQty',
    getOptions: () => ({
      formato: document.getElementById('bombillonPremiumShapeSelect').value,
      pico: document.getElementById('bombillonPremiumTipSelect').value,
    }),
  }
};

let cart = [];

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

const mateThumbButtons = document.querySelectorAll('#mateThumbs .thumb');
const mateMainImage = document.getElementById('mateMainImage');
const mateColorSelect = document.getElementById('mateColorSelect');
const mateMainButton = document.querySelector('[data-alt="Mate Torpedo cincelado joyero"]');

mateThumbButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    mateThumbButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    mateMainImage.src = button.dataset.image;
    mateMainImage.alt = `Mate Torpedo cincelado joyero color ${button.dataset.colorName}`;
    mateColorSelect.selectedIndex = index;

    if (mateMainButton) {
      mateMainButton.dataset.full = button.dataset.image;
      mateMainButton.dataset.alt = `Mate Torpedo cincelado joyero color ${button.dataset.colorName}`;
    }

    updateStockUI();
  });
});

mateColorSelect?.addEventListener('change', () => {
  const selected = [...mateThumbButtons].find(btn => btn.dataset.colorName.toLowerCase() === mateColorSelect.value.toLowerCase());
  if (selected) selected.click();
  updateStockUI();
});

document.querySelectorAll('[data-stock-watch]').forEach(input => {
  input.addEventListener('change', updateStockUI);
});

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

function optionsKey(options) {
  return Object.entries(options)
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

function buildStockKey(productId, options) {
  return `${productId}|${optionsKey(options)}`;
}

function buildCartKey(productId, options) {
  return buildStockKey(productId, options);
}

function getCartQtyForKey(key) {
  return cart
    .filter(item => item.key === key)
    .reduce((acc, item) => acc + item.qty, 0);
}

function getAvailableStock(productId, options) {
  const key = buildStockKey(productId, options);
  const total = baseStock[key] || 0;
  const alreadyInCart = getCartQtyForKey(key);
  return Math.max(0, total - alreadyInCart);
}

function getProductQty(product) {
  const input = document.getElementById(product.qtyInputId);
  return Math.max(1, Number(input?.value || 1));
}

function setProductQty(product, qty) {
  const input = document.getElementById(product.qtyInputId);
  if (input) input.value = Math.max(1, qty);
}

function addToCart(productId) {
  const product = products[productId];
  const options = product.getOptions();
  const key = buildCartKey(productId, options);
  const available = getAvailableStock(productId, options);
  const requestedQty = getProductQty(product);

  if (available <= 0) {
    updateStockUI();
    return;
  }

  const qty = Math.min(requestedQty, available);
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      productId,
      name: product.name,
      price: product.price,
      options,
      qty,
    });
  }

  if (requestedQty > available) {
    const message = document.getElementById(product.stockMessageId);
    if (message) {
      message.textContent = 'Agregamos la cantidad máxima disponible para esta variante.';
      message.className = 'stock-message limit';
    }
  }

  setProductQty(product, 1);
  renderCart();
  updateStockUI();
  openCart();
}

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => addToCart(button.dataset.productId));
});

const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const openCartButton = document.getElementById('openCartButton');
const closeCartButton = document.getElementById('closeCartButton');
const cartItems = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutWhatsappButton = document.getElementById('checkoutWhatsappButton');

function openCart() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('visible');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('visible');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

openCartButton?.addEventListener('click', openCart);
closeCartButton?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);

function removeItem(itemKey) {
  cart = cart.filter(item => item.key !== itemKey);
  renderCart();
  updateStockUI();
}

function changeQty(itemKey, delta) {
  cart = cart.map(item => {
    if (item.key !== itemKey) return item;

    const currentStock = baseStock[item.key] || 0;
    const newQty = Math.max(1, Math.min(currentStock, item.qty + delta));
    return { ...item, qty: newQty };
  });

  renderCart();
  updateStockUI();
}

function getTotal() {
  return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
}

function renderCart() {
  cartItems.innerHTML = '';

  emptyCartMessage.style.display = cart.length === 0 ? 'block' : 'none';

  cart.forEach(item => {
    const article = document.createElement('article');
    article.className = 'cart-item';

    const optionsList = Object.entries(item.options)
      .map(([key, value]) => `<p><strong>${capitalize(key)}:</strong> ${value}</p>`)
      .join('');

    const maxQty = baseStock[item.key] || item.qty;
    const disablePlus = item.qty >= maxQty ? 'disabled' : '';

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
          <span style="padding:0 10px;font-weight:900;">${item.qty}</span>
          <button type="button" data-qty="plus" data-key="${item.key}" ${disablePlus}>+</button>
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

  const total = getTotal();
  cartTotal.textContent = formatCurrency(total);
  cartCount.textContent = cart.reduce((acc, item) => acc + item.qty, 0);
  checkoutWhatsappButton.disabled = cart.length === 0;
}

function updateStockUI() {
  Object.entries(products).forEach(([productId, product]) => {
    const options = product.getOptions();
    const available = getAvailableStock(productId, options);
    const message = document.getElementById(product.stockMessageId);
    const button = document.querySelector(`.add-to-cart[data-product-id="${productId}"]`);
    const qtyInput = document.getElementById(product.qtyInputId);

    if (!message || !button || !qtyInput) return;

    if (available <= 0) {
      message.textContent = 'Sin stock';
      message.className = 'stock-message out';
      button.disabled = true;
      qtyInput.value = 1;
      qtyInput.disabled = true;
    } else {
      message.textContent = '';
      message.className = 'stock-message';
      button.disabled = false;
      qtyInput.disabled = false;
      qtyInput.max = String(available);

      if (Number(qtyInput.value) > available) {
        qtyInput.value = available;
      }
    }
  });
}

checkoutForm?.addEventListener('submit', event => {
  event.preventDefault();

  if (cart.length === 0) {
    openCart();
    return;
  }

  if (!checkoutForm.checkValidity()) {
    checkoutForm.reportValidity();
    return;
  }

  const data = new FormData(checkoutForm);

  const productLines = cart.map((item, index) => {
    const options = Object.entries(item.options)
      .map(([key, value]) => `${capitalize(key)}: ${value}`)
      .join(', ');
    return `${index + 1}. ${item.name} | ${options} | Cantidad: ${item.qty} | Subtotal: ${formatCurrency(item.price * item.qty)}`;
  }).join('\n');

  const productsForSheet = cart.map(item => item.name).join(' | ');
  const quantitiesForSheet = cart.map(item => `${item.name}: ${item.qty}`).join(' | ');
  const variantsForSheet = cart.map(item => {
    const options = Object.entries(item.options)
      .map(([key, value]) => `${capitalize(key)}: ${value}`)
      .join(', ');
    return `${item.name}: ${options}`;
  }).join(' | ');

  const sheetPayload = {
    nombre: data.get('nombre') || '',
    telefono: data.get('telefono') || '',
    email: data.get('email') || '',
    provincia: data.get('provincia') || '',
    localidad: data.get('localidad') || '',
    direccion: data.get('direccion') || '',
    codigoPostal: data.get('codigoPostal') || '',
    productos: productsForSheet,
    cantidades: quantitiesForSheet,
    variantes: variantsForSheet,
    total: formatCurrency(getTotal()),
    medioPago: 'Transferencia bancaria'
  };

  fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(sheetPayload)
  }).catch(error => {
    console.warn('No se pudo registrar el pedido en Google Sheets:', error);
  });

  const message = `Hola La Cebada, quiero finalizar esta compra:

PRODUCTOS:
${productLines}

TOTAL ESTIMADO: ${formatCurrency(getTotal())}

DATOS PARA ENVÍO:
Nombre y apellido: ${data.get('nombre')}
Teléfono: ${data.get('telefono')}
Email: ${data.get('email')}
Provincia: ${data.get('provincia')}
Localidad: ${data.get('localidad')}
Código postal: ${data.get('codigoPostal')}
Dirección: ${data.get('direccion')}

Medio de pago: Transferencia bancaria.
Quedo atento/a para coordinar transferencia bancaria y envío por Correo Argentino.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

document.getElementById('scrollToProducts')?.addEventListener('click', () => {
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
});

const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.image-zoom').forEach(button => {
  button.addEventListener('click', () => {
    modalImage.src = button.dataset.full;
    modalImage.alt = button.dataset.alt || 'Imagen ampliada';
    imageModal.classList.add('open');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  });
});

function closeModal() {
  imageModal.classList.remove('open');
  imageModal.setAttribute('aria-hidden', 'true');
  modalImage.src = '';
  document.body.classList.remove('no-scroll');
}

modalClose?.addEventListener('click', closeModal);
imageModal?.addEventListener('click', event => {
  if (event.target === imageModal) closeModal();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
    closeCart();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

renderCart();
updateStockUI();
