const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const router = express.Router();

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // email pehle se hai kya?
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // PASSWORD HASH karo (plain password kabhi DB mein nahi)
    const hashedPassword = await bcrypt.hash(password, 10);

    // database mein INSERT karo
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, status, created_at`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    // JWT TOKEN banao
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.log('Register error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// ===== LOGIN =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // user dhundo email se
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // account deactivated toh nahi?
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    // password check karo (plain vs hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // JWT token banao
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // password hata ke user bhejo
    delete user.password;

    res.json({ token, user });
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
module.exports = router;