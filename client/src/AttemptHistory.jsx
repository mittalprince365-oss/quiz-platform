import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'
import Navbar from './Navbar'

function AttemptHistory() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/api/student/my-attempts')
      .then((res) => setAttempts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Attempts</h1>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : attempts.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No attempts yet. Take a quiz!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/review/${a.id}`)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:border-blue-600"
              >
                <div>
                  <h3 className="text-white font-medium">{a.quiz_title}</h3>
                  <p className="text-slate-400 text-sm">
                    {a.category} · {formatDate(a.completed_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{a.percentage}%</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      a.status === 'PASSED'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttemptHistory