import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { ClientsPage } from './pages/ClientsPage';
import { UsersPage } from './pages/UsersPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/LoadingSpinner';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {user && <Navbar />}
        <Box sx={{ flexGrow: 1, p: user ? 3 : 0 }}>
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
              path="/jobs/:id" 
              element={
                <ProtectedRoute>
                  <JobDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
