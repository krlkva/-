// Данные товаров с вашими изображениями
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

// Объект для работы с корзиной
const cart = {
    items: [],
    
    init() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartDisplay();
        this.updateProductCards(); // Обновляем карточки товаров
    },
    
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
        this.updateProductCards(); // Обновляем карточки после добавления
        showNotification('Товар добавлен в корзину!');
    },
    
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartDisplay();
        this.updateProductCards(); // Обновляем карточки после удаления
        showNotification('Товар удален из корзины');
    },
    
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
            this.updateProductCards(); // Обновляем карточки после изменения количества
        }
    },
    
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getTotalCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    getItemQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        return item ? item.quantity : 0;
    },
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },
    
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = this.getTotalCount();
        this.displayCartItems();
    },
    
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
                    <div class="cart-item-price">${item.price.toLocaleString()} руб. × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} руб.</div>
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
    
    // Обновление карточек товаров в каталоге
    updateProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = parseInt(card.querySelector('.add-to-cart').getAttribute('data-id'));
            const quantity = this.getItemQuantity(productId);
            const quantityControls = card.querySelector('.quantity-controls');
            
            if (quantity > 0) {
                quantityControls.style.display = 'flex';
                quantityControls.querySelector('.quantity').textContent = quantity;
            } else {
                quantityControls.style.display = 'none';
            }
        });
    },
    
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
        const quantity = cart.getItemQuantity(product.id);
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY3ZWVhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
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
    
    // Обработчики для кнопок "Добавить в корзину"
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
                cart.updateQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.product-card .decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.items.find(item => item.id === productId);
            if (item) {
                cart.updateQuantity(productId, item.quantity - 1);
            }
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
    cart.init();
    displayProducts();
    
    const cartModal = document.getElementById('cart-modal');
    const orderModal = document.getElementById('order-modal');
    const successModal = document.getElementById('success-modal');
    
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeOrder = document.getElementById('close-order');
    const closeSuccess = document.getElementById('close-success');
    
    cartIcon.addEventListener('click', function() {
        cartModal.style.display = 'block';
    });
    
    closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.items.length === 0) {
            showNotification('Корзина пуста! Добавьте товары перед оформлением заказа.');
            return;
        }
        cartModal.style.display = 'none';
        orderModal.style.display = 'block';
    });
    
    closeOrder.addEventListener('click', function() {
        orderModal.style.display = 'none';
    });
    
    const orderForm = document.getElementById('order-form');
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
        
        cart.items = [];
        cart.save();
        cart.updateCartDisplay();
        cart.updateProductCards();
        
        orderForm.reset();
    });
    
    closeSuccess.addEventListener('click', function() {
        successModal.style.display = 'none';
    });
    
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
