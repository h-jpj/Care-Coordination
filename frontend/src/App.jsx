import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import JobsPage from './pages/JobsPage'
import WorkersPage from './pages/WorkersPage'
import ClientsPageNew from './pages/ClientsPageNew'
import MonitoringPage from './pages/MonitoringPage'
import CareRecordsPage from './pages/CareRecordsPage'
import IncidentsPage from './pages/IncidentsPage'
import CompliancePage from './pages/CompliancePage'
import EmergencyPage from './pages/EmergencyPage'
import AnalyticsPage from './pages/AnalyticsPage'
import TestPage from './pages/TestPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      {user && <Navigation />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/workers"
        element={
          <ProtectedRoute>
            <WorkersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPageNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <MonitoringPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/care-records"
        element={
          <ProtectedRoute>
            <CareRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <IncidentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <CompliancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency"
        element={
          <ProtectedRoute>
            <EmergencyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/test" element={<TestPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
