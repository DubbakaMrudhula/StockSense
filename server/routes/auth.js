const express = require('express');
const router = express.Router();
const store = require('../store');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let user = await store.findUserByEmail(email);

    // If user doesn't exist, allow instant testing by creating session
    if (!user) {
      const defaultRole = role || 'Warehouse Staff';
      user = {
        name: email.split('@')[0],
        email,
        role: defaultRole
      };
    }

    // In a full production build, verify bcrypt hash here
    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: role || user.role
      },
      token: "demo-jwt-session-token"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = await store.registerUser({
      name,
      email,
      password: password || 'default123',
      role: role || 'Warehouse Staff'
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token: "demo-jwt-session-token"
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
