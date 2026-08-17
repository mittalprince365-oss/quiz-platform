import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'
import Navbar from './Navbar'

function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const res = await api.get(
        `/api/student/quizzes?search=${search}&category=${category}&difficulty=${difficulty}`
      )
      setQuizzes(res.data)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  // search + filter live
  useEffect(() => {
    const timer = setTimeout(fetchQuizzes, 400)
    return () => clearTimeout(timer)
  }, [search, category, difficulty])

  const diffColor = {
    Beginner: 'bg-green-900 text-green-300',
    Intermediate: 'bg-yellow-900 text-yellow-300',
    Advanced: 'bg-red-900 text-red-300',
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Available Quizzes</h1>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 text-sm"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 text-sm"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No quizzes available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-blue-600 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-lg">{q.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${diffColor[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {q.description || 'No description'}
                </p>
                <div className="flex flex-wrap gap-3 text-slate-400 text-xs mb-4">
                  <span>📚 {q.category}</span>
                  <span>❓ {q.question_count} questions</span>
                  <span>⏱️ {q.duration} min</span>
                  <span>✅ Pass {q.passing_score}%</span>
                </div>
                <button
                  onClick={() => navigate(`/quiz/${q.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentQuizzes