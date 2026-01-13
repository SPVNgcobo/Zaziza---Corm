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

// --- ICONS & UTILS ---
const Icons = {
    Facebook: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
    Instagram: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
    Twitter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>,
    Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
    Map: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// --- HOOKS ---
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

// 1. Navbar
const Navbar = ({ cartCount, openCart, toggleWishlist, openSearch, user, openAuth, logout, onNavClick }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav id="navbar">
            <div className="nav-content">
                <div className="logo" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>ZAZIZA</div>
                <ul className="nav-links">
                    <li><button onClick={() => onNavClick('shop')}>SHOP</button></li>
                    <li><button onClick={() => onNavClick('new')}>NEW IN</button></li>
                    <li><button onClick={() => onNavClick('about')}>ABOUT</button></li>
                    <li><button onClick={() => onNavClick('contact')}>CONTACT</button></li>
                </ul>
                <div className="nav-icons">
                    <button className="nav-icon-btn" onClick={openSearch}>🔍</button>
                    <button className="nav-icon-btn" onClick={toggleWishlist}>❤️</button>
                    <button className="nav-icon-btn" onClick={openCart} style={{position: 'relative'}}>
                        🛒
                        <span className="cart-badge" key={cartCount} style={{animation: 'pulse 0.5s ease'}}>{cartCount}</span>
                    </button>
                    <div style={{position: 'relative'}} onMouseLeave={() => setMenuOpen(false)}>
                        {user ? (
                            <div className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                                {user.name.charAt(0)}{user.name.split(' ')[1] ? user.name.split(' ')[1].charAt(0) : ''}
                            </div>
                        ) : (
                            <button className="nav-icon-btn" onClick={openAuth}>👤</button>
                        )}
                        <div className={`user-menu ${menuOpen ? 'active' : ''}`}>
                            <button className="user-menu-item">My Orders</button>
                            <button className="user-menu-item">Account Settings</button>
                            <button className="user-menu-item" onClick={() => { logout(); setMenuOpen(false); }} style={{color: 'var(--accent)'}}>Sign Out</button>
                        </div>
                    </div>
                    <button className="mobile-menu-btn">☰</button>
                </div>
            </div>
        </nav>
    );
};

