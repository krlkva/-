/* app.js — минималистичная логика корзины (обновлённая) */

const PRODUCTS = [
  { id:1, title: "Cobb Chair", price: 1290, img: "https://via.placeholder.com/800x600?text=Cobb+Chair" },
  { id:2, title: "Luna Seat", price: 1490, img: "https://via.placeholder.com/800x600?text=Luna+Seat" },
  { id:3, title: "Oak Minimal", price: 1990, img: "https://via.placeholder.com/800x600?text=Oak+Minimal" },
  { id:4, title: "Velvet Soft", price: 1790, img: "https://via.placeholder.com/800x600?text=Velvet+Soft" },
  { id:5, title: "Wire Frame", price: 990, img: "https://via.placeholder.com/800x600?text=Wire+Frame" },
  { id:6, title: "Pine Classic", price: 1150, img: "https://via.placeholder.com/800x600?text=Pine+Classic" },
  { id:7, title: "Bistro Compact", price: 850, img: "https://via.placeholder.com/800x600?text=Bistro+Compact" },
  { id:8, title: "Studio Luxe", price: 2390, img: "https://via.placeholder.com/800x600?text=Studio+Luxe" },
  { id:9, title: "Foldit", price: 690, img: "https://via.placeholder.com/800x600?text=Foldit" },
  { id:10, title: "Roundback", price: 1590, img: "https://via.placeholder.com/800x600?text=Roundback" }
];

const STORAGE_KEY = 'lab_shop_cart_v2';
let cart = {}; // { id: { id, title, price, qty, img } }

const $products = document.getElementById('products');
const $cartCount = document.getElementById('cart-count');
const $cartItems = document.getElementById('cart-items');
const $cartTotal = document.getElementById('cart-total');
const $checkoutBtn = document.getElementById('checkout-btn');
const $cart = document.getElementById('cart');
const $cartToggle = document.getElementById('cart-toggle');

const $modal = document.getElementById('modal');
const $modalBackdrop = document.getElementById('modal-backdrop');
const $modalClose = document.getElementById('modal-close');
const $orderForm = document.getElementById('order-form');
const $orderMsg = document.getElementById('order-msg');

// --- Helpers ---
function formatPrice(n){
  return n.toLocaleString('ru-RU') + ' ₽';
}
function saveCart(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function loadCart(){
  const raw = localStorage.getItem(STORAGE_KEY);
  try{
    cart = raw ? JSON.parse(raw) : {};
  }catch(e){
    cart = {};
  }
}

// --- Render products dynamically ---
function renderProducts(){
  $products.innerHTML = '';
  PRODUCTS.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card';
    el.setAttribute('role','listitem');
    el.innerHTML = `
      <div class="tag">CHAIR</div>
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <div class="meta">
        <div class="price">${formatPrice(p.price)}</div>
        <div class="actions">
          <button class="btn add" data-id="${p.id}">Добавить</button>
        </div>
      </div>
    `;
    $products.appendChild(el);
  });
}

// --- Cart calculations and render ---
function cartTotals(){
  const items = Object.values(cart);
  const count = items.reduce((s,i)=> s + i.qty, 0);
  const sum = items.reduce((s,i)=> s + i.qty * i.price, 0);
  return {count, sum};
}

function renderCart(){
  const totals = cartTotals();
  $cartCount.textContent = totals.count;
  $cartTotal.textContent = formatPrice(totals.sum);
  $checkoutBtn.disabled = totals.count === 0;

  const items = Object.values(cart);
  if(items.length === 0){
    $cartItems.innerHTML = '<p style="color:var(--muted)">Корзина пуста</p>';
    return;
  }
  $cartItems.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${it.img}" alt="${it.title}">
      <div style="flex:1">
        <div style="font-weight:600">${it.title}</div>
        <div style="color:var(--muted);font-size:0.9rem">${formatPrice(it.price)}</div>
      </div>
      <div style="text-align:right">
        <div class="qty">
          <input type="number" min="1" value="${it.qty}" data-id="${it.id}" class="qty-input" />
        </div>
        <div style="margin-top:8px;font-weight:700">${formatPrice(it.qty * it.price)}</div>
        <div style="margin-top:8px">
          <button class="btn remove" data-id="${it.id}">Удалить</button>
        </div>
      </div>
    `;
    $cartItems.appendChild(div);
  });
}

// --- Operations ---
function addToCart(id){
  const prod = PRODUCTS.find(p => p.id === +id);
  if(!prod) return;
  if(cart[id]) cart[id].qty++;
  else cart[id] = { id: prod.id, title: prod.title, price: prod.price, qty:1, img: prod.img };
  saveCart();
  renderCart();
}
function removeFromCart(id){
  delete cart[id];
  saveCart();
  renderCart();
}
function setQty(id, qty){
  qty = Math.max(1, Math.floor(qty) || 1);
  if(cart[id]) cart[id].qty = qty;
  saveCart();
  renderCart();
}

// --- Events: use delegation so buttons added dynamically always work ---
document.addEventListener('click', (e) => {
  // add button
  if(e.target.matches('.btn.add')){
    addToCart(e.target.dataset.id);
    // небольшой визуальный отклик
    e.target.textContent = 'Добавлено';
    setTimeout(()=> e.target.textContent = 'Добавить', 700);
    return;
  }

  // remove button
  if(e.target.matches('.btn.remove')){
    removeFromCart(e.target.dataset.id);
    return;
  }

  // cart toggle
  if(e.target === $cartToggle){
    const hidden = $cart.getAttribute('aria-hidden') === 'true';
    $cart.setAttribute('aria-hidden', String(!hidden));
    $cart.style.display = hidden ? 'block' : 'none';
    $cartToggle.setAttribute('aria-expanded', String(hidden));
    return;
  }

  // checkout open modal
  if(e.target === $checkoutBtn){
    openModal();
    return;
  }

  // modal backdrop or close
  if(e.target === $modalBackdrop || e.target === $modalClose){
    closeModal();
    return;
  }
});

// qty input change
$cartItems.addEventListener('input', (e) => {
  if(e.target.matches('.qty-input')){
    const id = e.target.dataset.id;
    const val = parseInt(e.target.value, 10) || 1;
    setQty(id, val);
  }
});

// modal functions
function openModal(){
  $modal.setAttribute('aria-hidden','false');
  $modal.style.display = 'block';
  $orderMsg.textContent = '';
}
function closeModal(){
  $modal.setAttribute('aria-hidden','true');
  $modal.style.display = 'none';
  $orderForm.reset();
}

// order submit
$orderForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const data = new FormData($orderForm);
  const fname = data.get('firstName')?.trim();
  const lname = data.get('lastName')?.trim();
  const address = data.get('address')?.trim();
  const phone = data.get('phone')?.trim();
  if(!fname || !lname || !address || !phone){
    $orderMsg.style.color = 'crimson';
    $orderMsg.textContent = 'Пожалуйста, заполните все поля';
    return;
  }
  $orderMsg.style.color = 'green';
  $orderMsg.textContent = 'Заказ создан!';
  // clear cart
  cart = {};
  saveCart();
  renderCart();
  setTimeout(closeModal, 1200);
});

// init
function init(){
  renderProducts();
  loadCart();
  renderCart();

  // show cart on desktop
  if(window.innerWidth > 900){
    $cart.setAttribute('aria-hidden','false');
    $cart.style.display = 'block';
  } else {
    $cart.setAttribute('aria-hidden','true');
    $cart.style.display = 'none';
  }
}
init();
