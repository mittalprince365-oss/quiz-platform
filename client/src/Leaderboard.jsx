import { useState, useEffect } from 'react'
import api from './api'
import Navbar from './Navbar'

function Leaderboard() {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/student/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .get(`/api/student/leaderboard?category=${category}`)
      .then((res) => setRows(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [category])

  const medal = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : rows.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No rankings yet.</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right px-4 py-3">Avg</th>
                  <th className="text-right px-4 py-3">Best</th>
                  <th className="text-right px-4 py-3">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isMe = currentUser && r.name === currentUser.name
                  return (
                    <tr
                      key={r.rank}
                      className={`border-t border-slate-700 ${
                        isMe ? 'bg-blue-900/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-lg">{medal(r.rank)}</td>
                      <td className="px-4 py-3 text-white">
                        {r.name} {isMe && <span className="text-blue-400 text-xs">(You)</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-yellow-400 font-medium">
                        {r.avg_score}%
                      </td>
                      <td className="px-4 py-3 text-right text-green-400">{r.best_score}%</td>
                      <td className="px-4 py-3 text-right text-slate-400">{r.total_attempts}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard