import { useState, useEffect } from 'react'
import api from './api'
import Navbar from './Navbar'

const empty = {
  title: '', description: '', category: 'JavaScript',
  difficulty: 'Beginner', duration: 10, passing_score: 60,
  max_attempts: 1, status: 'Draft',
}

function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/api/quizzes')
      setQuizzes(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('Title is required')
    try {
      if (editId) {
        await api.put(`/api/quizzes/${editId}`, form)
      } else {
        await api.post('/api/quizzes', form)
      }
      setForm(empty)
      setEditId(null)
      setShowForm(false)
      fetchQuizzes()
    } catch (err) {
      alert('Could not save quiz')
    }
  }

  const startEdit = (quiz) => {
    setForm(quiz)
    setEditId(quiz.id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const deleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return
    await api.delete(`/api/quizzes/${id}`)
    fetchQuizzes()
  }

  const changeStatus = async (quiz, status) => {
    await api.put(`/api/quizzes/${quiz.id}`, { ...quiz, status })
    fetchQuizzes()
  }

  const statusColor = {
    Published: 'bg-green-900 text-green-300',
    Draft: 'bg-slate-700 text-slate-300',
    Unpublished: 'bg-yellow-900 text-yellow-300',
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Quiz Management</h1>
          <button
            onClick={() => {
              setForm(empty)
              setEditId(null)
              setShowForm(!showForm)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            {showForm ? 'Close' : '+ New Quiz'}
          </button>
        </div>

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-white font-semibold mb-4">
              {editId ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="title" value={form.title} onChange={handleChange}
                placeholder="Quiz Title"
                className="bg-slate-700 text-white rounded p-2 text-sm md:col-span-2"
              />
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Description"
                className="bg-slate-700 text-white rounded p-2 text-sm md:col-span-2"
              />
              <input
                name="category" value={form.category} onChange={handleChange}
                placeholder="Category"
                className="bg-slate-700 text-white rounded p-2 text-sm"
              />
              <select
                name="difficulty" value={form.difficulty} onChange={handleChange}
                className="bg-slate-700 text-white rounded p-2 text-sm"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <div>
                <label className="text-slate-400 text-xs">Duration (minutes)</label>
                <input
                  name="duration" type="number" value={form.duration} onChange={handleChange}
                  className="bg-slate-700 text-white rounded p-2 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs">Passing Score (%)</label>
                <input
                  name="passing_score" type="number" value={form.passing_score} onChange={handleChange}
                  className="bg-slate-700 text-white rounded p-2 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs">Max Attempts</label>
                <input
                  name="max_attempts" type="number" value={form.max_attempts} onChange={handleChange}
                  className="bg-slate-700 text-white rounded p-2 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs">Status</label>
                <select
                  name="status" value={form.status} onChange={handleChange}
                  className="bg-slate-700 text-white rounded p-2 text-sm w-full"
                >
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Unpublished</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm"
            >
              {editId ? 'Update Quiz' : 'Create Quiz'}
            </button>
          </div>
        )}

        {/* QUIZZES LIST */}
        {quizzes.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No quizzes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{q.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${statusColor[q.status]}`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {q.category} · {q.difficulty} · {q.duration} min · Pass {q.passing_score}% · Max {q.max_attempts} attempts
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {q.status !== 'Published' && (
                      <button
                        onClick={() => changeStatus(q, 'Published')}
                        className="bg-green-900 hover:bg-green-800 text-green-200 px-3 py-1 rounded text-xs"
                      >
                        Publish
                      </button>
                    )}
                    {q.status === 'Published' && (
                      <button
                        onClick={() => changeStatus(q, 'Unpublished')}
                        className="bg-yellow-900 hover:bg-yellow-800 text-yellow-200 px-3 py-1 rounded text-xs"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(q)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteQuiz(q.id)}
                      className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminQuizzes