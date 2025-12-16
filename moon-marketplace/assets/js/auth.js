// ============================================
// MOON MARKETPLACE - Authentication System
// Roles: admin, seller (penjual), buyer (pembeli)
// ============================================

const AUTH_KEY = "moon_auth";
const USERS_KEY = "moon_users";
const PRODUCTS_KEY = "moon_products";
const ORDERS_KEY = "moon_orders";
const PAYMENTS_KEY = "moon_payments";

// Initialize default admin account
function initDefaultData() {
  const users = getUsers();
  
  // Create default admin if not exists
  if (!users.find(u => u.role === 'admin')) {
    users.push({
      id: 1,
      username: 'admin',
      password: 'admin123',
      email: 'admin@moon.com',
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
}

// ============ USER MANAGEMENT ============

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = '../index.html';
}

// Register new user
function registerUser(userData) {
  const users = getUsers();
  
  // Check if username already exists
  if (users.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
    return { success: false, message: 'Username sudah digunakan!' };
  }
  
  // Check if email already exists
  if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return { success: false, message: 'Email sudah terdaftar!' };
  }
  
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username: userData.username,
    password: userData.password,
    email: userData.email,
    fullName: userData.fullName || '',
    phone: userData.phone || '',
    address: userData.address || '',
    role: userData.role, // 'seller' or 'buyer'
    status: userData.role === 'buyer' ? 'approved' : 'pending', // sellers need approval
    storeName: userData.storeName || '', // for sellers
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  if (newUser.status === 'pending') {
    return { success: true, message: 'Registrasi berhasil! Menunggu persetujuan admin.', user: newUser };
  }
  return { success: true, message: 'Registrasi berhasil!', user: newUser };
}

// Login
function loginUser(username, password) {
  const users = getUsers();
  const user = users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.password === password
  );
  
  if (!user) {
    return { success: false, message: 'Username atau password salah!' };
  }
  
  if (user.status === 'pending') {
    return { success: false, message: 'Akun Anda masih menunggu persetujuan admin.' };
  }
  
  if (user.status === 'blocked') {
    return { success: false, message: 'Akun Anda telah diblokir. Hubungi admin.' };
  }
  
  setCurrentUser(user);
  return { success: true, message: 'Login berhasil!', user };
}

// Approve user (admin only)
function approveUser(userId) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].status = 'approved';
    saveUsers(users);
    return true;
  }
  return false;
}

// Block user (admin only)
function blockUser(userId) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].status = 'blocked';
    saveUsers(users);
    return true;
  }
  return false;
}

// Unblock user (admin only)
function unblockUser(userId) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].status = 'approved';
    saveUsers(users);
    return true;
  }
  return false;
}

// ============ PRODUCT MANAGEMENT ============

function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Add product (seller only)
function addProduct(productData, sellerId) {
  const products = getProducts();
  const users = getUsers();
  const seller = users.find(u => u.id === sellerId);
  
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    title: productData.title,
    price: parseInt(productData.price),
    description: productData.description || '',
    category: productData.category,
    img: productData.img || 'assets/img/products/default.jpg',
    stock: parseInt(productData.stock) || 1,
    sellerId: sellerId,
    sellerName: seller ? seller.storeName || seller.username : 'Unknown',
    status: 'pending', // needs admin approval
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  saveProducts(products);
  return { success: true, message: 'Produk ditambahkan! Menunggu persetujuan admin.', product: newProduct };
}

// Update product (seller only)
function updateProduct(productId, productData, sellerId) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId && p.sellerId === sellerId);
  
  if (idx === -1) {
    return { success: false, message: 'Produk tidak ditemukan!' };
  }
  
  products[idx] = {
    ...products[idx],
    ...productData,
    price: parseInt(productData.price),
    stock: parseInt(productData.stock),
    status: 'pending' // needs re-approval after edit
  };
  
  saveProducts(products);
  return { success: true, message: 'Produk diupdate! Menunggu persetujuan admin.' };
}

// Delete product (seller only)
function deleteProduct(productId, sellerId) {
  let products = getProducts();
  const product = products.find(p => p.id === productId && p.sellerId === sellerId);
  
  if (!product) {
    return { success: false, message: 'Produk tidak ditemukan!' };
  }
  
  products = products.filter(p => p.id !== productId);
  saveProducts(products);
  return { success: true, message: 'Produk dihapus!' };
}

