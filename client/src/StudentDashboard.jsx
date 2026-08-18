import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import api from './api'
import Navbar from './Navbar'

function StudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/student/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <div className="min-h-screen bg-slate-900 text-slate-400 p-8">Loading...</div>

  const stats = data?.stats || {}
  const recent = data?.recent || []

  // bar chart data (recent attempts % )
  const barData = recent.map((r, i) => ({
    name: `#${i + 1}`,
    score: parseFloat(r.percentage),
  }))

  // pie chart data (pass vs fail)
  const pieData = [
    { name: 'Passed', value: parseInt(stats.passed) || 0 },
    { name: 'Failed', value: parseInt(stats.failed) || 0 },
  ]
  const COLORS = ['#22c55e', '#ef4444']

  const cards = [
    { label: 'Total Attempts', value: stats.total_attempts || 0, color: 'text-blue-400' },
    { label: 'Passed', value: stats.passed || 0, color: 'text-green-400' },
    { label: 'Failed', value: stats.failed || 0, color: 'text-red-400' },
    { label: 'Average Score', value: `${stats.average_score || 0}%`, color: 'text-yellow-400' },
    { label: 'Highest Score', value: `${stats.highest_score || 0}%`, color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Dashboard</h1>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map((c, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-slate-400 text-xs mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {(parseInt(stats.total_attempts) || 0) === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No data yet. Take a quiz to see your stats!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BAR CHART - recent scores */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-4">Recent Scores</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* PIE CHART - pass vs fail */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h2 className="text-white font-semibold mb-4">Pass vs Fail</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard