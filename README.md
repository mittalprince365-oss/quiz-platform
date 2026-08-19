# 📝 Quiz Management & Online Assessment Platform

A full-stack web application for creating and taking online quizzes, with separate Admin and Student roles. Admins create quizzes and questions; students attempt them with a live timer, get auto-scored results, and track their performance.
🌍 **Live Demo:** https://quiz-platform-taupe-eta.vercel.app
🔗 **API:** https://quiz-platform-api-7a4i.onrender.com


## Features

### Admin
- Secure JWT authentication with role-based access
- Dashboard with platform statistics and analytics charts
- User management (view, search, activate/deactivate, delete students)
- Full quiz CRUD with publish/unpublish
- Question & options management (mark correct answer, explanations)
- Analytics: pass/fail ratio, most attempted quizzes, attempts over time

### Student
- Register / login / logout
- Browse published quizzes with search and filters
- Attempt quizzes with a countdown timer and auto-submit
- Question navigation and answer selection
- Instant server-scored results (pass/fail, percentage)
- Answer review (correct vs your answer, explanations)
- Attempt history and personal performance dashboard with charts
- Leaderboard with rankings

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT + bcrypt password hashing |

## Security Highlights
- Passwords hashed with bcrypt (never stored in plain text)
- JWT-based auth with role checks on both frontend (route guards) and backend (middleware)
- Quiz scoring done entirely on the server so students cannot manipulate results
- Correct answers are never sent to the client during an attempt

## How to Run Locally

1. Install dependencies:
                        cd client && npm install
                         cd ../server && npm install
2. Create `server/.env` with `DATABASE_URL` and `JWT_SECRET`
3. Create `client/.env` with `VITE_API_URL` (backend URL)
4. Start both servers:
                        cd client && npm run dev
                          cd server && npx nodemon index.js                     

## Database Schema
users → attempts → quizzes → questions → options, with an answers table linking attempts to questions.
