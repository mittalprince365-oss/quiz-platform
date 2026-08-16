import { useState, useEffect } from 'react'
import api from './api'
import Navbar from './Navbar'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async (searchTerm = '') => {
    setLoading(true)
    try {
      const res = await api.get(`/api/admin/users?search=${searchTerm}`)
      setUsers(res.data)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // search live
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await api.patch(`/api/admin/users/${user.id}/status`, { status: newStatus })
      fetchUsers(search)
    } catch (err) {
      alert('Could not update status')
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this student permanently?')) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      fetchUsers(search)
    } catch (err) {
      alert('Could not delete')
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">User Management</h1>

        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 text-sm mb-4"
        />

        {loading ? (
          <p className="text-slate-400">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No students found</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-700">
                    <td className="px-4 py-3 text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          u.status === 'ACTIVE'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStatus(u)}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs"
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers