const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./auth');
const { requireAuth, requireAdmin } = require('./middleware');
const adminRoutes = require('./adminRoutes');
const quizRoutes = require('./quizRoutes');
const questionRoutes = require('./questionRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
// koi bhi logged-in user
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ message: 'You are logged in', user: req.user });
});

// sirf admin
app.get('/api/admin/test', requireAuth, requireAdmin, (req, res) => {
  res.json({ message: 'Welcome Admin! You have admin access.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'quiz-platform',
    time: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));