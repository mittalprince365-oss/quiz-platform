import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import AdminDashboard from './AdminDashboard'
import AdminUsers from './AdminUsers'
import AdminQuizzes from './AdminQuizzes'
import AdminQuestions from './AdminQuestions'
import StudentQuizzes from './StudentQuizzes'
import QuizDetails from './QuizDetails'
import QuizAttempt from './QuizAttempt'
import Result from './Result'
import AttemptHistory from './AttemptHistory'
import AttemptReview from './AttemptReview'

function StudentHome() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/login" />
  if (user.role === 'ADMIN') return <Navigate to="/admin" />
  return <StudentQuizzes />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/quizzes" element={<AdminQuizzes />} />
        <Route path="/admin/quizzes/:quizId/questions" element={<AdminQuestions />} />
        <Route path="/quiz/:id" element={<QuizDetails />} />
        <Route path="/quiz/:id/attempt" element={<QuizAttempt />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<AttemptHistory />} />
        <Route path="/review/:id" element={<AttemptReview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App