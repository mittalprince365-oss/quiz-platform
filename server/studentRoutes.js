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
// ===== SUBMIT QUIZ (server calculates score) =====
router.post('/quizzes/:id/submit', async (req, res) => {
  const quizId = req.params.id;
  const userId = req.user.id;
  const { answers, time_taken } = req.body; // answers = { questionId: optionId }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // quiz laao
    const quizR = await client.query(
      "SELECT * FROM quizzes WHERE id = $1 AND status = 'Published'",
      [quizId]
    );
    if (quizR.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quiz not available' });
    }
    const quiz = quizR.rows[0];

    // saare questions + unke correct options laao (SERVER ke paas sahi jawab)
    const questionsR = await client.query(
      'SELECT id, marks FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    const questions = questionsR.rows;

    let score = 0;
    let totalMarks = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const answerRows = [];

    // HAR question ka SERVER pe check
    for (const q of questions) {
      totalMarks += q.marks;
      const selectedOptionId = answers ? answers[q.id] : null;

      if (!selectedOptionId) {
        unanswered++;
        answerRows.push({ question_id: q.id, selected_option_id: null, is_correct: false });
        continue;
      }

      // ye option sahi hai kya? (database se check, student ke bharose nahi)
      const optR = await client.query(
        'SELECT is_correct FROM options WHERE id = $1 AND question_id = $2',
        [selectedOptionId, q.id]
      );
      const isCorrect = optR.rows.length > 0 && optR.rows[0].is_correct;

      if (isCorrect) {
        correct++;
        score += q.marks;
      } else {
        incorrect++;
      }
      answerRows.push({ question_id: q.id, selected_option_id: selectedOptionId, is_correct: isCorrect });
    }

    const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(2) : 0;
    const status = percentage >= quiz.passing_score ? 'PASSED' : 'FAILED';

    // attempt save karo
    const attemptR = await client.query(
      `INSERT INTO attempts
        (quiz_id, user_id, score, total_marks, percentage, correct_answers,
         incorrect_answers, unanswered, time_taken, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [quizId, userId, score, totalMarks, percentage, correct, incorrect, unanswered, time_taken || 0, status]
    );
    const attemptId = attemptR.rows[0].id;

    // har answer save karo
    for (const a of answerRows) {
      await client.query(
        `INSERT INTO answers (attempt_id, question_id, selected_option_id, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, a.question_id, a.selected_option_id, a.is_correct]
      );
    }

    await client.query('COMMIT');

    res.json({
      attempt_id: attemptId,
      score,
      total_marks: totalMarks,
      percentage: parseFloat(percentage),
      correct_answers: correct,
      incorrect_answers: incorrect,
      unanswered,
      status,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.log('Submit error:', err.message);
    res.status(500).json({ error: 'Could not submit quiz' });
  } finally {
    client.release();
  }
});
module.exports = router;