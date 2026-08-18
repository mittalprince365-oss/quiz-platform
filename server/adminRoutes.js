const express = require('express');
const pool = require('./db');
const { requireAuth, requireAdmin } = require('./middleware');

const router = express.Router();

// saare admin routes protected hain (login + admin dono zaroori)
router.use(requireAuth, requireAdmin);

// ===== DASHBOARD STATS =====
router.get('/stats', async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'STUDENT'");
    const admins = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'");
    const active = await pool.query("SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'");
    const quizzes = await pool.query("SELECT COUNT(*) FROM quizzes");
    const published = await pool.query("SELECT COUNT(*) FROM quizzes WHERE status = 'Published'");
    const questions = await pool.query("SELECT COUNT(*) FROM questions");
    const attempts = await pool.query("SELECT COUNT(*) FROM attempts");
    const passed = await pool.query("SELECT COUNT(*) FROM attempts WHERE status = 'PASSED'");
    const avgScore = await pool.query("SELECT COALESCE(ROUND(AVG(percentage),1),0) AS avg FROM attempts");

    res.json({
      totalStudents: parseInt(students.rows[0].count),
      totalAdmins: parseInt(admins.rows[0].count),
      activeUsers: parseInt(active.rows[0].count),
      totalQuizzes: parseInt(quizzes.rows[0].count),
      publishedQuizzes: parseInt(published.rows[0].count),
      totalQuestions: parseInt(questions.rows[0].count),
      totalAttempts: parseInt(attempts.rows[0].count),
      passedAttempts: parseInt(passed.rows[0].count),
      averageScore: parseFloat(avgScore.rows[0].avg),
    });
  } catch (err) {
    console.log('Stats error:', err.message);
    res.status(500).json({ error: 'Could not fetch stats' });
  }
});

// ===== ANALYTICS (charts data) =====
router.get('/analytics', async (req, res) => {
  try {
    const passFail = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'PASSED') AS passed,
        COUNT(*) FILTER (WHERE status = 'FAILED') AS failed
       FROM attempts`
    );

    const popular = await pool.query(
      `SELECT q.title, COUNT(a.id) AS attempts
       FROM quizzes q
       LEFT JOIN attempts a ON a.quiz_id = q.id
       GROUP BY q.id, q.title
       ORDER BY attempts DESC
       LIMIT 5`
    );

    const overTime = await pool.query(
      `SELECT TO_CHAR(completed_at::date, 'DD Mon') AS day, COUNT(*) AS count
       FROM attempts
       WHERE completed_at >= NOW() - INTERVAL '7 days'
       GROUP BY completed_at::date
       ORDER BY completed_at::date`
    );

    res.json({
      passFail: passFail.rows[0],
      popular: popular.rows.map((r) => ({ title: r.title, attempts: parseInt(r.attempts) })),
      overTime: overTime.rows.map((r) => ({ day: r.day, count: parseInt(r.count) })),
    });
  } catch (err) {
    console.log('Analytics error:', err.message);
    res.status(500).json({ error: 'Could not fetch analytics' });
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
    const { status } = req.body;

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