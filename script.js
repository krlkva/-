// Данные товаров
const products = [
    {
        id: 1,
        name: "Multi-Peptide+HA Serum",
        price: 38400,
        description: "Сыворотка с мульти-пептидами и гиалуроновой кислотой"
    },
    {
        id: 2,
        name: "Niacinamide 10%+Zinc 1%",
        price: 12600,
        description: "Ниацинамид 10% и цинк 1% для сияния кожи"
    },
    {
        id: 3,
        name: "Lactic Acid 10%+HA",
        price: 11000,
        description: "Молочная кислота 10% и гиалуроновая кислота"
    },
    {
        id: 4,
        name: "Hyaluronic Acid 2%+B5",
        price: 19400,
        description: "Гиалуроновая кислота 2% и витамин B5"
    },
    {
        id: 5,
        name: "Buffer+Copper Peptides 1%",
        price: 38500,
        description: "Буфер и медные пептиды 1%"
    },
    {
        id: 6,
        name: "Caffeine Solution 5%+EGCG",
        price: 11000,
        description: "Раствор кофеина 5% и EGCG"
    },
    {
        id: 7,
        name: "Glycolipid Cream Cleanser",
        price: 17000,
        description: "Гликолипидный крем-очиститель"
    },
    {
        id: 8,
        name: "100% Niacinamide Powder",
        price: 8000,
        description: "100% порошок ниацинамида"
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM элементы
const productsContainer = document.getElementById('products-container');
const cartSection = document.getElementById('cart-section');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart');
const cartCount = document.getElementById('cart-count');
const totalPrice = document.getElementById('total-price');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const orderFormSection = document.getElementById('order-form-section');
const closeFormBtn = document.getElementById('close-form');
const orderForm = document.getElementById('order-form');
const orderSuccess = document.getElementById('order-success');

// Инициализация при загрузке страницы
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
            <div class="product-img">
                <i class="fas fa-spa"></i>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p>${product.description}</p>
                <p class="product-price">${product.price.toLocaleString()} ₽</p>
                <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
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
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartCount.textContent = count;
    totalPrice.textContent = total.toLocaleString();
    
    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Добавление товара в корзину
    productsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });
    
    // Управление корзиной
    cartItemsContainer.addEventListener('click', (e) => {
        const productId = parseInt(e.target.closest('button')?.dataset.id);
        
        if (!productId) return;
        
        if (e.target.classList.contains('plus') || e.target.closest('.plus')) {
            updateQuantity(productId, 1);
        } else if (e.target.classList.contains('minus') || e.target.closest('.minus')) {
            updateQuantity(productId, -1);
        } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            removeFromCart(productId);
        }
    });
    
    // Открытие/закрытие корзины
    cartBtn.addEventListener('click', () => {
        cartSection.style.display = 'block';
        orderFormSection.style.display = 'none';
    });
    
    closeCartBtn.addEventListener('click', () => {
        cartSection.style.display = 'none';
    });
    
    // Оформление заказа
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
            return;
        }
        
        cartSection.style.display = 'none';
        orderFormSection.style.display = 'block';
    });
    
    closeFormBtn.addEventListener('click', () => {
        orderFormSection.style.display = 'none';
    });
    
    // Отправка формы заказа
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = new FormData(orderForm);
        const order = {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString()
        };
        
        // В реальном приложении здесь была бы отправка данных на сервер
        console.log('Заказ создан:', order);
        
        // Показываем сообщение об успехе
        orderSuccess.style.display = 'block';
        
        // Очищаем корзину
        cart = [];
        renderCart();
        
        // Скрываем форму
        orderFormSection.style.display = 'none';
        
        // Сбрасываем форму
        orderForm.reset();
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
            orderSuccess.style.display = 'none';
        }, 3000);
    });
}

// Добавление товара в корзину
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
            quantity: 1
        });
    }
    
    renderCart();
    
    // Анимация добавления
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 200);
}

// Изменение количества товара
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

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}
