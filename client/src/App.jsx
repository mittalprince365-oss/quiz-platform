import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import api from './api'

// abhi ke liye simple home page (Day 4 mein asli dashboard banega)
function Home() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const testAdmin = async () => {
    try {
      const res = await api.get('/api/admin/test')
      alert(res.data.message)
    } catch (err) {
      alert(err.response?.data?.error || 'Error')
    }
  }

  if (!user) return <Navigate to="/login" />

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📝 Quiz Platform</h1>
        <button
          onClick={logout}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>
      <div className="bg-slate-800 rounded-lg p-6">
        <p className="text-lg">
          Welcome, <span className="font-bold">{user.name}</span>! 👋
        </p>
        <p className="text-slate-400 mt-2">Email: {user.email}</p>
        <p className="text-slate-400">
          Role:{' '}
          <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-sm">
            {user.role}
          </span>
        </p>
        <p className="text-slate-400">Status: {user.status}</p>
        <button
          onClick={testAdmin}
          className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm"
        >
          Test Admin Access
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App