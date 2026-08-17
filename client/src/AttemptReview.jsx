import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from './api'
import Navbar from './Navbar'

function AttemptReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/api/student/attempts/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return <div className="min-h-screen bg-slate-900 text-slate-400 p-8">Loading review...</div>

  if (!data)
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <p className="text-red-400 p-8">Review not found.</p>
      </div>
    )

  const { attempt, review } = data

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/history')}
          className="text-slate-400 hover:text-white text-sm mb-4"
        >
          ← Back to history
        </button>

        {/* SUMMARY */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-6">
          <h1 className="text-xl font-bold text-white mb-1">{attempt.quiz_title}</h1>
          <div className="flex gap-4 text-sm mt-2">
            <span className={attempt.status === 'PASSED' ? 'text-green-400' : 'text-red-400'}>
              {attempt.status} · {attempt.percentage}%
            </span>
            <span className="text-green-400">✓ {attempt.correct_answers}</span>
            <span className="text-red-400">✗ {attempt.incorrect_answers}</span>
            <span className="text-slate-400">— {attempt.unanswered}</span>
          </div>
        </div>

        {/* QUESTION REVIEW */}
        <div className="space-y-4">
          {review.map((q, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <p className="text-white font-medium mb-3">
                Q{i + 1}. {q.question_text}
              </p>

              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isSelected = opt.id === q.selected_option_id
                  const isCorrect = opt.is_correct

                  let style = 'bg-slate-900 border-slate-700 text-slate-300'
                  if (isCorrect) style = 'bg-green-900/40 border-green-600 text-green-200'
                  else if (isSelected) style = 'bg-red-900/40 border-red-600 text-red-200'

                  return (
                    <div key={opt.id} className={`px-4 py-2 rounded border text-sm ${style}`}>
                      {isCorrect && '✓ '}
                      {isSelected && !isCorrect && '✗ '}
                      {opt.option_text}
                      {isSelected && (
                        <span className="text-xs ml-2 opacity-70">(your answer)</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {q.explanation && (
                <p className="text-slate-400 text-sm mt-3">💡 {q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AttemptReview