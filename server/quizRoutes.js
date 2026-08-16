const express = require('express');
const pool = require('./db');
const { requireAuth, requireAdmin } = require('./middleware');

const router = express.Router();

// ===== CREATE QUIZ (admin only) =====
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const {
    title, description, category, difficulty,
    duration, passing_score, max_attempts, status,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO quizzes
       (title, description, category, difficulty, duration, passing_score, max_attempts, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description || '',
        category || 'General',
        difficulty || 'Beginner',
        duration || 10,
        passing_score || 60,
        max_attempts || 1,
        status || 'Draft',
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log('Create quiz error:', err.message);
    res.status(500).json({ error: 'Could not create quiz' });
  }
});

// ===== LIST ALL QUIZZES (admin only) =====
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.log('List quizzes error:', err.message);
    res.status(500).json({ error: 'Could not fetch quizzes' });
  }
});

// ===== GET ONE QUIZ =====
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch quiz' });
  }
});

// ===== UPDATE QUIZ =====
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const {
    title, description, category, difficulty,
    duration, passing_score, max_attempts, status,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE quizzes SET
        title = $1, description = $2, category = $3, difficulty = $4,
        duration = $5, passing_score = $6, max_attempts = $7, status = $8,
        updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [title, description, category, difficulty, duration, passing_score, max_attempts, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log('Update quiz error:', err.message);
    res.status(500).json({ error: 'Could not update quiz' });
  }
});

// ===== DELETE QUIZ =====
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM quizzes WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete quiz' });
  }
});

module.exports = router;