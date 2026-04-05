/**
 * NexStore - Modern E-Commerce Logic
 */

const API_URL = 'https://fakestoreapi.com/products';
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'All'; 
let searchQuery = '';
let currentPage = 1;
const productsPerPage = 16;

// DOM Elements
const mainContent = document.getElementById('main-content');
const cartCount = document.getElementById('cart-count');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const toast = document.getElementById('toast');

// Fullscreen & Content Locking
document.addEventListener('click', (e) => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    }
});

// Lock Copy/Paste and Right Click
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('paste', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    generateProducts(); 
    updateCartCount();
    setupNavigation();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    darkModeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = darkModeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function setupNavigation() {
    const links = {
        'home-link': renderHome,
        'cart-link': renderCart,
        'footer-about-site': () => { currentCategory = 'All'; renderProducts(allProducts, 'About Website'); },
        'footer-about-products': () => { currentCategory = 'All'; renderProducts(allProducts, 'Our Products'); },
        'footer-about-us': () => { currentCategory = 'All'; renderProducts(allProducts, 'About Developers'); }
    };

    Object.entries(links).forEach(([id, handler]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
                window.scrollTo(0, 0);
            });
        }
    });

    searchBtn.addEventListener('click', (e) => { e.stopPropagation(); handleSearch(); });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.stopPropagation(); handleSearch(); }
    });
}

function handleSearch() {
    searchQuery = searchInput.value.toLowerCase().trim();
    currentPage = 1;
    if (searchQuery) {
        const filtered = allProducts.filter(p => 
            p.title.toLowerCase().includes(searchQuery) || 
            p.description.toLowerCase().includes(searchQuery)
        );
        renderProducts(filtered, `Search results for "${searchQuery}"`);
    } else {
        renderProducts(allProducts);
    }
}

function generateProducts() {
    showSpinner(true);
    
    const categoryMapping = {
        "Chips": ["chps 1.jpg", "chips 2.jpg", "chips 3.jpg", "chips 4.jpg", "chips 5.jpg"],
        "Coldrink": ["coldrink 1.jpg", "coldrink 2.jpg", "coldrink 3.jpg", "coldrink 4.jpg", "coldrink 5.jpg"],
        "Magy": ["magy 1.jpg", "magy 2.jpg", "magy 3.jpg", "magy 4.jpg", "magy 5.jpg"],
        "Fruits": ["fruir 1.jpg", "fruit 2.jpg", "fruit 3.jpg", "fruit 4.jpg", "fruit 5.jpg"],
        "Cloth": ["cloth 1.jpg", "cloth 2.jpg", "cloth 3.jpg", "cloth 4.jpg", "cloth 5.jpg"],
        "Electronics": ["electronic 1.jpg", "electronic 2.jpg", "electronic 3.jpg", "electronic 4.jpg", "electronic 5.jpg"]
    };
    
    const categoryInfo = {
        "Chips": "Crunchy snacks.",
        "Coldrink": "Refreshing drinks.",
        "Magy": "Instant noodles.",
        "Fruits": "Organic fruits.",
        "Cloth": "Trendy apparel.",
        "Electronics": "Modern gadgets."
    };

    const categories = Object.keys(categoryMapping);
    allProducts = [];
    
    // Generate 5 products for each of the 6 categories = 30 products total (1 page per category)
    let idCounter = 1;
    categories.forEach(cat => {
        const images = categoryMapping[cat];
        for (let i = 1; i <= 5; i++) {
            allProducts.push({
                id: idCounter++,
                title: `${cat} Premium ${i}`,
                price: Math.floor(Math.random() * 2000) + 50,
                description: `Authentic ${cat.toLowerCase()} with quality guaranteed.`,
                category: cat,
                categoryDesc: categoryInfo[cat],
                image: images[i-1]
            });
        }
    });

    // Shuffle products for variety on home page
    allProducts.sort(() => Math.random() - 0.5);
    
    renderHome();
    showSpinner(false);
}

function renderHome() {
    // Mixed home page
    const featured = allProducts.slice(0, 4);
    mainContent.innerHTML = `
        <div class="animate-up">
            <section class="hero">
                <h1>Mixed Home Selection</h1>
                <p>Everything you need in one place, localized in Indian Rupees (₹).</p>
                <a href="#" class="btn" id="shop-now-btn">Start Shopping</a>
            </section>

            <div class="section-title">
                <h2>Mixed Top Picks</h2>
                <a href="#" class="btn btn-secondary" id="view-all-btn">View All Categories</a>
            </div>
            <div class="product-grid" id="featured-grid"></div>
        </div>
    `;

    const featuredGrid = document.getElementById('featured-grid');
    featured.forEach(product => {
        featuredGrid.appendChild(createProductCard(product));
    });

    document.getElementById('shop-now-btn').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        currentCategory = 'All';
        currentPage = 1;
        renderProducts(allProducts);
    });
    document.getElementById('view-all-btn').addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        currentCategory = 'All';
        currentPage = 1;
        renderProducts(allProducts);
    });
}

