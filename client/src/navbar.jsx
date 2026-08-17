import { Link, useLocation, useNavigate } from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const linkClass = (path) =>
    location.pathname === path
      ? 'bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium'
      : 'text-slate-300 hover:text-white px-4 py-2 rounded text-sm font-medium'

  const isAdmin = user?.role === 'ADMIN'

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold text-lg">📝 Quiz Platform</span>
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <Link to="/admin" className={linkClass('/admin')}>
                  Dashboard
                </Link>
                <Link to="/admin/users" className={linkClass('/admin/users')}>
                  Users
                </Link>
                <Link to="/admin/quizzes" className={linkClass('/admin/quizzes')}>
                  Quizzes
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={linkClass('/')}>
                  Quizzes
                </Link>
                <Link to="/history" className={linkClass('/history')}>
                  My Attempts
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">
            {user?.name}{' '}
            <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs ml-1">
              {user?.role}
            </span>
          </span>
          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar