// Variables globales
let cart = [];
let cartTotal = 0;
let isLoading = true;

// Elementos del DOM
const loader = document.getElementById('loader');
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const cartToggle = document.getElementById('cart-toggle');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const backToTop = document.getElementById('back-to-top');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función de inicialización principal
function initializeApp() {
    // Simular carga
    setTimeout(() => {
        hideLoader();
        initializeComponents();
    }, 2000);
}

// Ocultar loader
function hideLoader() {
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    isLoading = false;
}

// Inicializar componentes
function initializeComponents() {
    // Cargar carrito desde localStorage
    loadCartFromStorage();
    
    // Inicializar event listeners
    initializeEventListeners();
    
    // Inicializar navegación
    initializeNavigation();
    
    // Inicializar scroll effects
    initializeScrollEffects();
    
    // Inicializar tabs del menú
    initializeMenuTabs();
    
    // Inicializar animaciones
    initializeAnimations();
    
    // Inicializar formularios
    initializeForms();
}

// Event listeners
function initializeEventListeners() {
    // Botones de agregar al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .quick-add');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Navegación móvil
    navToggle?.addEventListener('click', toggleMobileNav);
    
    // Carrito
    cartToggle?.addEventListener('click', openCartModal);
    closeCart?.addEventListener('click', closeCartModal);
    checkoutBtn?.addEventListener('click', openCheckoutModal);
    closeCheckout?.addEventListener('click', closeCheckoutModal);
    
    // Back to top
    backToTop?.addEventListener('click', scrollToTop);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', handleOutsideClick);
    
    // Scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Resize events
    window.addEventListener('resize', handleResize);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyboard);
}

// Navegación
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Cerrar menú móvil
                    closeMobileNav();
                    
                    // Actualizar indicador activo
                    updateActiveNavLink(this);
                }
            }
        });
    });
}

// Efectos de scroll
function initializeScrollEffects() {
    // Intersection Observer para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observar elementos animables
    const animatableElements = document.querySelectorAll('[data-aos]');
    animatableElements.forEach(el => observer.observe(el));
}

// Tabs del menú
function initializeMenuTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const menuCategories = document.querySelectorAll('.menu-category');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Actualizar botones activos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar categoría correspondiente
            menuCategories.forEach(category => {
                category.classList.remove('active');
                if (category.id === targetTab) {
                    category.classList.add('active');
                }
            });
        });
    });
}

// Animaciones
function initializeAnimations() {
    // Animación de elementos flotantes
    animateFloatingElements();
    
    // Animación de números (counters)
    animateCounters();
}

// Formularios
function initializeForms() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Funciones de carrito
function addToCart(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));
    
    if (!productName || !productPrice) return;
    
    // Animación del botón
    button.classList.add('adding');
    setTimeout(() => button.classList.remove('adding'), 300);
    
    // Buscar si el producto ya existe en el carrito
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${productName} agregado al carrito`, 'success');
    
    // Efecto visual en el icono del carrito
    animateCartIcon();
}

function updateCartDisplay() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Mostrar/ocultar badge del carrito
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
    
    // Actualizar total
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = cartTotal.toFixed(0);
    
    // Actualizar items del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega algunos productos deliciosos</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity('${item.name}')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity('${item.name}')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item" onclick="removeItem('${item.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }
}

function increaseQuantity(productName) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += 1;
        updateCartDisplay();
        saveCartToStorage();
    }
}

function decreaseQuantity(productName) {
    const item = cart.find(item => item.name === productName);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        updateCartDisplay();
        saveCartToStorage();
    }
}

function removeItem(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${productName} eliminado del carrito`, 'info');
}

// Funciones de modales
function openCartModal() {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    cartModal.setAttribute('aria-hidden', 'false');
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    cartModal.setAttribute('aria-hidden', 'true');
}

function openCheckoutModal() {
    if (cart.length === 0) return;
    
    // Actualizar resumen del pedido
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(0)}</span>
        </div>
    `).join('');
    
    orderTotal.textContent = cartTotal.toFixed(0);
    
    closeCartModal();
    checkoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    checkoutModal.setAttribute('aria-hidden', 'false');
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    checkoutModal.setAttribute('aria-hidden', 'true');
    
    // Ocultar información de transferencia
    const transferInfo = document.getElementById('transfer-info');
    if (transferInfo) {
        transferInfo.style.display = 'none';
    }
}

// Funciones de pago
function payWithMercadoPago() {
    const orderSummary = cart.map(item => 
        `${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(0)}`
    ).join('\n');
    
    const message = `¡Hola! Quiero realizar este pedido:\n\n${orderSummary}\n\nTotal: $${cartTotal.toFixed(0)}\n\nPago con Mercado Pago: https://link.mercadopago.com.mx/coffehavana`;
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/5256616581011?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Redirigir a Mercado Pago
    setTimeout(() => {
        window.open('https://link.mercadopago.com.mx/coffehavana', '_blank');
    }, 1000);
    
    // Limpiar carrito después del pago
    setTimeout(() => {
        clearCart();
        closeCheckoutModal();
        showNotification('¡Gracias por tu compra! Te contactaremos pronto.', 'success');
    }, 2000);
}

