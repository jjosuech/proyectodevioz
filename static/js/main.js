// main.js - Funcionalidades para el ecommerce Devioz Gaming

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let products = [];
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Inicializar la aplicación
    initApp();

    function initApp() {
        loadProducts();
        setupEventListeners();
        updateCartCount();
        setupProductInteractions();
        initTheme(); // ← Inicializar tema
    }

    // ===== DARK/LIGHT MODE FUNCTIONS =====
    function initTheme() {
        // Aplicar tema guardado
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('theme-toggle').checked = false;
        }
        
        // Configurar event listener para el toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', toggleTheme);
        }
    }

    function toggleTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle.checked) {
            // Cambiar a dark mode
            document.body.classList.add('dark-mode');
            currentTheme = 'dark';
            showNotification('Modo oscuro activado');
        } else {
            // Cambiar a light mode
            document.body.classList.remove('dark-mode');
            currentTheme = 'light';
            showNotification('Modo claro activado');
        }
        
        // Guardar preferencia
        localStorage.setItem('theme', currentTheme);
    }

    // Cargar productos desde el JSON
    async function loadProducts() {
        try {
            const response = await fetch('assets/css/data/products.json');
            products = await response.json();
            console.log('Productos cargados:', products);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Botones de añadir al carrito
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart')) {
                const button = e.target.classList.contains('add-to-cart') ? 
                    e.target : e.target.closest('.add-to-cart');
                addToCartHandler(button);
            }
        });

        // Botón de búsqueda
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', toggleSearch);
        }

        // Botón del carrito
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', toggleCart);
        }

        // Botón de usuario
        const userBtn = document.querySelector('.user-btn');
        if (userBtn) {
            userBtn.addEventListener('click', toggleUserMenu);
        }

        // CTA button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', scrollToProducts);
        }
    }

    // Manejar añadir al carrito
    function addToCartHandler(button) {
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = getProductPrice(productCard);
        const productImage = productCard.querySelector('img').src;

        const product = {
            id: generateProductId(productName),
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };

        addToCart(product);
        showAddToCartAnimation(button);
    }

    // Obtener precio del producto
    function getProductPrice(productCard) {
        const currentPriceElement = productCard.querySelector('.current-price');
        if (currentPriceElement) {
            const priceText = currentPriceElement.textContent;
            return parseFloat(priceText.replace('$', '').replace(',', ''));
        }
        return 0;
    }

    // Generar ID único para producto
    function generateProductId(name) {
        return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    }

    // Añadir producto al carrito
    function addToCart(product) {
        const existingProduct = cart.find(item => item.name === product.name);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Producto añadido al carrito');
    }

    // Actualizar contador del carrito
    function updateCartCount() {
        const cartBtn = document.querySelector('.cart-btn');
        const existingBadge = cartBtn.querySelector('.cart-badge');
        
        if (existingBadge) {
            existingBadge.remove();
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = totalItems;
            cartBtn.appendChild(badge);
        }
    }

    // Animación al añadir al carrito
    function showAddToCartAnimation(button) {
        button.style.transform = 'scale(0.95)';
        button.style.backgroundColor = '#4CAF50';
        button.textContent = '✓ Añadido';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.backgroundColor = '';
            button.textContent = 'Añadir al Carrito';
        }, 1500);
    }

    // Mostrar notificación
    function showNotification(message) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Estilos de la notificación
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Configurar cierre
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            closeNotification(notification);
        });

        // Cierre automático
        setTimeout(() => {
            closeNotification(notification);
        }, 3000);
    }

    function closeNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Funcionalidad de búsqueda
    function toggleSearch() {
        const searchContainer = document.querySelector('.search-container') || createSearchContainer();
        searchContainer.classList.toggle('active');
        
        if (searchContainer.classList.contains('active')) {
            const input = searchContainer.querySelector('input');
            input.focus();
        }
    }

    function createSearchContainer() {
        const container = document.createElement('div');
        container.className = 'search-container';
        container.innerHTML = `
            <div class="search-box">
                <input type="text" placeholder="Buscar productos...">
                <button class="search-submit"><i class="fas fa-search"></i></button>
                <button class="search-close"><i class="fas fa-times"></i></button>
            </div>
        `;

        // Estilos del buscador
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: flex-start;
            padding-top: 100px;
            z-index: 2000;
        `;

        const searchBox = container.querySelector('.search-box');
        searchBox.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            display: flex;
            gap: 10px;
        `;

        const input = searchBox.querySelector('input');
        input.style.cssText = `
            flex: 1;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        `;

        document.body.appendChild(container);

        // Event listeners del buscador
        const closeBtn = container.querySelector('.search-close');
        closeBtn.addEventListener('click', toggleSearch);

        const submitBtn = container.querySelector('.search-submit');
        submitBtn.addEventListener('click', performSearch);

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        return container;
    }

    function performSearch() {
        const input = document.querySelector('.search-container input');
        const query = input.value.trim();
        
        if (query) {
            alert(`Buscando: ${query}`);
            // Aquí implementarías la búsqueda real
            toggleSearch();
        }
    }

    // Funcionalidad del carrito
    function toggleCart() {
        const cartSidebar = document.querySelector('.cart-sidebar') || createCartSidebar();
        cartSidebar.classList.toggle('active');
    }

    function createCartSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'cart-sidebar';
        sidebar.innerHTML = `
            <div class="cart-header">
                <h3>Tu Carrito</h3>
                <button class="cart-close">&times;</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    Total: $<span class="total-amount">0</span>
                </div>
                <button class="checkout-btn">Proceder al Pago</button>
            </div>
        `;

        // Estilos del carrito
        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: -400px;
            width: 400px;
            height: 100%;
            background: white;
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
            transition: right 0.3s ease;
            z-index: 1001;
            display: flex;
            flex-direction: column;
        `;

        document.body.appendChild(sidebar);

        // Event listeners del carrito
        const closeBtn = sidebar.querySelector('.cart-close');
        closeBtn.addEventListener('click', toggleCart);

        const checkoutBtn = sidebar.querySelector('.checkout-btn');
        checkoutBtn.addEventListener('click', proceedToCheckout);

        // Cerrar al hacer click fuera
        sidebar.addEventListener('click', function(e) {
            if (e.target === sidebar) {
                toggleCart();
            }
        });

        updateCartSidebar();
        return sidebar;
    }

    function updateCartSidebar() {
        const cartItems = document.querySelector('.cart-items');
        const totalAmount = document.querySelector('.total-amount');
        
        if (!cartItems) return;

        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            totalAmount.textContent = '0';
            return;
        }

        let total = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">&times;</button>
                </div>
            `;
            cartItems.appendChild(itemElement);

            total += item.price * item.quantity;
        });

        totalAmount.textContent = total.toFixed(2);

        // Agregar event listeners a los botones
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveItem);
        });
    }

    function handleQuantityChange(e) {
        const productId = e.target.dataset.id;
        const isPlus = e.target.classList.contains('plus');
        
        const product = cart.find(item => item.id === productId);
        
        if (product) {
            if (isPlus) {
                product.quantity += 1;
            } else {
                product.quantity = Math.max(1, product.quantity - 1);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateCartSidebar();
        }
    }

    function handleRemoveItem(e) {
        const productId = e.target.dataset.id;
        cart = cart.filter(item => item.id !== productId);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartSidebar();
        showNotification('Producto eliminado del carrito');
    }

    function proceedToCheckout() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        alert('Redirigiendo al checkout...');
        // Aquí implementarías la lógica real de checkout
    }

    // Menú de usuario
    function toggleUserMenu() {
        alert('Funcionalidad de usuario - En desarrollo');
        // Aquí implementarías el menú de usuario
    }

    // Scroll a productos
    function scrollToProducts() {
        const productsSection = document.querySelector('.new-products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Interacciones de productos
    function setupProductInteractions() {
        // Efectos hover en productos
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Cambio de imágenes en hover (simulado)
        const productImages = document.querySelectorAll('.product-image');
        
        productImages.forEach(container => {
            const img = container.querySelector('img');
            const originalSrc = img.src;
            
            container.addEventListener('mouseenter', function() {
                // En una implementación real, cambiarías a otra imagen del producto
                img.style.transform = 'scale(1.1)';
            });
            
            container.addEventListener('mouseleave', function() {
                img.style.transform = 'scale(1)';
            });
        });
    }

    // Prevenir comportamiento por defecto en enlaces
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
            e.preventDefault();
        }
    });

    // Cerrar menús al hacer scroll
    window.addEventListener('scroll', function() {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer && searchContainer.classList.contains('active')) {
            toggleSearch();
        }
    });

    console.log('Devioz Gaming Ecommerce inicializado');
});