// Product Data
const products = [
    { id: 1, name: 'Silk Evening Dress', category: 'women', price: 459, originalPrice: 599, rating: 4.8, description: 'Elegant flowing silk dress', badge: 'NEW', image: 1 },
    { id: 2, name: 'Premium Leather Jacket', category: 'men', price: 299, originalPrice: 399, rating: 4.9, description: 'Classic leather bomber jacket', badge: 'SALE', image: 2 },
    { id: 3, name: 'Designer Sneakers', category: 'accessories', price: 189, originalPrice: 249, rating: 4.7, description: 'Limited edition streetwear', badge: 'TRENDING', image: 3 },
    { id: 4, name: 'Luxury Timepiece', category: 'accessories', price: 799, originalPrice: 999, rating: 5.0, description: 'Swiss automatic movement', badge: 'EXCLUSIVE', image: 4 },
    { id: 5, name: 'Cashmere Sweater', category: 'women', price: 229, originalPrice: 329, rating: 4.6, description: 'Ultra-soft Italian cashmere', badge: 'NEW', image: 1 },
    { id: 6, name: 'Tailored Suit', category: 'men', price: 699, originalPrice: 899, rating: 4.9, description: 'Bespoke wool blend suit', badge: 'PREMIUM', image: 2 },
    { id: 7, name: 'Statement Handbag', category: 'accessories', price: 399, originalPrice: 549, rating: 4.8, description: 'Genuine leather crossbody', badge: 'SALE', image: 3 },
    { id: 8, name: 'Athletic Set', category: 'women', price: 149, originalPrice: 199, rating: 4.5, description: 'Performance activewear', badge: 'TRENDING', image: 4 }
];

let cart = [];
let wishlist = new Set();

// Generate Products
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    let filteredProducts = products;

    if (filter !== 'all') {
        filteredProducts = products.filter(p => 
            p.category === filter || 
            p.badge.toLowerCase() === filter
        );
    }

    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];

    grid.innerHTML = filteredProducts.map((product, index) => `
        <div class="product-card">
            <div class="product-badge">${product.badge}</div>
            <div class="product-image" style="background: ${colors[index % 4]}"></div>
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
                        <span class="price-current">${product.price}</span>
                        <span class="price-original">${product.originalPrice}</span>
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

    updateCartUI();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    renderCart();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    
    badge.textContent = count;
    badge.style.animation = 'none';
    
    // Trigger reflow to restart animation
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

    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image" style="background: ${colors[index % 4]}"></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} × ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toFixed(2)}`;
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
            <div style="font-weight: 700;">${product.name}</div>
            <div style="color: var(--primary);">${product.price}</div>
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
    const email = e.target.querySelector('input').value;
    showNotification('Thank you for subscribing! 📧');
    e.target.reset();
}

// Notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
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

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Initialize
renderProducts();
