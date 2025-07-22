// Variables globales
let cart = [];
let cartTotal = 0;

// Elementos del DOM
const cartToggle = document.getElementById('cart-toggle');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito desde localStorage
    loadCartFromStorage();
    
    // Event listeners para botones de agregar al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Event listeners para modales
    cartToggle.addEventListener('click', openCartModal);
    closeCart.addEventListener('click', closeCartModal);
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeCheckout.addEventListener('click', closeCheckoutModal);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            closeCartModal();
        }
        if (event.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
    
    // Navegación suave
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        });
    });
});

// Función para agregar producto al carrito
function addToCart(event) {
    const button = event.currentTarget;
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));
    
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
    
    // Mostrar notificación
    showNotification(`${productName} agregado al carrito`);
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar total
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = cartTotal.toFixed(0);
    
    // Actualizar items del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity('${item.name}')">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity('${item.name}')">+</button>
                    <button class="remove-item" onclick="removeItem('${item.name}')">Eliminar</button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }
}

// Función para aumentar cantidad
function increaseQuantity(productName) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += 1;
        updateCartDisplay();
        saveCartToStorage();
    }
}

// Función para disminuir cantidad
function decreaseQuantity(productName) {
    const item = cart.find(item => item.name === productName);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        updateCartDisplay();
        saveCartToStorage();
    }
}

// Función para eliminar item
function removeItem(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${productName} eliminado del carrito`);
}

// Funciones para abrir/cerrar modales
function openCartModal() {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
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
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Ocultar información de transferencia
    const transferInfo = document.getElementById('transfer-info');
    transferInfo.style.display = 'none';
}

// Función para pagar con Mercado Pago
function payWithMercadoPago() {
    // Crear mensaje para WhatsApp con el pedido
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
        showNotification('¡Gracias por tu compra! Te contactaremos pronto.');
    }, 2000);
}

// Función para mostrar información de transferencia
function showTransferInfo() {
    const transferInfo = document.getElementById('transfer-info');
    transferInfo.style.display = 'block';
    
    // Crear mensaje para WhatsApp con el pedido
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
        showNotification('¡Gracias por tu pedido! Realiza la transferencia y envía el comprobante.');
    }, 2000);
}

// Función para limpiar el carrito
function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
}

// Función para guardar carrito en localStorage
function saveCartToStorage() {
    localStorage.setItem('coffeHavanaCart', JSON.stringify(cart));
}

// Función para cargar carrito desde localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('coffeHavanaCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Función para mostrar notificaciones
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37, #b8941f);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Navegación móvil
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Cerrar menú móvil al hacer clic en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Efectos de scroll para la navegación
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'linear-gradient(135deg, rgba(139, 69, 19, 0.98), rgba(101, 67, 33, 0.98))';
    } else {
        header.style.background = 'linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(101, 67, 33, 0.95))';
    }
});

