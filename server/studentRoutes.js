const express = require('express');
const pool = require('./db');
const { requireAuth } = require('./middleware');

const router = express.Router();

// sab routes login-protected (student ya admin, koi bhi logged-in)
router.use(requireAuth);

// ===== PUBLISHED QUIZZES (with search + filter) =====
router.get('/quizzes', async (req, res) => {
  try {
    const { search = '', category = '', difficulty = '' } = req.query;
    const result = await pool.query(
      `SELECT q.*,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count
       FROM quizzes q
       WHERE q.status = 'Published'
         AND q.title ILIKE $1
         AND ($2 = '' OR q.category = $2)
         AND ($3 = '' OR q.difficulty = $3)
       ORDER BY q.created_at DESC`,
      [`%${search}%`, category, difficulty]
    );
    res.json(result.rows);
  } catch (err) {
    console.log('Student quizzes error:', err.message);
    res.status(500).json({ error: 'Could not fetch quizzes' });
  }
});

// ===== ONE QUIZ DETAILS (published only) =====
router.get('/quizzes/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count
       FROM quizzes q
       WHERE q.id = $1 AND q.status = 'Published'`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch quiz' });
  }
});

// ===== START QUIZ - questions WITHOUT correct answers =====
router.get('/quizzes/:id/start', async (req, res) => {
  try {
    // quiz published hai?
    const quiz = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1 AND status = 'Published'",
      [req.params.id]
    );
    if (quiz.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not available' });
    }

    const questions = await pool.query(
      'SELECT id, question_text, marks FROM questions WHERE quiz_id = $1 ORDER BY id',
      [req.params.id]
    );

    // options laao PAR is_correct HATA KE (cheating rokni hai!)
    const withOptions = await Promise.all(
      questions.rows.map(async (q) => {
        const opts = await pool.query(
          'SELECT id, option_text FROM options WHERE question_id = $1 ORDER BY id',
          [q.id]
        );
        return { ...q, options: opts.rows };
      })
    );

    res.json({ quiz: quiz.rows[0], questions: withOptions });
  } catch (err) {
    console.log('Start quiz error:', err.message);
    res.status(500).json({ error: 'Could not start quiz' });
  }
});

module.exports = router;