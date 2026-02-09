// Данные товаров с изображениями
const products = [
    {
        id: 1,
        name: "CLINIQUE cheek pop",
        price: 2500,
        description: "цвет Black Honey",
        image: "images/blush 2.JPG",
        badge: "NEW"
    },
    {
        id: 2,
        name: "Dior Backstage Glow Face Palette",
        price: 8900,
        description: "цвет 001",
        image: "images/highlighter.JPG"
    },
    {
        id: 3,
        name: "Гель-фиксатор для бровей PUSY",
        price: 1000,
        description: "Гель для бровей фиксурующий стойуий прозрачный 5мл",
        image: "images/eyebrow_gel.JPG",
        badge: "BEST SELLER"
    },
    {
        id: 4,
        name: "Maybelline Sky High тушь для ресниц",
        price: 1600,
        description: "Тушь для ресниц удлиняющаяя и объемная",
        image: "images/mascara.JPG"
    },
    {
        id: 5,
        name: "Кремовые румяна RHODE",
        price: 6500,
        description: "Кремовые румяна в стике оттенок Piggi",
        image: "images/blush.JPG",
        badge: "NEW"
    },
    {
        id: 6,
        name: "Блеск для губ KIKO Milano Lip Volume",
        price: 1100,
        description: "цвет Tutu Rose",
        image: "images/lipgloss.JPG"
    },
    {
        id: 7,
        name: "Расческа Tangle Teezer The Ultimate",
        price: 2000,
        description: "Расческа The Ultimate (Wet) Detangler Henna Red",
        image: "images/hairbrush.JPG"
    },
    {
        id: 8,
        name: "Miss Dior Eau De Parfum",
        price: 11000,
        description: "Парфюмерная вода",
        image: "images/perfume.JPG"
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM элементы
const productsContainer = document.getElementById('products-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart');
const cartCount = document.getElementById('cart-count');
const totalPrice = document.getElementById('total-price');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeFormBtn = document.getElementById('close-form');
const orderForm = document.getElementById('order-form');
const orderSuccess = document.getElementById('order-success');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    setupEventListeners();
});

// Отображение товаров
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString()} ₽</p>
                <button class="buy-btn" data-id="${product.id}">КУПИТЬ</button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
}

// Отображение корзины
function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
        cartCount.textContent = '0';
        totalPrice.textContent = '0';
        return;
    }
    
    emptyCartMsg.style.display = 'none';
    
    let total = 0;
    let count = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">УДАЛИТЬ</button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartCount.textContent = count;
    totalPrice.textContent = total.toLocaleString();
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Добавление в корзину
    productsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });
    
    // Управление корзиной
    cartItemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const productId = parseInt(btn.dataset.id);
        
        if (btn.classList.contains('plus')) {
            updateQuantity(productId, 1);
        } else if (btn.classList.contains('minus')) {
            updateQuantity(productId, -1);
        } else if (btn.classList.contains('remove-btn')) {
            removeFromCart(productId);
        }
    });
    
    // Открытие/закрытие корзины
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
    });
    
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });
    
    // Оформление заказа
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        cartSidebar.classList.remove('active');
        modalOverlay.classList.add('active');
    });
    
    // Закрытие формы
    closeFormBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });
    
    // Отправка формы
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(orderForm);
        const order = {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString()
        };
        
        console.log('Order placed:', order);
        
        // Показываем уведомление
        orderSuccess.classList.add('active');
        
        // Очищаем корзину
        cart = [];
        renderCart();
        
        // Закрываем форму
        modalOverlay.classList.remove('active');
        
        // Сбрасываем форму
        orderForm.reset();
        
        // Скрываем уведомление
        setTimeout(() => {
            orderSuccess.classList.remove('active');
        }, 3000);
    });
}

// Функции корзины
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    renderCart();
    
    // Анимация
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 200);
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}


