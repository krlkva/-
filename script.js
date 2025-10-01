// ===== ДАННЫЕ ТОВАРОВ =====
const products = [
    {
        id: 1,
        name: "Смартфон Samsung Galaxy S21",
        price: 59990,
        image: "images/smartphone.jpg",
        description: "Флагманский смартфон с отличной камерой и производительностью. 128 ГБ памяти."
    },
    {
        id: 2,
        name: "Ноутбук Apple MacBook Air",
        price: 99990,
        image: "images/laptop.jpg",
        description: "Легкий и мощный ноутбук для работы и творчества. Чип M1, 13 дюймов."
    },
    {
        id: 3,
        name: "Наушники Sony WH-1000XM4",
        price: 24990,
        image: "images/headphones.jpg",
        description: "Беспроводные наушники с продвинутым шумоподавлением."
    },
    {
        id: 4,
        name: "Фотоаппарат Canon EOS R6",
        price: 159990,
        image: "images/camera.jpg",
        description: "Профессиональная беззеркальная камера для съемки в любых условиях."
    },
    {
        id: 5,
        name: "Умные часы Apple Watch Series 7",
        price: 32990,
        image: "images/smartwatch.jpg",
        description: "Современные умные часы с множеством функций для здоровья и fitness."
    },
    {
        id: 6,
        name: "Планшет iPad Pro 11",
        price: 74990,
        image: "images/tablet.jpg",
        description: "Мощный планшет для работы и развлечений. 128 ГБ памяти."
    },
    {
        id: 7,
        name: "Игровая консоль PlayStation 5",
        price: 49990,
        image: "images/console.jpg",
        description: "Новейшая игровая консоль от Sony с 4K графикой."
    },
    {
        id: 8,
        name: "Телевизор LG OLED55C1",
        price: 89990,
        image: "images/tv.jpg",
        description: "4K OLED телевизор с потрясающим качеством изображения. 55 дюймов."
    }
];

