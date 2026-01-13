const { useState, useEffect, useMemo, createContext, useContext, useRef } = React;

// --- DATA LAYER ---
const PRODUCTS_DATA = [
    { id: 1, name: "Silk Evening Dress", category: "women", price: 459, originalPrice: 599, rating: 4.8, description: "Elegant flowing silk dress in midnight noir.", badge: "NEW", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Obsidian Leather Jacket", category: "men", price: 299, originalPrice: 399, rating: 4.9, description: "Classic leather bomber with matte finish.", badge: "SALE", image: "https://images.unsplash.com/photo-1551028919-383718bccf3b?auto=format&fit=crop&w=800&q=80" },
    { id: 3, name: "Zaziza Street Runners", category: "accessories", price: 189, originalPrice: 249, rating: 4.7, description: "Limited edition high-top streetwear.", badge: "TRENDING", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80" },
    { id: 4, name: "Chronos Gold Watch", category: "accessories", price: 799, originalPrice: 999, rating: 5.0, description: "Swiss automatic movement with sapphire glass.", badge: "EXCLUSIVE", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80" },
    { id: 5, name: "Cashmere Turtleneck", category: "women", price: 229, originalPrice: 329, rating: 4.6, description: "Ultra-soft Italian cashmere in charcoal.", badge: "NEW", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80" },
    { id: 6, name: "Bespoke Wool Suit", category: "men", price: 699, originalPrice: 899, rating: 4.9, description: "Tailored wool blend for the modern executive.", badge: "PREMIUM", image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80" },
    { id: 7, name: "Vanguard Crossbody", category: "accessories", price: 399, originalPrice: 549, rating: 4.8, description: "Genuine leather with signature hardware.", badge: "SALE", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
    { id: 8, name: "Performance Active Set", category: "women", price: 149, originalPrice: 199, rating: 4.5, description: "High-compression fabric for intense workouts.", badge: "TRENDING", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80" }
];

// --- UTILS ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// --- HOOKS (Principal Level Logic) ---
function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    });
}

function usePersistedState(key, defaultValue) {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    });
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
}

// --- COMPONENTS ---

// 1. Navigation
const Navbar = ({ cartCount, openCart, toggleWishlist, openSearch }) => (
    <nav id="navbar">
        <div className="nav-content">
            <div className="logo" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>ZAZIZA</div>
            <ul className="nav-links">
                {['SHOP', 'NEW IN', 'ABOUT', 'CONTACT'].map(item => (
                    <li key={item}><a href={`#${item.toLowerCase().replace(' ', '')}`}>{item}</a></li>
                ))}
            </ul>
            <div className="nav-icons">
                <button className="nav-icon-btn" onClick={openSearch}>🔍</button>
                <button className="nav-icon-btn" onClick={toggleWishlist}>❤️</button>
                <button className="nav-icon-btn" onClick={openCart} style={{position: 'relative'}}>
                    🛒
                    <span className="cart-badge" key={cartCount} style={{animation: 'pulse 0.5s ease'}}>{cartCount}</span>
                </button>
                <button className="nav-icon-btn">👤</button>
                <button className="mobile-menu-btn">☰</button>
            </div>
        </div>
    </nav>
);

// 2. Checkout Overlay (The Complex Part)
const CheckoutOverlay = ({ isOpen, onClose, cart, clearCart }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '', firstName: '', lastName: '', address: '', city: '', postal: '',
        shipping: 'standard', cardNumber: '', expiry: '', cvc: '', cardName: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset checkout when closed/opened
    useEffect(() => { if(isOpen) setStep(1); }, [isOpen]);

    const shippingCost = formData.shipping === 'express' ? 25 : 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;

    const handleInput = (e) => {
        const { id, value } = e.target;
        let formatted = value;
        // Input Masking Logic
        if (id === 'cardNumber') formatted = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        if (id === 'expiry') formatted = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2');
        setFormData(prev => ({ ...prev, [id]: formatted }));
    };

    const validateStep = (currentStep) => {
        const requiredFields = {
            1: ['email', 'firstName', 'lastName', 'address', 'city', 'postal'],
            2: [], // Radio button always has value
            3: ['cardNumber', 'expiry', 'cvc', 'cardName']
        };
        const fields = requiredFields[currentStep];
        const isValid = fields.every(field => formData[field] && formData[field].trim() !== '');
        
        if (!isValid) {
            // Shake animation logic would go here via ref
            alert("Please fill in all fields."); // Simple fallback for demo
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(s => s + 1);
    };

    const processPayment = async () => {
        if (!validateStep(3)) return;
        setIsProcessing(true);
        // Simulate API
        await new Promise(r => setTimeout(r, 2000));
        clearCart();
        setIsProcessing(false);
        setStep('success');
    };

    if (!isOpen) return null;

    return (
        <div className={`checkout-overlay ${isOpen ? 'active' : ''}`}>
            <div className="checkout-container">
                <div className="checkout-main">
                    <div className="checkout-header">
                        <div className="logo">ZAZIZA</div>
                        <button className="close-checkout" onClick={onClose}>Cancel Payment</button>
                    </div>

                    {/* Progress Bar */}
                    <div className="checkout-progress">
                        {[1, 2, 3].map(s => (
                            <React.Fragment key={s}>
                                <div className={`step ${step >= s ? 'active' : ''}`}>
                                    <span>{s}</span> {s === 1 ? 'Info' : s === 2 ? 'Shipping' : 'Payment'}
                                </div>
                                {s < 3 && <div className="step-line"></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Info */}
                    {step === 1 && (
                        <div className="checkout-step active">
                            <h2>Contact Info</h2>
                            <div className="form-group floating-label">
                                <input type="email" id="email" className="form-input" placeholder=" " value={formData.email} onChange={handleInput} />
                                <label>Email Address</label>
                            </div>
                            <div className="form-row">
                                <div className="form-group floating-label half">
                                    <input type="text" id="firstName" className="form-input" placeholder=" " value={formData.firstName} onChange={handleInput} />
                                    <label>First Name</label>
                                </div>
                                <div className="form-group floating-label half">
                                    <input type="text" id="lastName" className="form-input" placeholder=" " value={formData.lastName} onChange={handleInput} />
                                    <label>Last Name</label>
                                </div>
                            </div>
                            {/* Address fields simplified for brevity but principal implementation would include all */}
                            <div className="form-group floating-label">
                                <input type="text" id="address" className="form-input" placeholder=" " value={formData.address} onChange={handleInput} />
                                <label>Address</label>
                            </div>
                             <div className="form-row">
                                <div className="form-group floating-label half">
                                    <input type="text" id="city" className="form-input" placeholder=" " value={formData.city} onChange={handleInput} />
                                    <label>City</label>
                                </div>
                                <div className="form-group floating-label half">
                                    <input type="text" id="postal" className="form-input" placeholder=" " value={formData.postal} onChange={handleInput} />
                                    <label>Postal Code</label>
                                </div>
                            </div>
                            <button className="btn btn-primary full-width" onClick={nextStep}>Continue to Shipping</button>
                        </div>
                    )}

                    {/* Step 2: Shipping */}
                    {step === 2 && (
                        <div className="checkout-step active">
                            <h2>Shipping Method</h2>
                            <div className="shipping-options">
                                <label className="shipping-option">
                                    <input type="radio" name="shipping" checked={formData.shipping === 'standard'} onChange={() => setFormData({...formData, shipping: 'standard'})} />
                                    <div className="option-details"><span className="option-name">Standard</span><span className="option-time">5-7 Days</span></div>
                                    <span className="option-price">Free</span>
                                </label>
                                <label className="shipping-option">
                                    <input type="radio" name="shipping" checked={formData.shipping === 'express'} onChange={() => setFormData({...formData, shipping: 'express'})} />
                                    <div className="option-details"><span className="option-name">Express</span><span className="option-time">1-2 Days</span></div>
                                    <span className="option-price">$25.00</span>
                                </label>
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                                <button className="btn btn-primary" onClick={nextStep}>Continue to Payment</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="checkout-step active">
                            <h2>Payment</h2>
                            <div className="payment-card-visual">
                                <div className="card-chip"></div>
                                <div className="card-logo">{formData.cardNumber.startsWith('4') ? 'VISA' : 'CARD'}</div>
                                <div className="card-number-display">{formData.cardNumber || '•••• •••• •••• ••••'}</div>
                                <div className="card-details-row">
                                    <div>{formData.cardName || 'YOUR NAME'}</div>
                                    <div>{formData.expiry || 'MM/YY'}</div>
                                </div>
                            </div>
                            <div className="form-group floating-label">
                                <input type="text" id="cardNumber" maxLength="19" className="form-input" placeholder=" " value={formData.cardNumber} onChange={handleInput} />
                                <label>Card Number</label>
                            </div>
                            <div className="form-row">
                                <div className="form-group floating-label half">
                                    <input type="text" id="expiry" maxLength="5" className="form-input" placeholder=" " value={formData.expiry} onChange={handleInput} />
                                    <label>Expiry</label>
                                </div>
                                <div className="form-group floating-label half">
                                    <input type="text" id="cvc" maxLength="4" className="form-input" placeholder=" " value={formData.cvc} onChange={handleInput} />
                                    <label>CVC</label>
                                </div>
                            </div>
                            <div className="form-group floating-label">
                                <input type="text" id="cardName" className="form-input" placeholder=" " value={formData.cardName} onChange={handleInput} />
                                <label>Name on Card</label>
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                                <button className="btn btn-primary" disabled={isProcessing} onClick={processPayment}>
                                    {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step Success */}
                    {step === 'success' && (
                        <div className="checkout-step active" style={{textAlign: 'center'}}>
                            <div className="success-animation"><div className="checkmark-circle"><div className="checkmark draw"></div></div></div>
                            <h2>Order Confirmed!</h2>
                            <p className="text-muted">Order #{Math.floor(Math.random() * 9000) + 1000} has been placed.</p>
                            <button className="btn btn-primary full-width" onClick={onClose}>Return to Store</button>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="checkout-sidebar">
                    <h2>Summary</h2>
                    {cart.map(item => (
                        <div key={item.id} className="checkout-item">
                            <img src={item.image} className="checkout-item-img" />
                            <div className="checkout-item-details">
                                <div className="checkout-item-name">{item.name}</div>
                                <div className="checkout-item-qty">Qty: {item.quantity}</div>
                            </div>
                            <div className="checkout-item-price">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    ))}
                    <div className="checkout-pricing">
                        <div className="price-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="price-row"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span></div>
                        <div className="price-row total"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Main App Container
const App = () => {
    useScrollReveal();
    const [cart, setCart] = usePersistedState('zaziza_cart', []);
    const [wishlist, setWishlist] = usePersistedState('zaziza_wishlist', []);
    const [filter, setFilter] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // -- ACTIONS --
    const notify = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) return prev.map(p => p.id === product.id ? {...p, quantity: p.quantity + 1} : p);
            return [...prev, { ...product, quantity: 1 }];
        });
        notify(`${product.name} added to cart`);
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));
    
    const toggleWishlist = (id) => {
        const isWished = wishlist.includes(id);
        setWishlist(prev => isWished ? prev.filter(i => i !== id) : [...prev, id]);
        notify(isWished ? "Removed from wishlist" : "Added to wishlist");
    };

    // -- RENDER HELPERS --
    const filteredProducts = useMemo(() => {
        if (filter === 'all') return PRODUCTS_DATA;
        return PRODUCTS_DATA.filter(p => p.category === filter || p.badge.toLowerCase() === filter);
    }, [filter]);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <React.Fragment>
            <Navbar 
                cartCount={cartCount} 
                openCart={() => setIsCartOpen(true)} 
                toggleWishlist={() => notify(`Wishlist has ${wishlist.length} items`)}
                openSearch={() => notify("Search feature active")}
            />

            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                    <div className="shape shape3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-badge">✨ NEW COLLECTION 2026</div>
                    <h1>REDEFINE YOUR STYLE</h1>
                    <p>Experience fashion that speaks volumes.</p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => document.getElementById('products').scrollIntoView({behavior:'smooth'})}>EXPLORE</button>
                        <button className="btn btn-secondary">BROWSE</button>
                    </div>
                </div>
            </section>

            <section id="products" className="products">
                <div className="section-header reveal">
                    <div className="section-label">PRODUCTS</div>
                    <h2 className="section-title">Featured Collection</h2>
                </div>
                
                <div className="filters reveal">
                    {['all', 'new', 'trending', 'sale'].map(f => (
                        <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="products-grid">
                    {filteredProducts.map((p, i) => (
                        <div key={p.id} className="product-card reveal" style={{transitionDelay: `${i*50}ms`}}>
                            <div className="product-badge">{p.badge}</div>
                            <div className="product-image-container">
                                <img src={p.image} className="product-image" loading="lazy" />
                            </div>
                            <div className="product-actions">
                                <button className="action-btn" onClick={() => toggleWishlist(p.id)}>
                                    {wishlist.includes(p.id) ? '❤️' : '🤍'}
                                </button>
                            </div>
                            <div className="product-info">
                                <div className="product-category">{p.category}</div>
                                <div className="product-name">{p.name}</div>
                                <div className="product-price"><span className="price-current">${p.price}</span></div>
                                <button className="add-to-cart-btn" onClick={() => addToCart(p)}>ADD TO CART</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Footer Placeholder for brevity */}
            <footer>
                <div className="footer-bottom"><p>© 2026 Zaziza. Principal Engineer Build.</p></div>
            </footer>

            {/* Cart Modal */}
            <div className={`modal ${isCartOpen ? 'active' : ''}`} onClick={(e) => e.target.classList.contains('modal') && setIsCartOpen(false)}>
                <div className="modal-content">
                    <button className="modal-close" onClick={() => setIsCartOpen(false)}>×</button>
                    <h2>Shopping Cart</h2>
                    <div className="cart-items">
                        {cart.length === 0 ? <div className="empty-cart"><p>Cart is empty</p></div> : 
                            cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.image} className="cart-item-image" />
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-price">${item.price} × {item.quantity}</div>
                                    </div>
                                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                                </div>
                            ))
                        }
                    </div>
                    <div className="cart-total"><span>Total:</span><span>{formatCurrency(cartTotal)}</span></div>
                    <button className="btn btn-primary full-width" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>CHECKOUT</button>
                </div>
            </div>

            {/* Checkout Overlay */}
            <CheckoutOverlay 
                isOpen={isCheckoutOpen} 
                onClose={() => setIsCheckoutOpen(false)} 
                cart={cart} 
                clearCart={() => setCart([])} 
            />

            {/* Notification Toast */}
            <div className={`notification ${notification ? 'active' : ''}`}>
                <span>{notification}</span>
            </div>
        </React.Fragment>
    );
};

// --- BOOTSTRAP ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
