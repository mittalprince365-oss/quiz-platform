import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from './api'
import Navbar from './Navbar'

function QuizDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/api/student/quizzes/${id}`)
      .then((res) => setQuiz(res.data))
      .catch(() => setError('Quiz not found or not available'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <p className="text-slate-400 p-8">Loading...</p>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="p-8 max-w-2xl mx-auto">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 text-sm mt-3"
          >
            ← Back to quizzes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white text-sm mb-4"
        >
          ← Back to quizzes
        </button>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
          <p className="text-slate-400 mb-6">{quiz.description || 'No description'}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Info label="Category" value={quiz.category} />
            <Info label="Difficulty" value={quiz.difficulty} />
            <Info label="Questions" value={quiz.question_count} />
            <Info label="Duration" value={`${quiz.duration} minutes`} />
            <Info label="Passing Score" value={`${quiz.passing_score}%`} />
            <Info label="Max Attempts" value={quiz.max_attempts} />
          </div>

          <button
            onClick={() => navigate(`/quiz/${id}/attempt`)}
            disabled={quiz.question_count === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium disabled:opacity-50"
          >
            {quiz.question_count === 0 ? 'No questions yet' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-900 rounded p-3">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  )
}

export default QuizDetails