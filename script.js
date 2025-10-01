// Данные товаров
const products = [
    {
        id: 1,
        name: "Смартфон Samsung Galaxy S21",
        price: 59990,
        image: "Samsung Galaxy S21",
        description: "Флагманский смартфон с отличной камерой и производительностью. 128 ГБ памяти."
    },
    {
        id: 2,
        name: "Ноутбук Apple MacBook Air",
        price: 99990,
        image: "MacBook Air",
        description: "Легкий и мощный ноутбук для работы и творчества. Чип M1, 13 дюймов."
    },
    {
        id: 3,
        name: "Наушники Sony WH-1000XM4",
        price: 24990,
        image: "Sony WH-1000XM4",
        description: "Беспроводные наушники с продвинутым шумоподавлением."
    },
    {
        id: 4,
        name: "Фотоаппарат Canon EOS R6",
        price: 159990,
        image: "Canon EOS R6",
        description: "Профессиональная беззеркальная камера для съемки в любых условиях."
    },
    {
        id: 5,
        name: "Умные часы Apple Watch Series 7",
        price: 32990,
        image: "Apple Watch 7",
        description: "Современные умные часы с множеством функций для здоровья и fitness."
    },
    {
        id: 6,
        name: "Планшет iPad Pro 11",
        price: 74990,
        image: "iPad Pro",
        description: "Мощный планшет для работы и развлечений. 128 ГБ памяти."
    },
    {
        id: 7,
        name: "Игровая консоль PlayStation 5",
        price: 49990,
        image: "PlayStation 5",
        description: "Новейшая игровая консоль от Sony с 4K графикой."
    },
    {
        id: 8,
        name: "Телевизор LG OLED55C1",
        price: 89990,
        image: "LG OLED TV",
        description: "4K OLED телевизор с потрясающим качеством изображения. 55 дюймов."
    }
];

// Объект для работы с корзиной
const cart = {
    items: [],
    
    // Инициализация корзины из localStorage
    init() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartDisplay();
    },
    
    // Добавление товара в корзину
    add(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        this.save();
        this.updateCartDisplay();
        showNotification('Товар добавлен в корзину!');
    },
    
    // Удаление товара из корзины
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartDisplay();
        showNotification('Товар удален из корзины');
    },
    
    // Изменение количества товара
    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.remove(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.save();
            this.updateCartDisplay();
        }
    },
    
    // Получение общей стоимости
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // Получение общего количества товаров
    getTotalCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    // Сохранение корзины в localStorage
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },
    
    // Обновление отображения корзины
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = this.getTotalCount();
        this.displayCartItems();
    },
    
    // Отображение товаров в корзине
    displayCartItems() {
        const cartItems = document.getElementById('cart-items');
        const totalPrice = document.getElementById('total-price');
        
        cartItems.innerHTML = '';
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Ваша корзина пуста</p>';
            totalPrice.textContent = '0';
            return;
        }
        
        this.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} руб. × ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Удалить</button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        totalPrice.textContent = this.getTotalPrice().toLocaleString();
        this.addCartEventListeners();
    },
    
    // Добавление обработчиков событий для элементов корзины
    addCartEventListeners() {
        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                cart.remove(productId);
            });
        });
    }
};

// Функция для отображения товаров
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                ${product.image}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price.toLocaleString()} руб.</p>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                    Добавить в корзину
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Добавляем обработчики событий для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            cart.add(productId);
        });
    });
}

// Функция для показа уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем корзину и товары
    cart.init();
    displayProducts();
    
    // Получаем элементы модальных окон
    const cartModal = document.getElementById('cart-modal');
    const orderModal = document.getElementById('order-modal');
    const successModal = document.getElementById('success-modal');
    
    // Получаем кнопки открытия/закрытия модальных окон
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeOrder = document.getElementById('close-order');
    const closeSuccess = document.getElementById('close-success');
    
    // Открытие корзины
    cartIcon.addEventListener('click', function() {
        cartModal.style.display = 'block';
    });
    
    // Закрытие корзины
    closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    // Открытие формы заказа
    checkoutBtn.addEventListener('click', function() {
        if (cart.items.length === 0) {
            showNotification('Корзина пуста! Добавьте товары перед оформлением заказа.');
            return;
        }
        cartModal.style.display = 'none';
        orderModal.style.display = 'block';
    });
    
    // Закрытие формы заказа
    closeOrder.addEventListener('click', function() {
        orderModal.style.display = 'none';
    });
    
    // Обработка отправки формы заказа
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = new FormData(this);
        const order = {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            items: cart.items,
            total: cart.getTotalPrice(),
            date: new Date().toLocaleString()
        };
        
        // В реальном приложении здесь была бы отправка данных на сервер
        console.log('Заказ создан:', order);
        
        // Закрываем форму заказа
        orderModal.style.display = 'none';
        
        // Показываем сообщение об успешном заказе
        successModal.style.display = 'block';
        
        // Очищаем корзину
        cart.items = [];
        cart.save();
        cart.updateCartDisplay();
        
        // Сбрасываем форму
        orderForm.reset();
    });
    
    // Закрытие сообщения об успешном заказе
    closeSuccess.addEventListener('click', function() {
        successModal.style.display = 'none';
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
    
    // Плавная прокрутка для навигационных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
