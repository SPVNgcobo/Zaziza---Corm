// EMBEDDED DATA - NO FETCH REQUIRED
const products = [
    { id: 1, name: "Silk Evening Dress", category: "women", price: 459, originalPrice: 599, rating: 4.8, description: "Elegant flowing silk dress in midnight noir.", badge: "NEW", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Obsidian Leather Jacket", category: "men", price: 299, originalPrice: 399, rating: 4.9, description: "Classic leather bomber with matte finish.", badge: "SALE", image: "https://images.unsplash.com/photo-1551028919-383718bccf3b?auto=format&fit=crop&w=800&q=80" },
    { id: 3, name: "Zaziza Street Runners", category: "accessories", price: 189, originalPrice: 249, rating: 4.7, description: "Limited edition high-top streetwear.", badge: "TRENDING", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80" },
    { id: 4, name: "Chronos Gold Watch", category: "accessories", price: 799, originalPrice: 999, rating: 5.0, description: "Swiss automatic movement with sapphire glass.", badge: "EXCLUSIVE", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80" },
    { id: 5, name: "Cashmere Turtleneck", category: "women", price: 229, originalPrice: 329, rating: 4.6, description: "Ultra-soft Italian cashmere in charcoal.", badge: "NEW", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80" },
    { id: 6, name: "Bespoke Wool Suit", category: "men", price: 699, originalPrice: 899, rating: 4.9, description: "Tailored wool blend for the modern executive.", badge: "PREMIUM", image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80" },
    { id: 7, name: "Vanguard Crossbody", category: "accessories", price: 399, originalPrice: 549, rating: 4.8, description: "Genuine leather with signature hardware.", badge: "SALE", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
    { id: 8, name: "Performance Active Set", category: "women", price: 149, originalPrice: 199, rating: 4.5, description: "High-compression fabric for intense workouts.", badge: "TRENDING", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80" }
];

let cart = [];
let wishlist = new Set();
let checkoutState = { step: 1, shippingCost: 0 };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    loadUserData();
});

// Persistence
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

// Render Products
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    let filtered = products;
    if (filter !== 'all') filtered = products.filter(p => p.category === filter || p.badge.toLowerCase() === filter);

    grid.innerHTML = filtered.map((p, i) => `
        <div class="product-card">
            <div class="product-badge">${p.badge}</div>
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-actions">
                <button class="action-btn" onclick="toggleWishlistItem(${p.id})">${wishlist.has(p.id) ? '❤️' : '🤍'}</button>
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price"><span class="price-current">$${p.price}</span></div>
                <button class="add-to-cart-btn" onclick="addToCart(${p.id})">ADD TO CART</button>
            </div>
        </div>
    `).join('');
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
}
function renderCart() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (cart.length === 0) {
        list.innerHTML = `<div class="empty-cart"><p>Cart is empty</p></div>`;
        totalEl.textContent = '$0.00';
        return;
    }
    list.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}">
            <div>
                <div style="font-weight:700">${item.name}</div>
                <div style="color:var(--primary)">$${item.price} × ${item.quantity}</div>
            </div>
            <button style="margin-left:auto;background:none;border:none;color:var(--accent);cursor:pointer" onclick="removeFromCart(${item.id})">✕</button>
        </div>
    `).join('');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.textContent = `$${total.toFixed(2)}`;
}
function openCart() { renderCart(); document.getElementById('cartModal').classList.add('active'); }
function closeCart() { document.getElementById('cartModal').classList.remove('active'); }

// CHECKOUT LOGIC
function startCheckout() {
    if (cart.length === 0) return showNotification("Cart is empty");
    closeCart();
    checkoutState.step = 1;
    
    // Render Summary
    document.getElementById('checkoutItemsList').innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" class="checkout-item-img">
            <div style="flex:1">
                <div>${item.name}</div>
                <div style="font-size:0.9rem;color:#888">Qty: ${item.quantity}</div>
            </div>
            <div style="font-weight:700">$${item.price * item.quantity}</div>
        </div>
    `).join('');
    
    updateCheckoutTotals();
    showStep(1);
    document.getElementById('checkoutOverlay').classList.add('active');
}
function closeCheckout() { document.getElementById('checkoutOverlay').classList.remove('active'); }
function updateCheckoutTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + checkoutState.shippingCost;
    document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkoutShipping').textContent = checkoutState.shippingCost === 0 ? 'Free' : `$${checkoutState.shippingCost}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('payAmount').textContent = `$${total.toFixed(2)}`;
}
function showStep(step) {
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.getElementById(step === 'Success' ? 'stepSuccess' : `step${step}`).classList.add('active');
    
    // Update visuals
    if (typeof step === 'number') {
        document.getElementById('step1-indicator').className = step >= 1 ? 'step active' : 'step';
        document.getElementById('step2-indicator').className = step >= 2 ? 'step active' : 'step';
        document.getElementById('step3-indicator').className = step >= 3 ? 'step active' : 'step';
        checkoutState.step = step;
    }
}
function checkoutNextStep(step) { showStep(step); }
function updateShipping(cost) { checkoutState.shippingCost = cost; updateCheckoutTotals(); }
function formatCardNumber(input) { input.value = input.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim(); }
function formatExpiry(input) { input.value = input.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2'); }
function updateCardName(val) { document.getElementById('displayName').textContent = val || 'YOUR NAME'; }
function processPayment() {
    const btn = document.getElementById('payButton');
    btn.innerHTML = 'Processing...';
    setTimeout(() => {
        cart = []; saveUserData(); updateCartUI();
        showStep('Success');
        btn.innerHTML = 'Pay';
    }, 1500);
}

// Utils
function toggleWishlistItem(id) {
    if (wishlist.has(id)) wishlist.delete(id); else wishlist.add(id);
    saveUserData(); renderProducts();
}
function toggleWishlist() { showNotification(`Wishlist: ${wishlist.size} items`); }
function showNotification(msg) {
    const n = document.getElementById('notification');
    document.getElementById('notificationText').textContent = msg;
    n.classList.add('active'); setTimeout(() => n.classList.remove('active'), 3000);
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
