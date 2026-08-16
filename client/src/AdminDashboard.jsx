import { useState, useEffect } from 'react'
import api from './api'
import Navbar from './Navbar'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: 'Total Students', value: stats.totalStudents, color: 'text-blue-400' },
        { label: 'Total Admins', value: stats.totalAdmins, color: 'text-purple-400' },
        { label: 'Active Users', value: stats.activeUsers, color: 'text-green-400' },
        { label: 'Total Quizzes', value: stats.totalQuizzes, color: 'text-yellow-400' },
        { label: 'Total Attempts', value: stats.totalAttempts, color: 'text-pink-400' },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

        {loading ? (
          <p className="text-slate-400">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((c, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6"
              >
                <p className={`text-4xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-slate-400 text-sm mt-2">{c.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard