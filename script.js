let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartBtn = document.getElementById('open-cart');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');

const orderModal = document.getElementById('order-modal');
const closeOrder = document.getElementById('close-order');
const orderForm = document.getElementById('order-form');

// открытие/закрытие корзины
cartBtn.onclick = () => { cartModal.style.display = 'block'; renderCart(); }
closeCart.onclick = () => { cartModal.style.display = 'none'; }

// открытие формы заказа
checkoutBtn.onclick = () => {
  cartModal.style.display = 'none';
  orderModal.style.display = 'block';
}
closeOrder.onclick = () => { orderModal.style.display = 'none'; }

// добавить товар
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    const product = e.target.closest('.product');
    const id = product.dataset.id;
    const name = product.querySelector('h3').textContent;
    const price = +product.dataset.price;

    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }

    saveCart();
  });
});

// отрисовка корзины
function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    cartItems.innerHTML += `
      <div>
        ${item.name} (${item.qty} шт.) - ${item.price * item.qty} ₽
        <button onclick="removeItem(${index})">Удалить</button>
      </div>`;
  });

  cartTotal.textContent = total;
}

// удалить товар
function removeItem(i) {
  cart.splice(i, 1);
  saveCart();
  renderCart();
}

// сохранить корзину
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// оформление заказа
orderForm.addEventListener('submit', e => {
  e.preventDefault();
  alert('Заказ создан!');
  cart = [];
  saveCart();
  orderModal.style.display = 'none';
});