function renderProducts(products, title = 'All Products') {
    // 6 distinct categories for 6 pages total
    const categories = ['All', 'Chips', 'Coldrink', 'Magy', 'Fruits', 'Cloth', 'Electronics'];
    const totalPages = Math.ceil(products.length / productsPerPage);
    const paginatedProducts = products;

    let displayInfo = "";
    if (title === 'About Website') {
        displayInfo = "NexStore India SPA architecture.";
    } else if (title === 'Our Products') {
        displayInfo = "30 items across 6 categories.";
    } else if (title === 'About Developers') {
        displayInfo = "Developed by Nakul Sharma and Akshay.";
    } else {
        displayInfo = currentCategory !== 'All' ? allProducts.find(p => p.category === currentCategory).categoryDesc : "Browse our collection.";
    }

    mainContent.innerHTML = `
        <div class="animate-up">
            <div class="section-title">
                <h2>${title}</h2>
                <div class="filters">
                    <select id="category-filter" class="form-select">
                        ${categories.map(cat => `<option value="${cat}" ${currentCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="product-grid" id="products-grid"></div>
            <div class="pagination" id="pagination-controls"></div>
        </div>
    `;

    const grid = document.getElementById('products-grid');
    paginatedProducts.forEach(product => {
        grid.appendChild(createProductCard(product));
    });


    document.getElementById('category-filter').addEventListener('change', (e) => {
        e.stopPropagation();
        currentCategory = e.target.value;
        currentPage = 1;
        const filtered = currentCategory === 'All' 
            ? allProducts 
            : allProducts.filter(p => p.category === currentCategory);
        renderProducts(filtered, currentCategory);
    });
}

function renderPagination(totalPages, products) {
    const container = document.getElementById('pagination-controls');
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentPage = i;
            renderProducts(products, currentCategory);
            window.scrollTo(0, 0);
        });
        container.appendChild(btn);
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card animate-up';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price-row">
                <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;

    card.querySelector('.product-image').addEventListener('click', (e) => { e.stopPropagation(); renderProductDetails(product.id); });
    card.querySelector('.product-title').addEventListener('click', (e) => { e.stopPropagation(); renderProductDetails(product.id); });
    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product);
    });

    return card;
}

function renderProductDetails(id) {
    showSpinner(true);
    const product = allProducts.find(p => p.id === id);
    
    mainContent.innerHTML = `
        <div class="animate-up">
            <div class="product-details">
                <div class="details-image-container">
                    <img src="${product.image}" alt="${product.title}" class="details-image">
                </div>
                <div class="details-info">
                    <span class="product-category">${product.category}</span>
                    <h1>${product.title}</h1>
                    <div class="details-price">₹${product.price.toLocaleString('en-IN')}</div>
                    <p class="details-description">${product.description}</p>
                    <button class="btn btn-lg" id="details-add-btn">Add to Cart</button>
                    <button class="btn btn-secondary btn-lg" style="margin-left: 1rem" id="back-btn">Back</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('details-add-btn').addEventListener('click', (e) => { e.stopPropagation(); addToCart(product); });
    document.getElementById('back-btn').addEventListener('click', (e) => { e.stopPropagation(); renderProducts(allProducts); });
    showSpinner(false);
}

// Cart Logic
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    showToast(`Added ${product.title.substring(0, 20)}... to cart`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = total;
    cartCount.style.display = total > 0 ? 'flex' : 'none';
}

function renderCart() {
    if (cart.length === 0) {
        mainContent.innerHTML = `
            <div class="animate-up" style="text-align: center; padding: 4rem 0">
                <h2>Your Cart is Empty</h2>
                <p style="margin: 1rem 0 2rem">Looks like you haven't added anything yet.</p>
                <a href="#" class="btn" id="start-shopping">Start Shopping</a>
            </div>
        `;
        document.getElementById('start-shopping').addEventListener('click', (e) => { e.stopPropagation(); renderProducts(allProducts); });
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    mainContent.innerHTML = `
        <div class="animate-up cart-container">
            <h1>Shopping Cart</h1>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-info">
                            <h3>${item.title}</h3>
                            <p class="product-price">₹${item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₹${total.toLocaleString('en-IN')}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>FREE</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total</span>
                    <span>₹${total.toLocaleString('en-IN')}</span>
                </div>
                <button class="btn btn-full" id="checkout-btn" style="width: 100%; margin-top: 1rem">Proceed to Checkout</button>
            </div>
        </div>
    `;

    document.getElementById('checkout-btn').addEventListener('click', (e) => { e.stopPropagation(); renderCheckout(); });
}

function renderCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    mainContent.innerHTML = `
        <div class="animate-up checkout-container">
            <h1>Checkout</h1>
            <div class="checkout-grid">
                <div class="checkout-form">
                    <h3>Shipping Information</h3>
                    <form id="checkout-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" required placeholder="john@example.com">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <input type="text" required placeholder="123 Street Name">
                        </div>
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
                            <div class="form-group">
                                <label>City</label>
                                <input type="text" required>
                            </div>
                            <div class="form-group">
                                <label>Zip Code</label>
                                <input type="text" required>
                            </div>
                        </div>
                        <button type="submit" class="btn" style="width: 100%">Complete Purchase</button>
                    </form>
                </div>
                <div class="cart-summary">
                    <h3>Your Order</h3>
                    ${cart.map(item => `
                        <div class="summary-row">
                            <span>${item.title.substring(0, 20)}... x ${item.quantity}</span>
                            <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    `).join('')}
                    <div class="summary-row total-row">
                        <span>Total</span>
                        <span>₹${total.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault(); e.stopPropagation();
        cart = [];
        saveCart();
        mainContent.innerHTML = `
            <div class="animate-up success-page" style="text-align: center; padding: 4rem 0">
                <i class="fas fa-check-circle" style="font-size: 5rem; color: var(--success); margin-bottom: 2rem"></i>
                <h1>Thank You For Your Order!</h1>
                <p style="margin: 1rem 0 2rem">Your purchase was successful and is being processed.</p>
                <a href="#" class="btn" onclick="renderHome()">Back to Home</a>
            </div>
        `;
    });
}

// UI Helpers
function showSpinner(show) {
    if (show) {
        loadingSpinner.classList.add('active');
    } else {
        loadingSpinner.classList.remove('active');
    }
}

function showToast(message) {
    toast.innerText = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}