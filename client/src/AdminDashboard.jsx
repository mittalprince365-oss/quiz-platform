import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts'
import api from './api'
import Navbar from './Navbar'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/analytics'),
    ])
      .then(([s, a]) => {
        setStats(s.data)
        setAnalytics(a.data)
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <div className="min-h-screen bg-slate-900 text-slate-400 p-8">Loading...</div>

  const cards = [
    { label: 'Students', value: stats.totalStudents, color: 'text-blue-400' },
    { label: 'Quizzes', value: stats.totalQuizzes, color: 'text-purple-400' },
    { label: 'Published', value: stats.publishedQuizzes, color: 'text-green-400' },
    { label: 'Questions', value: stats.totalQuestions, color: 'text-yellow-400' },
    { label: 'Attempts', value: stats.totalAttempts, color: 'text-pink-400' },
    { label: 'Avg Score', value: `${stats.averageScore}%`, color: 'text-cyan-400' },
  ]

  const pieData = [
    { name: 'Passed', value: parseInt(analytics.passFail.passed) || 0 },
    { name: 'Failed', value: parseInt(analytics.passFail.failed) || 0 },
  ]
  const COLORS = ['#22c55e', '#ef4444']

  const hasAttempts = stats.totalAttempts > 0

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {cards.map((c, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-slate-400 text-xs mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {!hasAttempts ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No attempt data yet for charts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PASS vs FAIL PIE */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-4">Pass vs Fail</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* POPULAR QUIZZES BAR */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-4">Most Attempted Quizzes</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.popular} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                  <YAxis type="category" dataKey="title" stroke="#94a3b8" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="attempts" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ATTEMPTS OVER TIME LINE */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 md:col-span-2">
              <h2 className="text-white font-semibold mb-4">Attempts (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.overTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard