const express = require('express');
const pool = require('./db');
const { requireAuth, requireAdmin } = require('./middleware');

const router = express.Router();

// saare admin routes protected hain (login + admin dono zaroori)
router.use(requireAuth, requireAdmin);

// ===== DASHBOARD STATS =====
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'STUDENT'"
    );
    const totalAdmins = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'ADMIN'"
    );
    const activeUsers = await pool.query(
      "SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'"
    );

    res.json({
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalAdmins: parseInt(totalAdmins.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      // quiz stats Day 5 ke baad add karenge (abhi table hi nahi hai)
      totalQuizzes: 0,
      totalAttempts: 0,
    });
  } catch (err) {
    console.log('Stats error:', err.message);
    res.status(500).json({ error: 'Could not fetch stats' });
  }
});
// ===== ALL STUDENTS (with search) =====
router.get('/users', async (req, res) => {
  try {
    const search = req.query.search || '';
    const result = await pool.query(
      `SELECT id, name, email, role, status, created_at
       FROM users
       WHERE role = 'STUDENT' AND (name ILIKE $1 OR email ILIKE $1)
       ORDER BY created_at DESC`,
      [`%${search}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.log('Users error:', err.message);
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// ===== ACTIVATE / DEACTIVATE =====
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE users SET status = $1 WHERE id = $2 AND role = 'STUDENT'
       RETURNING id, name, email, role, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log('Status update error:', err.message);
    res.status(500).json({ error: 'Could not update status' });
  }
});

// ===== DELETE STUDENT =====
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 AND role = 'STUDENT' RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted', id: result.rows[0].id });
  } catch (err) {
    console.log('Delete error:', err.message);
    res.status(500).json({ error: 'Could not delete student' });
  }
});

module.exports = router;