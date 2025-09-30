// Данные товаров (в реальном приложении будут загружаться с сервера)
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

// Инициализация корзины из localStorage или создание пустой
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM элементы
const productsContainer = document.getElementById('products-container');
const cartModal = document.getElementById('cart-modal');
const orderFormModal = document.getElementById('order-form-modal');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const cartCountElement = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const orderForm = document.getElementById('order-form');

// Отображение товаров
function displayProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">Изображение товара</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${product.price} руб.</p>
                <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Добавляем обработчики событий для кнопок добавления в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Проверяем, есть ли товар уже в корзине
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
}

// Обновление отображения корзины
function updateCart() {
    // Обновляем счетчик товаров в корзине
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Обновляем содержимое корзины в модальном окне
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Корзина пуста</p>';
        totalPriceElement.textContent = '0';
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
    
    totalPriceElement.textContent = totalPrice;
    
    // Добавляем обработчики событий для кнопок в корзине
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

// Изменение количества товара
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    // Если количество стало 0 или меньше, удаляем товар
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
        saveCartToLocalStorage();
    }
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToLocalStorage();
}

// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Открытие модального окна
function openModal(modal) {
    modal.style.display = 'block';
}

// Закрытие модального окна
function closeModal(modal) {
    modal.style.display = 'none';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCart();
    
    // Обработчики для открытия корзины
    document.querySelectorAll('.cart-icon a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(cartModal);
        });
    });
    
    // Обработчики для закрытия модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeModal(cartModal);
            closeModal(orderFormModal);
        });
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeModal(cartModal);
        }
        if (e.target === orderFormModal) {
            closeModal(orderFormModal);
        }
    });
    
    // Обработчик для кнопки оформления заказа
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Корзина пуста!');
            return;
        }
        closeModal(cartModal);
        openModal(orderFormModal);
    });
    
    // Обработчик для формы заказа
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // В реальном приложении здесь будет отправка данных на сервер
        alert('Заказ создан!');
        
        // Очищаем корзину
        cart = [];
        updateCart();
        saveCartToLocalStorage();
        
        // Закрываем модальное окно
        closeModal(orderFormModal);
        
        // Сбрасываем форму
        orderForm.reset();
    });
});
