import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import SubmissionsPage from './pages/SubmissionsPage'
import ContestPage from './pages/ContestPage'
import RiddlePage from './pages/RiddlePage'
import ProblemPage from './pages/ProblemPage'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTeams from './pages/admin/AdminTeams'
import AdminRiddles from './pages/admin/AdminRiddles'
import AdminProblems from './pages/admin/AdminProblems'
import AdminSubmissions from './pages/admin/AdminSubmissions'
import AdminLeaderboard from './pages/admin/AdminLeaderboard'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path='/' element={<Navigate to="/login" replace />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/leaderboard' element={<LeaderboardPage />} />
          <Route path='/submissions' element={<SubmissionsPage />} />
          <Route path='/contest' element={<ContestPage />} />
          <Route path='/riddle/:id' element={<RiddlePage />} />
          <Route path='/problem/:id' element={<ProblemPage />} />

          {/* Admin Routes */}
          <Route path='/admin' element={<Navigate to="/admin/login" replace />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/teams' element={<AdminTeams />} />
          <Route path='/admin/riddles' element={<AdminRiddles />} />          <Route path='/admin/problems' element={<AdminProblems />} />          <Route path='/admin/submissions' element={<AdminSubmissions />} />
          <Route path='/admin/leaderboard' element={<AdminLeaderboard />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