// 2. Contact Section (New)
const ContactSection = () => {
    const [status, setStatus] = useState('idle'); // idle, submitting, success
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        await new Promise(r => setTimeout(r, 2000));
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
    };

    const handleChange = (e) => setFormData({...formData, [e.target.id]: e.target.value});

    return (
        <section id="contact" className="contact-section reveal">
            <div className="section-header">
                <div className="section-label">GET IN TOUCH</div>
                <h2 className="section-title">Contact Us</h2>
                <p className="section-description">Questions about your order? Styling advice? We're here to help.</p>
            </div>
            
            <div className="contact-container">
                {/* Left: Contact Info */}
                <div className="contact-info">
                    <div className="contact-card">
                        <div className="contact-icon"><Icons.Mail /></div>
                        <h3>Email Us</h3>
                        <p>concierge@zaziza.com</p>
                        <p>support@zaziza.com</p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon"><Icons.Map /></div>
                        <h3>Visit Us</h3>
                        <p>88 Fashion Avenue</p>
                        <p>New York, NY 10012</p>
                    </div>
                    <div className="contact-card">
                        <div className="contact-icon"><Icons.Instagram /></div>
                        <h3>Follow Us</h3>
                        <p>@zaziza_official</p>
                        <p>#RedefineYourStyle</p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="contact-form-wrapper">
                    {status === 'success' ? (
                        <div className="success-message">
                            <div className="checkmark-circle"><div className="checkmark draw"></div></div>
                            <h3>Message Sent!</h3>
                            <p>We'll get back to you within 24 hours.</p>
                            <button className="btn btn-secondary" onClick={() => setStatus('idle')}>Send Another</button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group floating-label">
                                <input type="text" id="name" className="form-input" placeholder=" " value={formData.name} onChange={handleChange} required />
                                <label>Your Name</label>
                            </div>
                            <div className="form-group floating-label">
                                <input type="email" id="email" className="form-input" placeholder=" " value={formData.email} onChange={handleChange} required />
                                <label>Email Address</label>
                            </div>
                            <div className="form-group floating-label">
                                <input type="text" id="subject" className="form-input" placeholder=" " value={formData.subject} onChange={handleChange} required />
                                <label>Subject</label>
                            </div>
                            <div className="form-group floating-label">
                                <textarea id="message" className="form-input" placeholder=" " style={{height: '150px', resize: 'none'}} value={formData.message} onChange={handleChange} required></textarea>
                                <label>How can we help?</label>
                            </div>
                            <button type="submit" className="btn btn-primary full-width" disabled={status === 'submitting'}>
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

// ... [AuthModal & CheckoutOverlay Code remains exactly the same as previous step - Included for brevity in compilation] ...
const AuthModal = ({ isOpen, onClose, onLogin }) => {
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => { if(isOpen) { setView('login'); setError(''); setSuccessMsg(''); setFormData({ email: '', password: '', name: '', confirmPassword: '' }); } }, [isOpen]);
    const handleInput = (e) => setFormData({...formData, [e.target.id]: e.target.value});
    const handleAuth = async (e) => {
        e.preventDefault(); setError(''); setLoading(true); await new Promise(r => setTimeout(r, 1500));
        if (view === 'login') { if (formData.email && formData.password) { onLogin({ name: "Demo User", email: formData.email }); onClose(); } else { setError("Invalid credentials."); } }
        else if (view === 'signup') { if (formData.password !== formData.confirmPassword) setError("Passwords do not match."); else if (formData.name && formData.email) { onLogin({ name: formData.name, email: formData.email }); onClose(); } else setError("Fill all fields."); }
        else if (view === 'forgot') { setSuccessMsg(`Reset link sent to ${formData.email}`); setTimeout(() => { setView('login'); setSuccessMsg(''); }, 3000); }
        setLoading(false);
    };
    if (!isOpen) return null;
    return (
        <div className={`modal active`} onClick={(e) => e.target.classList.contains('modal') && onClose()}>
            <div className="modal-content" style={{maxWidth: '400px'}}>
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="auth-header"><h2>{view==='login'?'Welcome Back':view==='signup'?'Join Zaziza':'Reset Password'}</h2></div>
                {error && <div style={{color:'var(--accent)',marginBottom:'1rem',textAlign:'center'}}>{error}</div>}
                {successMsg && <div style={{color:'var(--primary)',marginBottom:'1rem',textAlign:'center'}}>{successMsg}</div>}
                <form onSubmit={handleAuth}>
                    {view === 'signup' && <div className="form-group floating-label"><input type="text" id="name" className="form-input" placeholder=" " value={formData.name} onChange={handleInput} required /><label>Full Name</label></div>}
                    <div className="form-group floating-label"><input type="email" id="email" className="form-input" placeholder=" " value={formData.email} onChange={handleInput} required /><label>Email</label></div>
                    {view !== 'forgot' && <div className="form-group floating-label"><input type="password" id="password" className="form-input" placeholder=" " value={formData.password} onChange={handleInput} required /><label>Password</label></div>}
                    {view === 'signup' && <div className="form-group floating-label"><input type="password" id="confirmPassword" className="form-input" placeholder=" " value={formData.confirmPassword} onChange={handleInput} required /><label>Confirm Password</label></div>}
                    {view === 'login' && <div style={{textAlign:'right',marginBottom:'1.5rem'}}><button type="button" className="auth-link" style={{fontSize:'0.85rem'}} onClick={()=>setView('forgot')}>Forgot Password?</button></div>}
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>{loading?'Processing...':(view==='login'?'Sign In':view==='signup'?'Create Account':'Send Link')}</button>
                </form>
                <div className="auth-footer">
                    {view==='login'&&<p>No account? <button className="auth-link" onClick={()=>setView('signup')}>Sign Up</button></p>}
                    {view==='signup'&&<p>Have account? <button className="auth-link" onClick={()=>setView('login')}>Sign In</button></p>}
                    {view==='forgot'&&<button className="auth-link" onClick={()=>setView('login')}>Back to Login</button>}
                </div>
            </div>
        </div>
    );
};

const CheckoutOverlay = ({ isOpen, onClose, cart, clearCart, user }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ email: user?.email||'', firstName: user?.name?.split(' ')[0]||'', lastName: user?.name?.split(' ')[1]||'', address:'', city:'', postal:'', shipping:'standard', cardNumber:'', expiry:'', cvc:'', cardName:'' });
    const [isProcessing, setIsProcessing] = useState(false);
    useEffect(() => { if(user) setFormData(prev => ({...prev, email:user.email, firstName:user.name.split(' ')[0], lastName:user.name.split(' ')[1]||'' })); }, [user]);
    useEffect(() => { if(isOpen) setStep(1); }, [isOpen]);
    const shippingCost = formData.shipping === 'express' ? 25 : 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;
    const handleInput = (e) => {
        const { id, value } = e.target;
        let formatted = value;
        if (id === 'cardNumber') formatted = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        if (id === 'expiry') formatted = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2');
        setFormData(prev => ({ ...prev, [id]: formatted }));
    };
    const nextStep = () => { if ([1,2,3].includes(step) && Object.values(formData).some(x => x === '')) alert("Please fill fields (Demo validation)"); else setStep(s => s + 1); };
    const processPayment = async () => { setIsProcessing(true); await new Promise(r => setTimeout(r, 2000)); clearCart(); setIsProcessing(false); setStep('success'); };
    if (!isOpen) return null;
    return (
        <div className={`checkout-overlay ${isOpen ? 'active' : ''}`}>
            <div className="checkout-container">
                <div className="checkout-main">
                    <div className="checkout-header"><div className="logo">ZAZIZA</div><button className="close-checkout" onClick={onClose}>Cancel</button></div>
                    <div className="checkout-progress">
                        {[1, 2, 3].map(s => (<React.Fragment key={s}><div className={`step ${step >= s ? 'active' : ''}`}><span>{s}</span></div>{s < 3 && <div className="step-line"></div>}</React.Fragment>))}
                    </div>
                    {step === 1 && <div className="checkout-step active"><h2>Info</h2><div className="form-group floating-label"><input type="email" id="email" className="form-input" placeholder=" " value={formData.email} onChange={handleInput}/><label>Email</label></div><button className="btn btn-primary full-width" onClick={nextStep}>Next</button></div>}
                    {step === 2 && <div className="checkout-step active"><h2>Shipping</h2><div className="shipping-options"><label className="shipping-option"><input type="radio" name="shipping" checked={formData.shipping==='standard'} onChange={()=>setFormData({...formData,shipping:'standard'})}/><div className="option-details"><span>Standard</span><span>Free</span></div></label></div><div className="step-actions"><button className="btn btn-secondary" onClick={()=>setStep(1)}>Back</button><button className="btn btn-primary" onClick={nextStep}>Next</button></div></div>}
                    {step === 3 && <div className="checkout-step active"><h2>Payment</h2><div className="payment-card-visual"><div className="card-number-display">{formData.cardNumber||'••••'}</div></div><div className="form-group floating-label"><input type="text" id="cardNumber" maxLength="19" className="form-input" placeholder=" " value={formData.cardNumber} onChange={handleInput}/><label>Card</label></div><div className="step-actions"><button className="btn btn-secondary" onClick={()=>setStep(2)}>Back</button><button className="btn btn-primary" disabled={isProcessing} onClick={processPayment}>{isProcessing?'...':`Pay ${formatCurrency(total)}`}</button></div></div>}
                    {step === 'success' && <div className="checkout-step active" style={{textAlign:'center'}}><h2>Order Confirmed!</h2><button className="btn btn-primary full-width" onClick={onClose}>Close</button></div>}
                </div>
                <div className="checkout-sidebar"><h2>Summary</h2>{cart.map(i=><div key={i.id} className="checkout-item"><img src={i.image} className="checkout-item-img"/><div>{i.name}</div><div>{formatCurrency(i.price)}</div></div>)}<div className="checkout-pricing"><div className="price-row total"><span>Total</span><span>{formatCurrency(total)}</span></div></div></div>
            </div>
        </div>
    );
};

