// Данные товаров
const products = [
    { id: 1, name: "Черный планшет", price: 345, image: "placeholder.jpg" },
    { id: 2, name: "Держатель для ручек", price: 55, image: "placeholder.jpg" },
    { id: 3, name: "Набор черных маркеров", price: 81, image: "placeholder.jpg" },
    { id: 4, name: "Керамический горшок", price: 14, image: "placeholder.jpg" },
    { id: 5, name: "Черная скрепка", price: 10, image: "placeholder.jpg" },
    { id: 6, name: "Цветная коробка", price: 126, image: "placeholder.jpg" },
    { id: 7, name: "Трубчатая бумажная коробка", price: 67, image: "placeholder.jpg" },
    { id: 8, name: "Синий горшок", price: 78, image: "placeholder.jpg" },
    { id: 9, name: "Холодная металлическая коробка", price: 89, image: "placeholder.jpg" }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция отображения товаров
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">${product.name}</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${product.price} руб.</p>
                <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Добавляем обработчики для кнопок
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Добавление в корзину
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
    
    updateCart();
    saveCartToLocalStorage();
    alert('Товар добавлен в корзину!');
}

// Обновление корзины
function updateCart() {
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    // Обновляем счетчик
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
    
    // Обновляем содержимое корзины
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Корзина пуста</p>';
            if (totalPriceElement) totalPriceElement.textContent = '0';
            return;
        }
        
        let totalPrice = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} руб. × ${item.quantity} = ${itemTotal} руб.</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Удалить</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        if (totalPriceElement) totalPriceElement.textContent = totalPrice;
        
        // Добавляем обработчики для кнопок в корзине
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                updateQuantity(productId, -1);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                updateQuantity(productId, 1);
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }
}

// Изменение количества
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
        saveCartToLocalStorage();
    }
}

// Удаление из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToLocalStorage();
}

// Сохранение в localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, инициализация...');
    
    // Отображаем товары
    displayProducts();
    updateCart();
    
    // Находим элементы
    const cartModal = document.getElementById('cart-modal');
    const orderFormModal = document.getElementById('order-form-modal');
    const cartLink = document.getElementById('cart-link');
    const checkoutBtn = document.getElementById('checkout-btn');
    const orderForm = document.getElementById('order-form');
    const closeButtons = document.querySelectorAll('.close');
    
    // Проверяем, что элементы найдены
    if (!cartModal) console.error('Не найден элемент cart-modal');
    if (!orderFormModal) console.error('Не найден элемент order-form-modal');
    if (!cartLink) console.error('Не найден элемент cart-link');
    
    // Открытие корзины
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Открытие корзины');
            cartModal.style.display = 'block';
        });
    }
    
    // Закрытие модальных окон
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartModal.style.display = 'none';
            orderFormModal.style.display = 'none';
        });
    });
    
    // Закрытие при клике вне окна
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === orderFormModal) {
            orderFormModal.style.display = 'none';
        }
    });
    
    // Оформление заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }
            cartModal.style.display = 'none';
            orderFormModal.style.display = 'block';
        });
    }
    
    // Форма заказа
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Заказ создан!');
            
            // Очищаем корзину
            cart = [];
            updateCart();
            saveCartToLocalStorage();
            
            // Закрываем окно и сбрасываем форму
            orderFormModal.style.display = 'none';
            orderForm.reset();
        });
    }
    
    console.log('Инициализация завершена');
});
