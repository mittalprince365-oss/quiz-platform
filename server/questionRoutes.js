const express = require('express');
const pool = require('./db');
const { requireAuth, requireAdmin } = require('./middleware');

const router = express.Router();

// ===== ADD QUESTION (with options) to a quiz =====
router.post('/quiz/:quizId', requireAuth, requireAdmin, async (req, res) => {
  const { quizId } = req.params;
  const { question_text, marks, explanation, difficulty, options } = req.body;

  // validation
  if (!question_text || !options || options.length < 2) {
    return res.status(400).json({ error: 'Question and at least 2 options required' });
  }
  const hasCorrect = options.some((o) => o.is_correct);
  if (!hasCorrect) {
    return res.status(400).json({ error: 'Mark at least one correct option' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // transaction shuru

    // question daalo
    const qResult = await client.query(
      `INSERT INTO questions (quiz_id, question_text, marks, explanation, difficulty)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [quizId, question_text, marks || 1, explanation || '', difficulty || 'Beginner']
    );
    const question = qResult.rows[0];

    // saare options daalo
    for (const opt of options) {
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct)
         VALUES ($1, $2, $3)`,
        [question.id, opt.option_text, opt.is_correct || false]
      );
    }

    await client.query('COMMIT'); // sab sahi, save karo
    res.status(201).json({ message: 'Question added', question });
  } catch (err) {
    await client.query('ROLLBACK'); // koi error, sab wapas
    console.log('Add question error:', err.message);
    res.status(500).json({ error: 'Could not add question' });
  } finally {
    client.release();
  }
});

// ===== LIST QUESTIONS of a quiz (with options) =====
router.get('/quiz/:quizId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const questions = await pool.query(
      'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY id',
      [req.params.quizId]
    );

    // har question ke options bhi laao
    const withOptions = await Promise.all(
      questions.rows.map(async (q) => {
        const opts = await pool.query(
          'SELECT * FROM options WHERE question_id = $1 ORDER BY id',
          [q.id]
        );
        return { ...q, options: opts.rows };
      })
    );

    res.json(withOptions);
  } catch (err) {
    console.log('List questions error:', err.message);
    res.status(500).json({ error: 'Could not fetch questions' });
  }
});

// ===== DELETE QUESTION =====
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete question' });
  }
});

module.exports = router;