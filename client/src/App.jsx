import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path='/' element={<Navigate to="/login" replace />} />
          <Route path='/login' element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path='/register' element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route path='/dashboard' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path='/leaderboard' element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path='/submissions' element={<ProtectedRoute><SubmissionsPage /></ProtectedRoute>} />
          <Route path='/contest' element={<ProtectedRoute><ContestPage /></ProtectedRoute>} />
          <Route path='/riddle/:id' element={<ProtectedRoute><RiddlePage /></ProtectedRoute>} />
          <Route path='/problem/:id' element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path='/admin' element={<Navigate to="/admin/login" replace />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/teams' element={<AdminTeams />} />
          <Route path='/admin/riddles' element={<AdminRiddles />} />          <Route path='/admin/problems' element={<AdminProblems />} />
          <Route path='/admin/submissions' element={<AdminSubmissions />} />
          <Route path='/admin/leaderboard' element={<AdminLeaderboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