// 4. Main App Container
const App = () => {
    useScrollReveal();
    const [cart, setCart] = usePersistedState('zaziza_cart', []);
    const [wishlist, setWishlist] = usePersistedState('zaziza_wishlist', []);
    const [user, setUser] = usePersistedState('zaziza_user', null);
    const [filter, setFilter] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

    const handleNavClick = (section) => {
        if (section === 'shop') {
            document.getElementById('categories').scrollIntoView({behavior: 'smooth'});
        } else if (section === 'new') {
            setFilter('new');
            document.getElementById('products').scrollIntoView({behavior: 'smooth'});
        } else if (section === 'about') {
            document.getElementById('about').scrollIntoView({behavior: 'smooth'});
        } else if (section === 'contact') {
            document.getElementById('contact').scrollIntoView({behavior: 'smooth'});
        }
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

    const handleLogin = (userData) => { setUser(userData); notify(`Welcome back, ${userData.name}!`); };
    const handleLogout = () => { setUser(null); notify("Signed out successfully"); };

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
                user={user}
                openAuth={() => setIsAuthOpen(true)}
                logout={handleLogout}
                onNavClick={handleNavClick}
            />

            <section className="hero">
                <div className="hero-bg-shapes"><div className="shape shape1"></div><div className="shape shape2"></div><div className="shape shape3"></div></div>
                <div className="hero-content">
                    <div className="hero-badge">✨ NEW COLLECTION 2026</div>
                    <h1>REDEFINE YOUR STYLE</h1>
                    <p>Experience fashion that speaks volumes.</p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => handleNavClick('new')}>EXPLORE</button>
                        <button className="btn btn-secondary" onClick={() => handleNavClick('shop')}>BROWSE</button>
                    </div>
                </div>
            </section>

            <section id="categories" className="categories">
                <div className="section-header reveal">
                    <div className="section-label">CATEGORIES</div>
                    <h2 className="section-title">Shop by Style</h2>
                </div>
                <div className="categories-grid">
                    {['women', 'men', 'accessories', 'sale'].map(cat => (
                        <div key={cat} className="category-card reveal" onClick={() => { setFilter(cat); document.getElementById('products').scrollIntoView({behavior:'smooth'}); }}>
                            <div className="category-content">
                                <h3 className="category-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
                                <p className="category-count">View Collection</p>
                            </div>
                        </div>
                    ))}
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
                            <div className="product-image-container"><img src={p.image} className="product-image" loading="lazy" /></div>
                            <div className="product-actions">
                                <button className="action-btn" onClick={() => toggleWishlist(p.id)}>{wishlist.includes(p.id) ? '❤️' : '🤍'}</button>
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

            <section id="about" className="features reveal">
                <div className="features-container">
                    <div className="section-header">
                        <div className="section-label">WHY ZAZIZA</div>
                        <h2 className="section-title">The Experience</h2>
                    </div>
                    <div className="features-grid">
                        <div className="feature"><div className="feature-icon">🚚</div><h3>Global Shipping</h3><p>Fast delivery to over 100 countries.</p></div>
                        <div className="feature"><div className="feature-icon">🔒</div><h3>Secure Payment</h3><p>100% secure payment processing.</p></div>
                        <div className="feature"><div className="feature-icon">⭐</div><h3>Premium Quality</h3><p>Hand-picked materials for lasting style.</p></div>
                    </div>
                </div>
            </section>

            <ContactSection />
            
            <footer>
                <div className="footer-content">
                    <div className="footer-brand-col">
                        <h3>ZAZIZA</h3>
                        <p>Redefining modern fashion with curated pieces that blend contemporary aesthetics with timeless elegance. Designed for the bold.</p>
                        <div className="social-icons">
                            <a href="#" className="social-icon"><Icons.Facebook /></a>
                            <a href="#" className="social-icon"><Icons.Instagram /></a>
                            <a href="#" className="social-icon"><Icons.Twitter /></a>
                        </div>
                    </div>
                    <div className="footer-link-col"><h4>Shop</h4><ul><li><a href="#">New Arrivals</a></li><li><a href="#">Best Sellers</a></li><li><a href="#">Accessories</a></li><li><a href="#">Sale</a></li></ul></div>
                    <div className="footer-link-col"><h4>Support</h4><ul><li><a href="#">Help Center</a></li><li><a href="#">Shipping & Returns</a></li><li><a href="#">Size Guide</a></li><li><a href="#">Contact Us</a></li></ul></div>
                    <div className="footer-link-col"><h4>Legal</h4><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Cookie Policy</a></li><li><a href="#">Sustainability</a></li></ul></div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Zaziza. All rights reserved.</p>
                    <div className="payment-methods"><span className="payment-pill">VISA</span><span className="payment-pill">AMEX</span><span className="payment-pill">PAYPAL</span></div>
                </div>
            </footer>

            <div className={`modal ${isCartOpen ? 'active' : ''}`} onClick={(e) => e.target.classList.contains('modal') && setIsCartOpen(false)}>
                <div className="modal-content">
                    <button className="modal-close" onClick={() => setIsCartOpen(false)}>×</button>
                    <h2>Shopping Cart</h2>
                    <div className="cart-items">
                        {cart.length === 0 ? <div className="empty-cart"><p>Cart is empty</p></div> : cart.map(item => (<div key={item.id} className="cart-item"><img src={item.image} className="cart-item-image" /><div className="cart-item-info"><div className="cart-item-name">{item.name}</div><div className="cart-item-price">${item.price} × {item.quantity}</div></div><button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>Remove</button></div>))}
                    </div>
                    <div className="cart-total"><span>Total:</span><span>{formatCurrency(cartTotal)}</span></div>
                    <button className="btn btn-primary full-width" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>CHECKOUT</button>
                </div>
            </div>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />
            <CheckoutOverlay isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} clearCart={() => setCart([])} user={user} />
            <div className={`notification ${notification ? 'active' : ''}`}><span>{notification}</span></div>
        </React.Fragment>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