function showTransferInfo() {
    const transferInfo = document.getElementById('transfer-info');
    if (transferInfo) {
        transferInfo.style.display = 'block';
    }
    
    const orderSummary = cart.map(item => 
        `${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(0)}`
    ).join('\n');
    
    const message = `¡Hola! Quiero realizar este pedido:\n\n${orderSummary}\n\nTotal: $${cartTotal.toFixed(0)}\n\nPago por transferencia bancaria.\nClave: 722969020239795996\n\nEnviaré el comprobante una vez realizada la transferencia.`;
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/5256616581011?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito después de enviar el mensaje
    setTimeout(() => {
        clearCart();
        closeCheckoutModal();
        showNotification('¡Gracias por tu pedido! Realiza la transferencia y envía el comprobante.', 'success');
    }, 2000);
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
}

// Funciones de almacenamiento
function saveCartToStorage() {
    try {
        localStorage.setItem('coffeHavanaCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('coffeHavanaCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }
}

// Navegación móvil
function toggleMobileNav() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Prevenir scroll del body cuando el menú está abierto
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function closeMobileNav() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Funciones de scroll
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header scroll effect
    if (scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Back to top button
    if (scrollTop > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    // Update active nav link
    updateActiveNavLinkOnScroll();
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function updateActiveNavLinkOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    let currentSection = '';
    const scrollPosition = window.pageYOffset + header.offsetHeight + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Event handlers
function handleOutsideClick(event) {
    // Cerrar modal del carrito
    if (event.target === cartModal) {
        closeCartModal();
    }
    
    // Cerrar modal de checkout
    if (event.target === checkoutModal) {
        closeCheckoutModal();
    }
    
    // Cerrar menú móvil
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeMobileNav();
    }
}

function handleResize() {
    // Cerrar menú móvil en resize
    if (window.innerWidth > 768) {
        closeMobileNav();
    }
}

function handleKeyboard(event) {
    // Cerrar modales con Escape
    if (event.key === 'Escape') {
        if (cartModal.style.display === 'block') {
            closeCartModal();
        }
        if (checkoutModal.style.display === 'block') {
            closeCheckoutModal();
        }
        closeMobileNav();
    }
}

function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Nuevo mensaje de contacto:\n\nNombre: ${name}\nEmail: ${email}\nAsunto: ${subject}\nMensaje: ${message}`;
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/5256616581011?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpiar formulario
    event.target.reset();
    showNotification('¡Mensaje enviado! Te contactaremos pronto.', 'success');
}

// Funciones de animación
function animateFloatingElements() {
    const floatingBeans = document.querySelectorAll('.floating-bean');
    floatingBeans.forEach((bean, index) => {
        bean.style.animationDelay = `${index * 0.5}s`;
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .highlight-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        const suffix = element.textContent.replace(/\d/g, '').replace(/\+/g, '');
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

function animateCartIcon() {
    const cartIcon = cartToggle.querySelector('i');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 3000;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Cerrar notificación
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => hideNotification(notification));
    
    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
        hideNotification(notification);
    }, 4000);
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #28a745, #20c997)',
        error: 'linear-gradient(135deg, #dc3545, #c82333)',
        warning: 'linear-gradient(135deg, #ffc107, #e0a800)',
        info: 'linear-gradient(135deg, #17a2b8, #138496)'
    };
    return colors[type] || colors.info;
}

// Utilidades
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Optimizar scroll events
const optimizedScroll = throttle(handleScroll, 16);
window.addEventListener('scroll', optimizedScroll);

// Lazy loading para imágenes
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Funciones globales para HTML inline events
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeItem = removeItem;
window.payWithMercadoPago = payWithMercadoPago;
window.showTransferInfo = showTransferInfo;

// Inicializar lazy loading cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

// Manejo de errores global
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    showNotification('Ha ocurrido un error. Por favor, recarga la página.', 'error');
});

// Manejo de promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

console.log('🍵 Coffe Havana - Sistema inicializado correctamente');

