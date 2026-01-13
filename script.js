let products = [];
let cart = [];
let wishlist = new Set();
let checkoutState = {
    step: 1,
    shippingCost: 0,
    formData: {}
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadUserData();
    setupScrollReveal();
});

// Load Products from JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        products = await response.json();
        renderProducts();
    } catch (e) {
        console.error("Could not load products.", e);
        document.getElementById('productsGrid').innerHTML = `<p style="text-align:center; padding: 2rem;">⚠️ Unable to load data.</p>`;
    }
}

// Data Persistence
function loadUserData() {
    const savedCart = localStorage.getItem('zaziza_cart');
    const savedWishlist = localStorage.getItem('zaziza_wishlist');
    if (savedCart) { cart = JSON.parse(savedCart); updateCartUI(); }
    if (savedWishlist) { wishlist = new Set(JSON.parse(savedWishlist)); }
}

function saveUserData() {
    localStorage.setItem('zaziza_cart', JSON.stringify(cart));
    localStorage.setItem('zaziza_wishlist', JSON.stringify([...wishlist]));
}

// Scroll Reveal
function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Render Products
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    let filtered = products;
    if (filter !== 'all') filtered = products.filter(p => p.category === filter || p.badge.toLowerCase() === filter);

    grid.innerHTML = filtered.map((p, i) => `
        <div class="product-card reveal" style="transition-delay: ${i * 50}ms">
            <div class="product-badge">${p.badge}</div>
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-actions">
                <button class="action-btn" onclick="toggleWishlistItem(${p.id})">${wishlist.has(p.id) ? '❤️' : '🤍'}</button>
                <button class="action-btn" onclick="quickView(${p.id})">👁️</button>
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-description">${p.description}</div>
                <div class="product-footer">
                    <div class="product-price"><span class="price-current">$${p.price}</span></div>
                    <div class="product-rating">⭐ ${p.rating}</div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${p.id})">ADD TO CART</button>
            </div>
        </div>
    `).join('');
    setupScrollReveal();
}

function filterProducts(cat) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts(cat);
}

// Cart Logic
function addToCart(id) {
    const p = products.find(x => x.id === id);
    const item = cart.find(x => x.id === id);
    if (item) item.quantity++; else cart.push({ ...p, quantity: 1 });
    saveUserData(); updateCartUI(); showNotification(`${p.name} added!`);
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    saveUserData(); updateCartUI(); renderCart();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    badge.textContent = count;
    badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = 'pulse 0.5s ease';
}

function renderCart() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        list.innerHTML = `<div class="empty-cart"><div class="empty-cart-icon">🛒</div><p>Cart is empty</p></div>`;
        totalEl.textContent = '$0.00';
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function openCart() { renderCart(); document.getElementById('cartModal').classList.add('active'); }
function closeCart() { document.getElementById('cartModal').classList.remove('active'); }

/* --- CHECKOUT SYSTEM --- */

function startCheckout() {
    if (cart.length === 0) return showNotification("Your cart is empty!");
    closeCart();
    
    // Reset State
    checkoutState.step = 1;
    checkoutState.shippingCost = 0;
    
    // Render Order Summary Sidebar
    const summaryList = document.getElementById('checkoutItemsList');
    summaryList.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" class="checkout-item-img">
            <div class="checkout-item-details">
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-qty">Qty: ${item.quantity}</div>
            </div>
            <div class="checkout-item-price">$${item.price * item.quantity}</div>
        </div>
    `).join('');
    
    updateCheckoutTotals();
    showStep(1);
    
    // Open Overlay
    document.getElementById('checkoutOverlay').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('active');
}

function updateCheckoutTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + checkoutState.shippingCost;
    
    document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkoutShipping').textContent = checkoutState.shippingCost === 0 ? 'Free' : `$${checkoutState.shippingCost.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('payAmount').textContent = `$${total.toFixed(2)}`;
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${step}`)?.classList.add('active');
    
    // Update Progress Bar
    document.getElementById('step1-indicator').className = step >= 1 ? 'step active' : 'step';
    document.getElementById('step2-indicator').className = step >= 2 ? 'step active' : 'step';
    document.getElementById('step3-indicator').className = step >= 3 ? 'step active' : 'step';
    
    checkoutState.step = step;
}

function checkoutNextStep(targetStep) {
    if (targetStep > checkoutState.step) {
        if (!validateCurrentStep()) return;
    }
    showStep(targetStep);
}

function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step${checkoutState.step}`);
    const inputs = currentStepEl.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 500);
        }
    });
    
    if (checkoutState.step === 3) {
        // Simple Card Validation logic
        const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
        if (cardNum.length < 13) isValid = false;
    }

    return isValid;
}

function updateShipping(cost) {
    checkoutState.shippingCost = cost;
    updateCheckoutTotals();
}

// Payment Visualizers
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formattedValue += ' ';
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
    document.getElementById('displayCardNumber').textContent = formattedValue || '•••• •••• •••• ••••';
    
    // Detect Card Type
    const logo = document.getElementById('cardLogo');
    if (value.startsWith('4')) logo.textContent = 'VISA';
    else if (value.startsWith('5')) logo.textContent = 'MASTERCARD';
    else logo.textContent = 'CARD';
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    document.getElementById('displayExpiry').textContent = value || 'MM/YY';
}

function updateCardName(name) {
    document.getElementById('displayName').textContent = name || 'YOUR NAME';
}

async function processPayment() {
    if (!validateCurrentStep()) return;
    
    const btn = document.getElementById('payButton');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Processing...';
    btn.disabled = true;
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    cart = [];
    saveUserData();
    updateCartUI();
    
    document.getElementById('orderId').textContent = '#' + Math.floor(Math.random() * 9000 + 1000);
    showStep('Success');
    
    btn.innerHTML = originalText;
    btn.disabled = false;
}

// Wishlist & Search (Standard)
function toggleWishlistItem(id) {
    if (wishlist.has(id)) wishlist.delete(id); else wishlist.add(id);
    saveUserData(); renderProducts(); showNotification(wishlist.has(id) ? 'Added to wishlist ❤️' : 'Removed from wishlist');
}
function toggleWishlist() { showNotification(`Wishlist: ${wishlist.size} items`); }

function openSearch() { document.getElementById('searchModal').classList.add('active'); document.querySelector('.search-input').focus(); }
function closeSearch() { document.getElementById('searchModal').classList.remove('active'); }
function searchProducts(q) {
    const res = document.getElementById('searchResults');
    if (q.length < 2) return res.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-muted)">Type to search...</p>';
    const found = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    if (!found.length) return res.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-muted)">No results.</p>';
    res.innerHTML = found.map(p => `
        <div class="search-result-item" onclick="quickView(${p.id})">
            <img src="${p.image}" style="width:40px;height:40px;border-radius:5px;object-fit:cover">
            <div><div style="font-weight:700">${p.name}</div><div style="color:var(--primary)">$${p.price}</div></div>
        </div>`).join('');
}
function quickView(id) { const p = products.find(x => x.id === id); showNotification(`Quick view: ${p.name}`); closeSearch(); }

function showNotification(msg) {
    const n = document.getElementById('notification');
    document.getElementById('notificationText').textContent = msg;
    n.classList.remove('active'); void n.offsetWidth; n.classList.add('active');
    setTimeout(() => n.classList.remove('active'), 3000);
}

window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 100) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
});
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