// Approve product (admin only)
function approveProduct(productId) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].status = 'approved';
    saveProducts(products);
    return true;
  }
  return false;
}

// Block/reject product (admin only)
function blockProduct(productId) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].status = 'blocked';
    saveProducts(products);
    return true;
  }
  return false;
}

// Get products by seller
function getProductsBySeller(sellerId) {
  return getProducts().filter(p => p.sellerId === sellerId);
}

// Get approved products only (for buyers)
function getApprovedProducts() {
  return getProducts().filter(p => p.status === 'approved');
}

// ============ ORDER MANAGEMENT ============

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Create order
function createOrder(buyerId, items, shippingInfo) {
  const orders = getOrders();
  const products = getProducts();
  
  // Calculate total and validate stock
  let total = 0;
  const orderItems = [];
  
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (!product) {
      return { success: false, message: `Produk ${item.title} tidak ditemukan!` };
    }
    if (product.stock < item.qty) {
      return { success: false, message: `Stok ${product.title} tidak mencukupi!` };
    }
    total += product.price * item.qty;
    orderItems.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      qty: item.qty,
      sellerId: product.sellerId,
      sellerName: product.sellerName
    });
  }
  
  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    buyerId,
    items: orderItems,
    total,
    shipping: shippingInfo,
    status: 'pending_payment', // pending_payment, paid, processing, shipped, completed, cancelled
    paymentStatus: 'unpaid', // unpaid, paid, refunded
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  
  return { success: true, message: 'Order berhasil dibuat!', order: newOrder };
}

// Update order status
function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    saveOrders(orders);
    return true;
  }
  return false;
}

// Get orders by buyer
function getOrdersByBuyer(buyerId) {
  return getOrders().filter(o => o.buyerId === buyerId);
}

// Get orders containing seller's products
function getOrdersBySeller(sellerId) {
  return getOrders().filter(o => 
    o.items.some(item => item.sellerId === sellerId)
  );
}

// ============ PAYMENT MANAGEMENT ============

function getPayments() {
  try {
    return JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function savePayments(payments) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

// Process payment
function processPayment(orderId, paymentMethod, buyerId) {
  const orders = getOrders();
  const payments = getPayments();
  const products = getProducts();
  
  const orderIdx = orders.findIndex(o => o.id === orderId && o.buyerId === buyerId);
  if (orderIdx === -1) {
    return { success: false, message: 'Order tidak ditemukan!' };
  }
  
  const order = orders[orderIdx];
  
  if (order.paymentStatus === 'paid') {
    return { success: false, message: 'Order sudah dibayar!' };
  }
  
  // Create payment record
  const payment = {
    id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
    orderId,
    buyerId,
    amount: order.total,
    method: paymentMethod,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  
  payments.push(payment);
  savePayments(payments);
  
  // Update order status
  orders[orderIdx].paymentStatus = 'paid';
  orders[orderIdx].status = 'processing';
  saveOrders(orders);
  
  // Reduce stock
  for (const item of order.items) {
    const prodIdx = products.findIndex(p => p.id === item.productId);
    if (prodIdx !== -1) {
      products[prodIdx].stock -= item.qty;
    }
  }
  saveProducts(products);
  
  return { success: true, message: 'Pembayaran berhasil!', payment };
}

// ============ UTILITY FUNCTIONS ============

function toIDR(value) {
  return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Check if user has permission
function hasPermission(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;
  if (requiredRole === 'admin') return user.role === 'admin';
  if (requiredRole === 'seller') return user.role === 'seller' || user.role === 'admin';
  if (requiredRole === 'buyer') return user.role === 'buyer' || user.role === 'admin';
  return true;
}

// Redirect based on role
function redirectToDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  switch (user.role) {
    case 'admin':
      window.location.href = 'admin/dashboard.html';
      break;
    case 'seller':
      window.location.href = 'seller/dashboard.html';
      break;
    case 'buyer':
      window.location.href = 'index.html';
      break;
    default:
      window.location.href = 'index.html';
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initDefaultData();
});
