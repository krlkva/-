// Данные товаров
const products = [
    {
        id: 1,
        name: "Смартфон Samsung Galaxy S21",
        price: 59990,
        image: "images/7384989961.jpg",
        description: "Флагманский смартфон с отличной камерой и производительностью."
    },
    {
        id: 2,
        name: "Ноутбук Apple MacBook Air",
        price: 99990,
        image: "images/laptop.jpg",
        description: "Легкий и мощный ноутбук для работы и творчества."
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
        description: "Профессиональная беззеркальная камера."
    },
    {
        id: 5,
        name: "Умные часы Apple Watch Series 7",
        price: 32990,
        image: "images/smartwatch.jpg",
        description: "Современные умные часы с множеством функций."
    },
    {
        id: 6,
        name: "Планшет iPad Pro 11",
        price: 74990,
        image: "images/tablet.jpg",
        description: "Мощный планшет для работы и развлечений."
    },
    {
        id: 7,
        name: "Игровая консоль PlayStation 5",
        price: 49990,
        image: "images/console.jpg",
        description: "Новейшая игровая консоль от Sony."
    },
    {
        id: 8,
        name: "Телевизор LG OLED55C1",
        price: 89990,
        image: "images/tv.jpg",
        description: "4K OLED телевизор с потрясающим качеством."
    }
];

// Объект корзины
const cart = {
    items: [],
    
    // Инициализация корзины с очисткой старых данных
    init() {
        console.log('Инициализация корзины...');
        
        // ОЧИСТКА СТАРЫХ ДАННЫХ - раскомментируйте на время тестирования
        localStorage.removeItem('cart');
        
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                
                // Проверяем структуру данных
                if (Array.isArray(parsedCart)) {
                    // Фильтруем только корректные товары
                    this.items = parsedCart.filter(item => 
                        item && 
                        typeof item.id === 'number' && 
                        typeof item.quantity === 'number' && 
                        item.quantity > 0
                    ).map(item => ({
                        id: Number(item.id),
                        name: String(item.name || 'Товар'),
                        price: Number(item.price) || 0,
                        quantity: Number(item.quantity) || 1,
                        image: String(item.image || '')
                    }));
                    
                    console.log('Загружена корзина:', this.items);
                } else {
                    this.items = [];
                }
            } else {
                this.items = [];
            }
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            this.items = [];
        }
        
        this.save();
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
            console.error('Ошибка сохранения корзины:', error);
        }
    },
    
    // Обновление отображения корзины
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalCount();
        }
        this.displayCartItems();
    },
    
    // Отображение товаров в корзине
    displayCartItems() {
        const cartItems = document.getElementById('cart-items');
        const totalPrice = document.getElementById('total-price');
        
        if (!cartItems) {
            console.error('Не найден элемент cart-items');
            return;
        }
        
        cartItems.innerHTML = '';
        
        // Если корзина пуста
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <p style="font-size: 2rem; margin-bottom: 1rem;">🛒</p>
                        <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">Ваша корзина пуста</p>
                        <p style="color: #999;">Добавьте товары из каталога</p>
                    </div>
                </div>
            `;
            if (totalPrice) totalPrice.textContent = '0';
            return;
        }
        
        // Отображаем товары в корзине
        this.items.forEach(item => {
            // Проверяем корректность данных
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 0;
            const itemTotal = itemPrice * itemQuantity;
            const itemName = String(item.name || 'Товар');
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${itemName}</div>
                    <div class="cart-item-price">
                        ${itemPrice.toLocaleString()} руб. × ${itemQuantity} = <strong>${itemTotal.toLocaleString()} руб.</strong>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${itemQuantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Удалить</button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Добавляем кнопку очистки корзины
        const clearButton = document.createElement('button');
        clearButton.className = 'btn btn-danger';
        clearButton.textContent = 'Очистить корзину';
        clearButton.style.marginTop = '1rem';
        clearButton.style.width = '100%';
        clearButton.addEventListener('click', () => {
            this.clear();
        });
        
        cartItems.appendChild(clearButton);
        
        // Обновляем общую сумму
        if (totalPrice) {
            const total = this.getTotalPrice();
            totalPrice.textContent = total.toLocaleString();
        }
        
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
                if (quantityControls) {
                    quantityControls.style.display = 'flex';
                    const quantityElement = quantityControls.querySelector('.quantity');
                    if (quantityElement) quantityElement.textContent = quantity;
                }
                if (addButton) addButton.style.display = 'none';
            } else {
                if (quantityControls) quantityControls.style.display = 'none';
                if (addButton) addButton.style.display = 'block';
            }
        });
    },
    
    // Добавление обработчиков событий
    addCartEventListeners() {
        // Кнопки увеличения количества
        document.querySelectorAll('#cart-items .increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, (Number(item.quantity) || 0) + 1);
                }
            });
        });
        
        // Кнопки уменьшения количества
        document.querySelectorAll('#cart-items .decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, (Number(item.quantity) || 0) - 1);
                }
            });
        });
        
        // Кнопки удаления
        document.querySelectorAll('#cart-items .remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                cart.remove(productId);
            });
        });
    }
};

// Функция отображения товаров
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) {
        console.error('Не найден элемент products-grid');
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
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="product-image-placeholder" style="display: none;">
                    📱 ${product.name.split(' ')[0]}
                </div>
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
                
                <button class="btn btn-primary add-to-cart" data-id="${product.id}" 
                        style="display: ${quantity > 0 ? 'none' : 'block'}">
                    Добавить в корзину
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Обработчики событий для кнопок добавления в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            cart.add(productId);
        });
    });
    
    // Обработчики для кнопок управления количеством в карточках
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

// Функция уведомлений
function showNotification(message) {
    // Удаляем старые уведомления
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка страницы...');
    
    // ОЧИСТКА СТАРОЙ КОРЗИНЫ - обязательно для исправления бага
    localStorage.removeItem('cart');
    
    // Инициализируем корзину
    cart.init();
    
    // Отображаем товары
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
    const orderForm = document.getElementById('order-form');
    
    // Открытие корзины
    if (cartIcon && cartModal) {
        cartIcon.addEventListener('click', function() {
            console.log('Открытие корзины');
            cartModal.style.display = 'block';
        });
    }
    
    // Закрытие корзины
    if (closeCart && cartModal) {
        closeCart.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Оформление заказа
    if (checkoutBtn && cartModal && orderModal) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.items.length === 0) {
                showNotification('Корзина пуста! Добавьте товары перед оформлением заказа.');
                return;
            }
            cartModal.style.display = 'none';
            orderModal.style.display = 'block';
        });
    }
    
    // Закрытие формы заказа
    if (closeOrder && orderModal) {
        closeOrder.addEventListener('click', function() {
            orderModal.style.display = 'none';
        });
    }
    
    // Обработка формы заказа
    if (orderForm && orderModal && successModal) {
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
            
            orderModal.style.display = 'none';
            successModal.style.display = 'block';
            
            // Очищаем корзину после заказа
            cart.clear();
            
            orderForm.reset();
        });
    }
    
    // Закрытие успешного заказа
    if (closeSuccess && successModal) {
        closeSuccess.addEventListener('click', function() {
            successModal.style.display = 'none';
        });
    }
    
    // Закрытие по клику вне окна
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) cartModal.style.display = 'none';
        if (e.target === orderModal) orderModal.style.display = 'none';
        if (e.target === successModal) successModal.style.display = 'none';
    });
    
    console.log('Страница загружена');
});

