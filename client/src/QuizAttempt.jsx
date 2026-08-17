import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from './api'

function QuizAttempt() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: optionId }
  const [timeLeft, setTimeLeft] = useState(null) // seconds
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const submittedRef = useRef(false)

  // quiz load karo
  useEffect(() => {
    api
      .get(`/api/student/quizzes/${id}/start`)
      .then((res) => {
        setQuiz(res.data.quiz)
        setQuestions(res.data.questions)
        setTimeLeft(res.data.quiz.duration * 60) // minutes -> seconds
      })
      .catch(() => setError('Could not start quiz'))
      .finally(() => setLoading(false))
  }, [id])

  // TIMER
  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmit(true) // time up -> auto submit
      return
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  const selectAnswer = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  const handleSubmit = async (auto = false) => {
    if (submittedRef.current) return
    if (!auto && !confirm('Submit the quiz?')) return
    submittedRef.current = true

    const timeTaken = quiz.duration * 60 - (timeLeft || 0) // seconds lagaaye

    try {
      const res = await api.post(`/api/student/quizzes/${id}/submit`, {
        answers,
        time_taken: timeTaken,
      })
      // result page pe bhejo, data saath le jao
      navigate('/result', { state: res.data })
    } catch (err) {
      alert('Could not submit quiz. Please try again.')
      submittedRef.current = false
    }
  }
  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-400 p-8">Loading quiz...</div>
  if (error) return <div className="min-h-screen bg-slate-900 text-red-400 p-8">{error}</div>

  const q = questions[current]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* HEADER with timer */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex justify-between items-center sticky top-0">
        <h1 className="font-bold">{quiz.title}</h1>
        <div className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* QUESTION NAVIGATOR */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((question, i) => (
            <button
              key={question.id}
              onClick={() => setCurrent(i)}
              className={`w-9 h-9 rounded text-sm font-medium ${
                i === current
                  ? 'bg-blue-600 text-white'
                  : answers[question.id]
                  ? 'bg-green-800 text-green-200'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* CURRENT QUESTION */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <p className="text-slate-400 text-sm mb-2">
            Question {current + 1} of {questions.length}
          </p>
          <p className="text-lg mb-5">{q.question_text}</p>

          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectAnswer(q.id, opt.id)}
                className={`w-full text-left px-4 py-3 rounded border ${
                  answers[q.id] === opt.id
                    ? 'bg-blue-900/40 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {opt.option_text}
              </button>
            ))}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded text-sm disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-slate-400 text-sm">
            {answeredCount} / {questions.length} answered
          </span>

          {current === questions.length - 1 ? (
            <button
              onClick={() => handleSubmit(false)}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-sm font-medium"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-sm"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizAttempt