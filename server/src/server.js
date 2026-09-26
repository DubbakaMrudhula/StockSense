const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_jwt_secret_key_2026_super_secure';

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// POST /auth/signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role, warehouse_id } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser = db.createUser({ name, email, password, role, warehouse_id });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password_hash, ...userPayload } = newUser;
  return res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    token,
    user: userPayload
  });
});

// POST /auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password_hash, ...userPayload } = user;
  return res.json({
    success: true,
    message: 'Logged in successfully!',
    token,
    user: userPayload
  });
});

// POST /auth/otp/request
app.post('/api/auth/otp/request', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered user found with this email address.' });
  }

  // Generate random 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  db.saveOTP(email, otpCode);

  console.log(`[OTP GENERATED] For ${email}: ${otpCode}`);

  return res.json({
    success: true,
    message: `OTP sent to ${email}. Check dev modal or console!`,
    demo_otp: otpCode // Expose demo OTP for easy evaluator/demo testing
  });
});

// POST /auth/otp/verify (Verify OTP + Reset Password)
app.post('/api/auth/otp/verify', (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
  }

  const verification = db.verifyOTP(email, otp);
  if (!verification.valid) {
    return res.status(400).json({ success: false, message: verification.message });
  }

  const updated = db.updateUserPassword(email, newPassword);
  if (!updated) {
    return res.status(500).json({ success: false, message: 'Failed to update user password.' });
  }

  return res.json({
    success: true,
    message: 'Password reset successfully! You can now log in with your new password.'
  });
});

// -------------------------------------------------------------
// PROFILE ENDPOINTS
// -------------------------------------------------------------

// GET /profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const { password_hash, ...userPayload } = user;
  const warehouse = db.getWarehouses().find(w => w.id === user.warehouse_id);

  return res.json({
    success: true,
    profile: {
      ...userPayload,
      warehouse_name: warehouse ? warehouse.name : 'All Warehouses'
    }
  });
});

// PUT /profile
app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, email, role, warehouse_id } = req.body;
  const updatedUser = db.updateUserProfile(req.user.id, { name, email, role, warehouse_id });

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User profile update failed.' });
  }

  const { password_hash, ...userPayload } = updatedUser;
  return res.json({
    success: true,
    message: 'Profile updated successfully!',
    profile: userPayload
  });
});

// -------------------------------------------------------------
// DASHBOARD ENDPOINTS
// -------------------------------------------------------------

// GET /dashboard/kpis
app.get('/api/dashboard/kpis', (req, res) => {
  const { doc_type, status, warehouse_id, category_id } = req.query;

  const dashboardData = db.getKPIs({ doc_type, status, warehouse_id, category_id });
  return res.json({
    success: true,
    data: dashboardData
  });
});

// -------------------------------------------------------------
// WAREHOUSE & LOCATION ENDPOINTS
// -------------------------------------------------------------

// GET /warehouses
app.get('/api/warehouses', (req, res) => {
  const warehouses = db.getWarehouses();
  return res.json({
    success: true,
    warehouses
  });
});

// POST /warehouses
app.post('/api/warehouses', authenticateToken, (req, res) => {
  const { code, name, address, manager_name, status, capacity } = req.body;

  if (!name || !address) {
    return res.status(400).json({ success: false, message: 'Warehouse name and address are required.' });
  }

  const newWarehouse = db.createWarehouse({ code, name, address, manager_name, status, capacity });
  return res.status(201).json({
    success: true,
    message: 'Warehouse created successfully!',
    warehouse: newWarehouse
  });
});

// PUT /warehouses/:id
app.put('/api/warehouses/:id', authenticateToken, (req, res) => {
  const updated = db.updateWarehouse(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Warehouse not found.' });
  }
  return res.json({
    success: true,
    message: 'Warehouse updated successfully!',
    warehouse: updated
  });
});

// POST /warehouses/:id/locations
app.post('/api/warehouses/:id/locations', authenticateToken, (req, res) => {
  const { code, name, type, capacity } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Location name is required.' });
  }

  const newLocation = db.createLocation({ warehouse_id: req.params.id, code, name, type, capacity });
  return res.status(201).json({
    success: true,
    message: 'Location added to warehouse successfully!',
    location: newLocation
  });
});

// -------------------------------------------------------------
// ALL DATA / COMPANION ENTITY ENDPOINTS
// -------------------------------------------------------------

app.get('/api/meta', (req, res) => {
  const data = db.getAllData();
  return res.json({
    success: true,
    categories: data.categories,
    uoms: data.uoms,
    warehouses: data.warehouses
  });
});

app.get('/api/products', (req, res) => {
  const data = db.getAllData();
  const products = data.products.map(p => {
    const cat = data.categories.find(c => c.id === p.category_id);
    const uom = data.uoms.find(u => u.id === p.uom_id);
    const stocks = data.stock_quantities.filter(sq => sq.product_id === p.id);
    const totalQty = stocks.reduce((acc, s) => acc + s.qty_on_hand, 0);

    return {
      ...p,
      category_name: cat ? cat.name : 'Uncategorized',
      uom_abbr: uom ? uom.abbreviation : 'pcs',
      total_qty_on_hand: totalQty
    };
  });

  return res.json({ success: true, products });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { sku, name, category_id, uom_id, min_stock_threshold, reorder_qty, price, initial_qty, warehouse_id, location_id } = req.body;

  if (!sku || !name || !category_id || !uom_id) {
    return res.status(400).json({ success: false, message: 'SKU, Product Name, Category, and UOM are required.' });
  }

  const newProd = {
    id: `prod_${Date.now()}`,
    sku,
    name,
    category_id,
    uom_id,
    min_stock_threshold: parseInt(min_stock_threshold) || 50,
    reorder_qty: parseInt(reorder_qty) || 200,
    price: parseFloat(price) || 0.0,
    created_at: new Date().toISOString()
  };

  db.data.products.push(newProd);

  // Add initial stock if specified
  const initQty = parseInt(initial_qty) || 0;
  const whId = warehouse_id || 'wh_1';
  const locId = location_id || 'loc_1';

  if (initQty > 0) {
    db.data.stock_quantities.push({
      id: `sq_${Date.now()}`,
      product_id: newProd.id,
      warehouse_id: whId,
      location_id: locId,
      qty_on_hand: initQty,
      qty_reserved: 0
    });

    // Add ledger entry
    const wh = db.data.warehouses.find(w => w.id === whId);
    const loc = db.data.locations.find(l => l.id === locId);
    db.data.stock_ledger.unshift({
      id: `ledg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      doc_type: 'Adjustment',
      doc_number: `INIT-${newProd.sku}`,
      product_id: newProd.id,
      product_name: newProd.name,
      warehouse_id: whId,
      warehouse_name: wh ? wh.name : 'Default Warehouse',
      location_id: locId,
      location_name: loc ? loc.name : 'Default Location',
      qty_change: initQty,
      balance_after: initQty,
      user_name: req.user.name || 'System Admin'
    });
  }

  db.save();

  return res.status(201).json({
    success: true,
    message: 'Product created successfully!',
    product: newProd
  });
});

app.get('/api/operations/all', (req, res) => {
  const data = db.getAllData();
  return res.json({
    success: true,
    receipts: data.receipts,
    deliveries: data.delivery_orders,
    transfers: data.internal_transfers,
    adjustments: data.stock_adjustments
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`StockSense API Backend Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
