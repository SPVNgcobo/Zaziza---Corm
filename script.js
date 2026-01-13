let products = [];
let cart = [];
let wishlist = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadUserData();
    setupScrollReveal();
});

// Load Products from JSON (Simulating Nexus API)
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        renderProducts();
    } catch (e) {
        console.error("Could not load products. Ensure you are running on a local server.", e);
        document.getElementById('productsGrid').innerHTML = `
            <div style="text-align:center; padding: 2rem; color: var(--text-muted);">
                <p>⚠️ Unable to load product data.</p>
                <p style="font-size: 0.9rem">Please open this folder with a local server (e.g., Live Server in VS Code) to allow JSON fetching.</p>
            </div>
        `;
    }
}

// Data Persistence (LocalStorage)
function loadUserData() {
    const savedCart = localStorage.getItem('zaziza_cart');
    const savedWishlist = localStorage.getItem('zaziza_wishlist');

    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    if (savedWishlist) {
        // Convert array back to Set
        wishlist = new Set(JSON.parse(savedWishlist));
    }
}

function saveUserData() {
    localStorage.setItem('zaziza_cart', JSON.stringify(cart));
    // Convert Set to Array for JSON storage
    localStorage.setItem('zaziza_wishlist', JSON.stringify([...wishlist]));
}

// Scroll Animations (Intersection Observer)
function setupScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe elements with .reveal class
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Render Products
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    let filteredProducts = products;

    if (filter !== 'all') {
        filteredProducts = products.filter(p => 
            p.category === filter || 
            p.badge.toLowerCase() === filter
        );
    }

    grid.innerHTML = filteredProducts.map((product, index) => `
        <div class="product-card reveal" style="transition-delay: ${index * 100}ms">
            <div class="product-badge">${product.badge}</div>
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-actions">
                <button class="action-btn" onclick="toggleWishlistItem(${product.id})" title="Add to Wishlist">
                    ${wishlist.has(product.id) ? '❤️' : '🤍'}
                </button>
                <button class="action-btn" onclick="quickView(${product.id})" title="Quick View">👁️</button>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">
                        <span class="price-current">$${product.price}</span>
                        <span class="price-original">$${product.originalPrice}</span>
                    </div>
                    <div class="product-rating">
                        ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}
                    </div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    ADD TO CART
                </button>
            </div>
        </div>
    `).join('');
    
    // Re-attach observer to new elements
    setupScrollReveal();
}

// Filter Products
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderProducts(category);
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveUserData();
    updateCartUI();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveUserData();
    updateCartUI();
    renderCart();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    
    badge.textContent = count;
    badge.style.animation = 'none';
    void badge.offsetWidth; 
    badge.style.animation = 'pulse 0.5s ease';
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    renderCart();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    showNotification('Processing checkout... (Demo)');
    setTimeout(() => {
        cart = [];
        saveUserData();
        updateCartUI();
        closeCart();
        showNotification('Order placed successfully! 🎉');
    }, 2000);
}

// Wishlist Functions
function toggleWishlistItem(productId) {
    if (wishlist.has(productId)) {
        wishlist.delete(productId);
        showNotification('Removed from wishlist');
    } else {
        wishlist.add(productId);
        showNotification('Added to wishlist ❤️');
    }
    saveUserData();
    renderProducts();
}

function toggleWishlist() {
    showNotification(`You have ${wishlist.size} items in your wishlist`);
}

// Search Functions
function openSearch() {
    document.getElementById('searchModal').classList.add('active');
    document.querySelector('.search-input').focus();
}

function closeSearch() {
    document.getElementById('searchModal').classList.remove('active');
    document.getElementById('searchResults').innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Start typing to search...</p>';
}

function searchProducts(query) {
    const results = document.getElementById('searchResults');
    
    if (query.length < 2) {
        results.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Start typing to search...</p>';
        return;
    }

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        results.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No products found</p>';
        return;
    }

    results.innerHTML = filtered.map(product => `
        <div class="search-result-item" onclick="quickView(${product.id})">
            <img src="${product.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
            <div style="flex: 1">
                <div style="font-weight: 700;">${product.name}</div>
                <div style="color: var(--primary);">$${product.price}</div>
            </div>
        </div>
    `).join('');
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    showNotification(`Quick view: ${product.name} (Demo feature)`);
    closeSearch();
}

// Newsletter
function subscribeNewsletter(e) {
    e.preventDefault();
    showNotification('Thank you for subscribing! 📧');
    e.target.reset();
}

// Notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    
    // Reset animation
    notification.classList.remove('active');
    void notification.offsetWidth; // Trigger reflow
    notification.classList.add('active');

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// Scroll Effects
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
