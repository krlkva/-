// Данные товаров
const products = [
    {
        id: 1,
        name: "Samsung Galaxy S21",
        price: 59990,
        image: "images/7384989961.jpg",
        description: "Флагманский смартфон с отличной камерой"
    },
    {
        id: 2,
        name: "MacBook Air M2",
        price: 99990,
        image: "images/laptop.jpg", 
        description: "Легкий и мощный ноутбук"
    },
    {
        id: 3,
        name: "Sony WH-1000XM4",
        price: 24990,
        image: "images/headphones.jpg",
        description: "Наушники с шумоподавлением"
    },
    {
        id: 4,
        name: "Canon EOS R6",
        price: 159990,
        image: "images/camera.jpg",
        description: "Профессиональная камера"
    },
    {
        id: 5,
        name: "Apple Watch Series 7",
        price: 32990,
        image: "images/smartwatch.jpg",
        description: "Умные часы с функциями здоровья"
    },
    {
        id: 6,
        name: "iPad Pro 11",
        price: 74990,
        image: "images/tablet.jpg",
        description: "Мощный планшет для работы"
    },
    {
        id: 7,
        name: "PlayStation 5",
        price: 49990,
        image: "images/console.jpg",
        description: "Игровая консоль нового поколения"
    },
    {
        id: 8,
        name: "LG OLED C1",
        price: 89990,
        image: "images/tv.jpg",
        description: "4K телевизор с OLED дисплеем"
    }
];

// Корзина
const cart = {
    items: [],
    
    init() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartDisplay();
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
        this.updateProductCards();
        showNotification('Товар добавлен в корзину');
    },
    
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartDisplay();
        this.updateProductCards();
        showNotification('Товар удален');
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
            this.updateProductCards();
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
        if (cartCount) {
            cartCount.textContent = this.getTotalCount();
        }
        this.displayCartItems();
    },
    
   displayCartItems() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    if (!cartItems) return;
    
    cartItems.innerHTML = '';
    
    if (this.items.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: #666;">
                <p style="margin-bottom: 1rem; font-weight: 700; font-size: 1.3rem; letter-spacing: -0.02em;">КОРЗИНА ПУСТА</p>
                <p style="font-size: 1rem; color: #999; letter-spacing: -0.01em;">Добавьте товары из каталога</p>
            </div>
        `;
        if (totalPrice) totalPrice.textContent = '0';
        return;
    }
        
        this.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const itemTotal = item.price * item.quantity;
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
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
        
        if (totalPrice) {
            totalPrice.textContent = this.getTotalPrice().toLocaleString();
        }
        
        this.addCartEventListeners();
    },
    
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
                    quantityControls.querySelector('.quantity').textContent = quantity;
                }
                if (addButton) addButton.style.display = 'none';
            } else {
                if (quantityControls) quantityControls.style.display = 'none';
                if (addButton) addButton.style.display = 'block';
            }
        });
    },
    
    addCartEventListeners() {
        document.querySelectorAll('#cart-items .increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) cart.updateQuantity(productId, item.quantity + 1);
            });
        });
        
        document.querySelectorAll('#cart-items .decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const item = cart.items.find(item => item.id === productId);
                if (item) cart.updateQuantity(productId, item.quantity - 1);
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

// Отображение товаров
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        const quantity = cart.getItemQuantity(product.id);
        
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="product-image-placeholder" style="display: none;"></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price.toLocaleString()} ₽</p>
                
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
            if (item) cart.updateQuantity(productId, item.quantity + 1);
        });
    });
    
    document.querySelectorAll('.product-card .decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.items.find(item => item.id === productId);
            if (item) cart.updateQuantity(productId, item.quantity - 1);
        });
    });
}

// Уведомления
function showNotification(message) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Очистка для тестирования
    // localStorage.removeItem('cart');
    
    cart.init();
    displayProducts();
    
    // Элементы
    const cartModal = document.getElementById('cart-modal');
    const orderModal = document.getElementById('order-modal');
    const successModal = document.getElementById('success-modal');
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeOrder = document.getElementById('close-order');
    const closeSuccess = document.getElementById('close-success');
    const orderForm = document.getElementById('order-form');
    
    // События
    if (cartIcon) cartIcon.addEventListener('click', () => cartModal.style.display = 'block');
    if (closeCart) closeCart.addEventListener('click', () => cartModal.style.display = 'none');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.items.length === 0) {
                showNotification('Корзина пуста');
                return;
            }
            cartModal.style.display = 'none';
            orderModal.style.display = 'block';
        });
    }
    
    if (closeOrder) closeOrder.addEventListener('click', () => orderModal.style.display = 'none');
    if (closeSuccess) closeSuccess.addEventListener('click', () => successModal.style.display = 'none');
    
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            console.log('Заказ:', {
                name: formData.get('first-name'),
                items: cart.items,
                total: cart.getTotalPrice()
            });
            
            orderModal.style.display = 'none';
            successModal.style.display = 'block';
            
            cart.items = [];
            cart.save();
            cart.updateCartDisplay();
            cart.updateProductCards();
            
            orderForm.reset();
        });
    }
    
    // Закрытие по клику вне окна
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) cartModal.style.display = 'none';
        if (e.target === orderModal) orderModal.style.display = 'none';
        if (e.target === successModal) successModal.style.display = 'none';
    });
});



