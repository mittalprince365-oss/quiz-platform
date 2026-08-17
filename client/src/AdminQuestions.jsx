import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from './api'
import Navbar from './Navbar'

const emptyOption = () => ({ option_text: '', is_correct: false })

function AdminQuestions() {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [marks, setMarks] = useState(1)
  const [options, setOptions] = useState([emptyOption(), emptyOption(), emptyOption(), emptyOption()])

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/api/questions/quiz/${quizId}`)
      setQuestions(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const setOptionText = (i, text) => {
    const copy = [...options]
    copy[i].option_text = text
    setOptions(copy)
  }

  const setCorrect = (i) => {
    // sirf ek correct (radio jaisa)
    const copy = options.map((o, idx) => ({ ...o, is_correct: idx === i }))
    setOptions(copy)
  }

  const resetForm = () => {
    setQuestionText('')
    setExplanation('')
    setMarks(1)
    setOptions([emptyOption(), emptyOption(), emptyOption(), emptyOption()])
  }

  const handleAdd = async () => {
    if (!questionText.trim()) return alert('Question text required')
    const filled = options.filter((o) => o.option_text.trim())
    if (filled.length < 2) return alert('At least 2 options required')
    if (!options.some((o) => o.is_correct && o.option_text.trim()))
      return alert('Mark the correct option')

    try {
      await api.post(`/api/questions/quiz/${quizId}`, {
        question_text: questionText,
        marks: parseInt(marks),
        explanation,
        options: filled,
      })
      resetForm()
      setShowForm(false)
      fetchQuestions()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not add question')
    }
  }

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    await api.delete(`/api/questions/${id}`)
    fetchQuestions()
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="text-slate-400 hover:text-white text-sm mb-4"
        >
          ← Back to Quizzes
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Questions ({questions.length})
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            {showForm ? 'Close' : '+ Add Question'}
          </button>
        </div>

        {/* ADD FORM */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter the question..."
              className="w-full bg-slate-700 text-white rounded p-3 text-sm mb-3"
            />

            <p className="text-slate-400 text-sm mb-2">
              Options (click the circle to mark the correct answer):
            </p>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setCorrect(i)}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                    opt.is_correct
                      ? 'bg-green-500 border-green-500'
                      : 'border-slate-500'
                  }`}
                  title="Mark correct"
                />
                <input
                  value={opt.option_text}
                  onChange={(e) => setOptionText(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-slate-700 text-white rounded p-2 text-sm"
                />
              </div>
            ))}

            <input
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explanation (shown after quiz)"
              className="w-full bg-slate-700 text-white rounded p-2 text-sm mt-3 mb-3"
            />

            <div className="flex items-center gap-2 mb-3">
              <label className="text-slate-400 text-sm">Marks:</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="bg-slate-700 text-white rounded p-2 text-sm w-20"
              />
            </div>

            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm"
            >
              Add Question
            </button>
          </div>
        )}

        {/* QUESTIONS LIST */}
        {questions.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No questions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-white font-medium">
                    Q{idx + 1}. {q.question_text}
                    <span className="text-slate-500 text-xs ml-2">({q.marks} marks)</span>
                  </p>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-xs flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
                <div className="space-y-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`text-sm px-3 py-2 rounded ${
                        opt.is_correct
                          ? 'bg-green-900/40 text-green-300'
                          : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      {opt.is_correct ? '✓ ' : ''}
                      {opt.option_text}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-slate-400 text-xs mt-2">💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminQuestions