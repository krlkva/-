// ===== ДАННЫЕ ТОВАРОВ =====

// Массив с информацией о всех товарах в магазине
const products = [
    {
        id: 1,
        name: "Смартфон Samsung Galaxy S21",
        price: 59990,
        image: "images/smartphone.jpg", // Путь к вашему изображению
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

// Объект для управления корзиной
const cart = {
    items: [], // Массив товаров в корзине
    
    // Инициализация корзины при загрузке страницы
    init() {
        try {
            // Пытаемся загрузить корзину из localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
            // Убеждаемся, что все количества являются числами
            this.items = this.items.map(item => ({
                ...item,
                quantity: Number(item.quantity) || 1
            }));
            this.save();
        } catch (error) {
            console.error('Ошибка при загрузке корзины:', error);
            this.items = [];
            this.save();
        }
        this.updateCartDisplay();
        this.updateProductCards();
    },
    
    // Добавление товара в корзину
    add(productId) {
        // Находим товар по ID
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Проверяем, есть ли товар уже в корзине
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            // Если товар уже есть - увеличиваем количество
            existingItem.quantity += 1;
        } else {
            // Если товара нет - добавляем новый
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
        // Если количество меньше 1 - удаляем товар
        if (newQuantity < 1) {
            this.remove(productId);
            return;
        }
        
        // Находим товар и обновляем количество
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Number(newQuantity);
            this.save();
            this.updateCartDisplay();
            this.updateProductCards();
        }
    },
    
    // Расчет общей стоимости корзины
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
        // Защита от NaN
        cartCount.textContent = isNaN(totalCount) ? '0' : totalCount.toString();
        this.displayCartItems();
    },
    
    // Отображение товаров в корзине
    displayCartItems() {
        const cartItems = document.getElementById('cart-items');
        const totalPrice = document.getElementById('total-price');
        
        // Очищаем контейнер
        cartItems.innerHTML = '';
        
        // Если корзина пуста
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Ваша корзина пуста</p>';
            totalPrice.textContent = '0';
            return;
        }
        
        // Создаем элементы для каждого товара в корзине
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
        
        // Обновляем общую сумму
        const total = this.getTotalPrice();
        totalPrice.textContent = isNaN(total) ? '0' : total.toLocaleString();
        this.addCartEventListeners();
    },
    
    // Обновление карточек товаров в каталоге
    updateProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (!addToCartBtn) return;
            
            const productId = parseInt(addToCartBtn.getAttribute('data-id'));
            const quantity = this.getItemQuantity(productId);
            const quantityControls = card.querySelector('.quantity-controls');
            const addButton = card.querySelector('.add-to-cart');
            
            // Показываем/скрываем элементы управления в зависимости от количества
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
    
    // Добавление обработчиков событий для корзины
    addCartEventListeners() {
        // Кнопки увеличения количества в корзине
        document.querySelectorAll('#cart-items .increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, (Number(item.quantity) || 0) + 1);
                }
            });
        });
        
        // Кнопки уменьшения количества в корзине
        document.querySelectorAll('#cart-items .decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) {
                    cart.updateQuantity(productId, (Number(item.quantity) || 0) - 1);
                }
            });
        });
        
        // Кнопки удаления из корзины
        document.querySelectorAll('#cart-items .remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                cart.remove(productId);
            });
        });
    }
};

// ===== ОТОБРАЖЕНИЕ ТОВАРОВ =====

// Функция для отображения товаров в каталоге
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) {
        console.error('Элемент products-grid не найден!');
        return;
    }
    
    // Очищаем сетку товаров
    productsGrid.innerHTML = '';
    
    // Создаем карточку для каждого товара
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
                
                <!-- Элементы управления количеством (изначально скрыты) -->
                <div class="quantity-controls" style="display: ${quantity > 0 ? 'flex' : 'none'}">
                    <button class="quantity-btn decrease" data-id="${product.id}">-</button>
                    <span class="quantity">${quantity}</span>
                    <button class="quantity-btn increase" data-id="${product.id}">+</button>
                </div>
                
                <!-- Кнопка добавления в корзину -->
                <button class="btn btn-primary add-to-cart" data-id="${product.id}" style="display: ${quantity > 0 ? 'none' : 'block'}">
                    Добавить в корзину
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Добавляем обработчики для кнопок "Добавить в корзину"
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

// ===== УВЕДОМЛЕНИЯ =====

// Функция для показа уведомлений
function showNotification(message) {
    // Удаляем существующие уведомления
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent =
