import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state

  // direct URL se aaya (data nahi) toh wapas bhejo
  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="p-8 max-w-lg mx-auto text-center">
          <p className="text-slate-400">No result to show.</p>
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

  const passed = result.status === 'PASSED'

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-lg mx-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-3">{passed ? '🎉' : '😔'}</div>
          <h1
            className={`text-2xl font-bold mb-1 ${
              passed ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {passed ? 'PASSED' : 'FAILED'}
          </h1>
          <p className="text-5xl font-bold text-white my-4">{result.percentage}%</p>

          <div className="grid grid-cols-3 gap-3 my-6">
            <Stat label="Correct" value={result.correct_answers} color="text-green-400" />
            <Stat label="Incorrect" value={result.incorrect_answers} color="text-red-400" />
            <Stat label="Unanswered" value={result.unanswered} color="text-slate-400" />
          </div>

          <p className="text-slate-400 text-sm mb-6">
            Score: {result.score} / {result.total_marks} marks
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-slate-900 rounded p-3">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-slate-500 text-xs mt-1">{label}</p>
    </div>
  )
}

export default Result