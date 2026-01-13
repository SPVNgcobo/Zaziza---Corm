const { useState, useEffect, useMemo } = React;

// --- 1. DATA (Embedded) ---
const PRODUCTS = [
    { id: 1, name: "Silk Evening Dress", category: "women", price: 459, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80", desc: "Crafted from 100% mulberry silk, this evening gown features a bias cut that drapes effortlessly." },
    { id: 2, name: "Obsidian Leather Jacket", category: "men", price: 299, image: "https://images.unsplash.com/photo-1551028919-383718bccf3b?auto=format&fit=crop&w=800&q=80", desc: "Full-grain Italian leather with gunmetal hardware. A timeless staple for the modern rebel." },
    { id: 3, name: "Zaziza Street Runners", category: "accessories", price: 189, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80", desc: "High-performance knit upper with energy-returning soles. Designed for the urban commute." },
    { id: 4, name: "Chronos Gold Watch", category: "accessories", price: 799, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80", desc: "Swiss automatic movement housed in a 18k gold-plated case. Sapphire crystal glass." },
    { id: 5, name: "Cashmere Turtleneck", category: "women", price: 229, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80", desc: "Sourced from inner Mongolia, this 2-ply cashmere sweater offers unmatched softness." },
    { id: 6, name: "Bespoke Wool Suit", category: "men", price: 699, image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80", desc: "Super 120s wool, tailored fit. The ultimate power suit for the boardroom." },
    { id: 7, name: "Vanguard Crossbody", category: "accessories", price: 399, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", desc: "Vegetable-tanned leather that creates a unique patina over time. Brass hardware." },
    { id: 8, name: "Performance Active Set", category: "women", price: 149, image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80", desc: "Four-way stretch, moisture-wicking fabric. Compression fit for high-intensity training." }
];

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// --- 2. ICONS ---
const Icon = ({ name }) => {
    if (name === 'cart') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
    if (name === 'search') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
    if (name === 'user') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    return null;
};

// --- 3. COMPONENTS ---

const Navbar = ({ cartCount, onCartClick, onNav }) => (
    <nav>
        <div className="nav-content">
            <div className="logo" onClick={() => onNav('home')}>ZAZIZA</div>
            <div className="nav-links">
                <button onClick={() => onNav('home')}>Home</button>
                <button onClick={() => onNav('shop')}>Shop</button>
                <button onClick={() => onNav('about')}>About</button>
                <button onClick={() => onNav('contact')}>Contact</button>
            </div>
            <div className="nav-icons">
                <button className="nav-icon-btn"><Icon name="search" /></button>
                <button className="nav-icon-btn" onClick={onCartClick}>
                    <Icon name="cart" />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
                <button className="nav-icon-btn"><Icon name="user" /></button>
            </div>
        </div>
    </nav>
);

const Footer = () => (
    <footer>
        <div className="footer-content">
            <div className="footer-brand-col">
                <h3>ZAZIZA</h3>
                <p>Redefining modern fashion. Designed for the bold, crafted for the eternal.</p>
                <div className="social-icons">
                    <div className="social-icon">IG</div>
                    <div className="social-icon">TW</div>
                    <div className="social-icon">FB</div>
                </div>
            </div>
            <div className="footer-link-col">
                <h4>Shop</h4>
                <ul>
                    <li><a href="#">New Arrivals</a></li>
                    <li><a href="#">Accessories</a></li>
                    <li><a href="#">Men</a></li>
                    <li><a href="#">Women</a></li>
                </ul>
            </div>
            <div className="footer-link-col">
                <h4>Help</h4>
                <ul>
                    <li><a href="#">Shipping</a></li>
                    <li><a href="#">Returns</a></li>
                    <li><a href="#">Sizing</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div>
            <div className="footer-link-col">
                <h4>Legal</h4>
                <ul>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom">
            <span>&copy; 2026 Zaziza. All rights reserved.</span>
            <div className="payment-methods">
                <span className="payment-pill">VISA</span>
                <span className="payment-pill">AMEX</span>
                <span className="payment-pill">PAYPAL</span>
            </div>
        </div>
    </footer>
);

// --- 4. VIEWS ---

const HomeView = ({ products, onProductClick, onNav }) => (
    <>
        <section className="hero">
            <div className="hero-content">
                <h1>REDEFINE YOUR STYLE</h1>
                <p>Luxury meets street. The 2026 Collection is here.</p>
                <button className="btn btn-primary" onClick={() => onNav('shop')}>SHOP NOW</button>
            </div>
        </section>
        
        {/* Features Section (About) */}
        <section id="about" className="features">
            <div className="section-header">
                <div className="section-label">THE STANDARD</div>
                <h2 className="section-title">Why Zaziza</h2>
            </div>
            <div className="features-grid">
                <div className="feature">
                    <div className="feature-icon">🚚</div>
                    <h3>Global Shipping</h3>
                    <p>Complimentary shipping on orders over $200 to 50+ countries.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">🔒</div>
                    <h3>Secure Payment</h3>
                    <p>256-bit SSL encryption ensures your transactions are safe.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">💎</div>
                    <h3>Premium Quality</h3>
                    <p>Hand-selected materials and expert craftsmanship in every piece.</p>
                </div>
            </div>
        </section>

        {/* Shop Section */}
        <section id="shop" className="products">
            <div className="section-header">
                <div className="section-label">COLLECTION</div>
                <h2 className="section-title">Latest Drops</h2>
            </div>
            <div className="products-grid">
                {products.map(p => (
                    <div key={p.id} className="product-card">
                        <div className="product-image-container" onClick={() => onProductClick(p)}>
                            <img src={p.image} className="product-image" loading="lazy" />
                        </div>
                        <div className="product-info">
                            <div className="product-category">{p.category}</div>
                            <div className="product-name">{p.name}</div>
                            <div className="product-price">{formatCurrency(p.price)}</div>
                            <button className="btn btn-secondary full-width" onClick={() => onProductClick(p)}>VIEW DETAILS</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section">
            <div className="section-header">
                <div className="section-label">GET IN TOUCH</div>
                <h2 className="section-title">Contact Us</h2>
            </div>
            <div className="contact-container">
                <div className="contact-info">
                    <div className="contact-card">
                        <div className="contact-icon">✉️</div>
                        <h3>Email Us</h3>
                        <p>hello@zaziza.com</p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon">📍</div>
                        <h3>Visit Us</h3>
                        <p>88 Fashion Ave, NY</p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon">📱</div>
                        <h3>Call Us</h3>
                        <p>+1 (555) 123-4567</p>
                    </div>
                </div>
                <div className="contact-form-wrapper">
                    <div className="form-group floating-label">
                        <input className="form-input" placeholder=" " />
                        <label>Your Name</label>
                    </div>
                    <div className="form-group floating-label">
                        <input className="form-input" placeholder=" " />
                        <label>Email Address</label>
                    </div>
                    <div className="form-group floating-label">
                        <textarea className="form-input" style={{height:'120px', resize:'none'}} placeholder=" "></textarea>
                        <label>How can we help?</label>
                    </div>
                    <button className="btn btn-primary full-width">SEND MESSAGE</button>
                </div>
            </div>
        </section>
    </>
);

const ProductDetailView = ({ product, onAddToCart, onBack }) => (
    <div className="product-detail-view">
        <img src={product.image} className="detail-image" />
        <div className="detail-info">
            <button onClick={onBack} style={{background:'none', border:'none', color:'var(--text-muted)', marginBottom:'1rem', cursor:'pointer', fontSize:'1rem'}}>← Back to Shop</button>
            <div className="product-category">{product.category}</div>
            <h1>{product.name}</h1>
            <div className="detail-price">{formatCurrency(product.price)}</div>
            <p className="detail-desc">{product.desc}</p>
            <button className="btn btn-primary full-width" onClick={() => onAddToCart(product)}>ADD TO CART</button>
        </div>
    </div>
);

// --- 5. CHECKOUT LOGIC (Inline Validation) ---
const CheckoutView = ({ cart, total, onCancel, onSuccess }) => {
    const [form, setForm] = useState({ email: '', name: '', address: '', card: '', expiry: '', cvc: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!form.email.includes('@')) newErrors.email = "Valid email required";
        if (form.name.length < 3) newErrors.name = "Full name required";
        if (form.address.length < 5) newErrors.address = "Valid address required";
        if (form.card.length < 16) newErrors.card = "Invalid card number";
        if (form.expiry.length < 5) newErrors.expiry = "MM/YY";
        if (form.cvc.length < 3) newErrors.cvc = "CVC";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 2000)); // Simulate API
        setLoading(false);
        onSuccess();
    };

    const handleInput = (key, val) => {
        setForm({...form, [key]: val});
        if (errors[key]) setErrors({...errors, [key]: null}); // Clear error on type
    };

    return (
        <div className="checkout-modal">
            <div className="checkout-grid">
                <div className="checkout-main">
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'3rem', alignItems:'center'}}>
                        <div className="logo" style={{fontSize:'1.5rem'}}>ZAZIZA</div>
                        <button onClick={onCancel} style={{background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', textDecoration:'underline'}}>Cancel</button>
                    </div>
                    
                    <h2 style={{marginBottom:'2rem'}}>Checkout</h2>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => handleInput('email', e.target.value)} />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Shipping Address</label>
                        <input className={`form-input ${errors.address ? 'error' : ''}`} value={form.address} onChange={e => handleInput('address', e.target.value)} />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>

                    <h3 style={{marginTop:'3rem', marginBottom:'1.5rem'}}>Payment Details</h3>
                    <div className="payment-card-visual" style={{marginBottom:'2rem'}}>
                        <div className="card-chip"></div>
                        <div className="card-number-display">{form.card || '•••• •••• •••• ••••'}</div>
                        <div className="card-details-row">
                            <span>{form.name || 'YOUR NAME'}</span>
                            <span>{form.expiry || 'MM/YY'}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input className={`form-input ${errors.card ? 'error' : ''}`} maxLength="19" placeholder="0000 0000 0000 0000" value={form.card} onChange={e => handleInput('card', e.target.value)} />
                        {errors.card && <span className="error-message">{errors.card}</span>}
                    </div>
                    <div className="form-row">
                        <div className="half">
                            <label className="form-label">Name on Card</label>
                            <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => handleInput('name', e.target.value)} />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                        <div className="half">
                            <label className="form-label">Expiry</label>
                            <input className={`form-input ${errors.expiry ? 'error' : ''}`} placeholder="MM/YY" maxLength="5" value={form.expiry} onChange={e => handleInput('expiry', e.target.value)} />
                            {errors.expiry && <span className="error-message">{errors.expiry}</span>}
                        </div>
                        <div className="half">
                            <label className="form-label">CVC</label>
                            <input className={`form-input ${errors.cvc ? 'error' : ''}`} maxLength="3" value={form.cvc} onChange={e => handleInput('cvc', e.target.value)} />
                            {errors.cvc && <span className="error-message">{errors.cvc}</span>}
                        </div>
                    </div>

                    <button className="btn btn-primary full-width" style={{marginTop:'3rem'}} disabled={loading} onClick={handleSubmit}>
                        {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                    </button>
                </div>
                
                <div className="checkout-sidebar">
                    <h3 style={{marginBottom:'2rem'}}>Order Summary</h3>
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
                        <div className="price-row total">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 6. APP CONTROLLER ---

const App = () => {
    const [view, setView] = useState('home'); // home, product, checkout
    const [activeProduct, setActiveProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('zaziza_cart');
        if (saved) setCart(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('zaziza_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) return prev.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i);
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleNav = (target) => {
        setView('home');
        setTimeout(() => {
            const el = document.getElementById(target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    };

    return (
        <>
            {view !== 'checkout' && (
                <Navbar 
                    cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} 
                    onCartClick={() => setIsCartOpen(true)} 
                    onNav={handleNav} 
                />
            )}

            <main>
                {view === 'home' && <HomeView products={PRODUCTS} onProductClick={(p) => { setActiveProduct(p); setView('product'); }} onNav={handleNav} />}
                {view === 'product' && <ProductDetailView product={activeProduct} onAddToCart={addToCart} onBack={() => setView('home')} />}
                {view === 'checkout' && <CheckoutView cart={cart} total={total} onCancel={() => setView('home')} onSuccess={() => { setCart([]); setView('home'); }} />}
            </main>

            {view !== 'checkout' && <Footer />}

            {/* Cart Drawer */}
            <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={(e) => e.target.classList.contains('cart-overlay') && setIsCartOpen(false)}>
                <div className="cart-drawer">
                    <div className="cart-header">
                        <h3>Your Cart</h3>
                        <button onClick={() => setIsCartOpen(false)} style={{background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
                    </div>
                    <div className="cart-items">
                        {cart.length === 0 ? <p style={{color:'var(--text-muted)', textAlign:'center', marginTop:'2rem'}}>Your cart is empty.</p> : 
                            cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.image} />
                                    <div style={{flex:1}}>
                                        <div style={{fontWeight:'bold'}}>{item.name}</div>
                                        <div style={{color:'var(--primary)'}}>{formatCurrency(item.price)}</div>
                                        <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Qty: {item.quantity}</div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} style={{background:'none', border:'none', color:'var(--error)', cursor:'pointer', fontWeight:'600'}}>Remove</button>
                                </div>
                            ))
                        }
                    </div>
                    <div className="cart-footer">
                        <div className="cart-total"><span>Total</span><span>{formatCurrency(total)}</span></div>
                        <button className="btn btn-primary full-width" onClick={() => { setIsCartOpen(false); setView('checkout'); }}>CHECKOUT</button>
                    </div>
                </div>
            </div>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