// ===== КОРЗИНА =====
const cart = {
    items: [],
    
    // Инициализация корзины
    init() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Проверяем, что в корзине есть товары и это массив
                if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                    this.items = parsedCart.map(item => ({
                        ...item,
                        quantity: Number(item.quantity) || 1
                    }));
                } else {
                    this.items = []; // Если данные некорректны - очищаем корзину
                }
            } else {
                this.items = []; // Если в localStorage ничего нет
            }
            this.save();
        } catch (error) {
            console.error('Ошибка при загрузке корзины:', error);
            this.items = []; // При ошибке очищаем корзину
            this.save();
        }
        this.updateCartDisplay();
        this.updateProductCards();
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
        this.updateProductCards();
        showNotification('Товар добавлен в корзину!');
    },
    
    // Удаление товара из корзины
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartDisplay();
        this.updateProductCards();
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
            item.quantity = Number(newQuantity);
            this.save();
            this.updateCartDisplay();
            this.updateProductCards();
        }
    },
    
    // Полная очистка корзины
    clear() {
        this.items = [];
        this.save();
        this.updateCartDisplay();
        this.updateProductCards();
        showNotification('Корзина очищена');
    },
    
    // Расчет общей стоимости
    getTotalPrice() {
        return this.items.reduce((total, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
    },
    
    // Расчет общего количества товаров
    getTotalCount() {
        return this.items.reduce((total, item) => {
            const quantity = Number(item.quantity) || 0;
            return total + quantity;
        }, 0);
    },
    
    // Получение количества конкретного товара
    getItemQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        return item ? Number(item.quantity) : 0;
    },
    
    // Сохранение корзины в localStorage
    save() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Ошибка при сохранении корзины:', error);
        }
    },
    
    // Обновление отображения корзины
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const totalCount = this.getTotalCount();
        cartCount.textContent = isNaN(totalCount) ? '0' : totalCount.toString();
        this.displayCartItems();
    },
    
    // Отображение товаров в корзине
    displayCartItems() {
        const cartItems = document.getElementById('cart-items');
        const totalPrice = document.getElementById('total-price');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        // Очищаем контейнер
        cartItems.innerHTML = '';
        
        // Проверяем, пуста ли корзина
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p style="text-align: center; padding: 3rem; color: #666; font-size: 1.1rem;">
                        Ваша корзина пуста
                    </p>
                    <p style="text-align: center; color: #999; margin-top: -2rem;">
                        Добавьте товары из каталога
                    </p>
                </div>
            `;
            totalPrice.textContent = '0';
            if (checkoutBtn) {
                checkoutBtn.style.opacity = '0.6';
                checkoutBtn.style.cursor = 'not-allowed';
            }
            return;
        }
        
        // Если корзина не пуста - активируем кнопку оформления
        if (checkoutBtn) {
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
        
        // Создаем элементы для каждого товара
        this.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">
                        ${(Number(item.price) || 0).toLocaleString()} руб. × ${Number(item.quantity) || 0} = ${itemTotal.toLocaleString()} руб.
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${Number(item.quantity) || 0}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Удалить</button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Добавляем кнопку очистки корзины
        const clearCartBtn = document.createElement('button');
        clearCartBtn.className = 'btn btn-danger';
        clearCartBtn.textContent = 'Очистить корзину';
        clearCartBtn.style.marginTop = '1rem';
        clearCartBtn.style.width = '100%';
        clearCartBtn.addEventListener('click', () => {
            this.clear();
        });
        
        cartItems.appendChild(clearCartBtn);
        
        // Обновляем общую сумму
        const total = this.getTotalPrice();
        totalPrice.textContent = isNaN(total) ? '0' : total.toLocaleString();
        this.addCartEventListeners();
    },
    
    // Обновление карточек товаров
    updateProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (!addToCartBtn) return;
            
            const productId = parseInt(addToCartBtn.getAttribute('data-id'));
            const quantity = this.getItemQuantity(productId);
            const quantityControls = card.querySelector('.quantity-controls');
            const addButton = card.querySelector('.add-to-cart');
            
            if (quantity > 0) {
                if (quantityControls) quantityControls.style.display = 'flex';
                if (addButton) addButton.style.display = 'none';
                const quantityElement = card.querySelector('.quantity');
                if (quantityElement) quantityElement.textContent = quantity;
            } else {
                if (quantityControls) quantityControls.style.display = 'none';
                if (addButton) addButton.style.display = 'block';
            }
        });
    },
    
    // Добавление обработчиков событий
    addCartEventListeners() {
        document.querySelectorAll('#cart-items .increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, (Number(item.quantity) || 0) + 1);
                }
            });
        });
        
        document.querySelectorAll('#cart-items .decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, (Number(item.quantity) || 0) - 1);
                }
            });
        });
        
        document.querySelectorAll('#cart-items .remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                cart.remove(productId);
            });
        });
    }
};

// ===== ОТОБРАЖЕНИЕ ТОВАРОВ =====
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) {
        console.error('Элемент products-grid не найден!');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        const quantity = cart.getItemQuantity(product.id);
        
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div class=\"product-image-placeholder\">📱 ${product.name.split(' ')[0]}</div>'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price.toLocaleString()} руб.</p>
                
                <div class="quantity-controls" style="display: ${quantity > 0 ? 'flex' : 'none'}">
                    <button class="quantity-btn decrease" data-id="${product.id}">-</button>
                    <span class="quantity">${quantity}</span>
                    <button class="quantity-btn increase" data-id="${product.id}">+</button>
                </div>
                
                <button class="btn btn-primary add-to-cart" data-id="${product.id}" style="display: ${quantity > 0 ? 'none' : 'block'}">
                    Добавить в корзину
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Обработчики событий
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            cart.add(productId);
        });
    });
    
    document.querySelectorAll('.product-card .increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.items.find(item => item.id === productId);
            if (item) {
                cart.updateQuantity(productId, (Number(item.quantity) || 0) + 1);
            }
        });
    });
    
    document.querySelectorAll('.product-card .decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.items.find(item => item.id === productId);
            if (item) {
                cart.updateQuantity(productId, (Number(item.quantity) || 0) - 1);
            }
        });
    });
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message) {
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    // Очищаем возможные старые данные (для тестирования)
    // localStorage.removeItem('cart'); // Раскомментируйте эту строку, чтобы очистить корзину
    
    cart.init();
    displayProducts();
    
    // Получаем элементы
    const cartModal = document.getElementById('cart-modal');
    const orderModal = document.getElementById('order-modal');
    const successModal = document.getElementById('success-modal');
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeOrder = document.getElementById('close-order');
    const closeSuccess = document.getElementById('close-success');
    
    // Открытие корзины
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            if (cartModal) cartModal.style.display = 'block';
        });
    }
    
    // Закрытие корзины
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            if (cartModal) cartModal.style.display = 'none';
        });
    }
    
    // Оформление заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.items.length === 0) {
                showNotification('Корзина пуста! Добавьте товары перед оформлением заказа.');
                return;
            }
            if (cartModal) cartModal.style.display = 'none';
            if (orderModal) orderModal.style.display = 'block';
        });
    }
    
    // Закрытие формы заказа
    if (closeOrder) {
        closeOrder.addEventListener('click', function() {
            if (orderModal) orderModal.style.display = 'none';
        });
    }
    
    // Обработка формы заказа
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
            
            console.log('Заказ создан:', order);
            
            if (orderModal) orderModal.style.display = 'none';
            if (successModal) successModal.style.display = 'block';
            
            // Очищаем корзину после заказа
            cart.clear();
            
            orderForm.reset();
        });
    }
    
    // Закрытие успешного заказа
    if (closeSuccess) {
        closeSuccess.addEventListener('click', function() {
            if (successModal) successModal.style.display = 'none';
        });
    }
    
    // Закрытие модальных окон по клику вне их
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
    
    // Плавная прокрутка
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

// Добавляем стили для уведомлений
if (!document.querySelector('style[data-notifications]')) {
    const style = document.createElement('style');
    style.setAttribute('data-notifications', 'true');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .product-image-placeholder {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.2rem;
            text-align: center;
            padding: 1rem;
        }
        
        .empty-cart {
            padding: 2rem;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
}
