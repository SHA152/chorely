import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import './App.css';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/auth/AuthLayout';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';

// Page Components (using index file imports)
import Dashboard from './pages/dashboard';
import { 
  HomeList, 
  CreateHome, 
  HomeDetail, 
  HomeJoinRequests 
} from './pages/homes';
import { 
  TaskList, 
  CreateTask, 
  TaskDetails, 
  EditTask 
} from './pages/tasks';
import Templates from './pages/templates/Templates'; // ✔️ correct default import
import Profile from './pages/profile';
import NotificationList from './pages/notifications';
import { 
  Leaderboard, 
  AchievementsList, 
  UserStats 
} from './pages/leaderboard';

// Loading Component
const LoadingScreen = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Welcome component for the landing page
const Welcome = () => (
  <Box 
    sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4a6da7',
      color: 'white'
    }}
  >
    <Typography variant="h2" component="h1" gutterBottom>
      Chorely
    </Typography>
    <Typography variant="h5" gutterBottom>
      Turn chores into a fun competition!
    </Typography>
    <Navigate to="/login" />
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicRoute>
                <Welcome />
              </PublicRoute>
            } />
            
            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <AuthLayout>
                  <LoginForm />
                </AuthLayout>
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <AuthLayout>
                  <RegisterForm />
                </AuthLayout>
              </PublicRoute>
            } />
            
            <Route path="/forgot-password" element={
              <PublicRoute>
                <AuthLayout>
                  <ForgotPasswordForm />
                </AuthLayout>
              </PublicRoute>
            } />
            
            <Route path="/reset-password/:token" element={
              <PublicRoute>
                <AuthLayout>
                  <ResetPasswordForm />
                </AuthLayout>
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Homes Routes */}
            <Route path="/homes" element={
              <ProtectedRoute>
                <MainLayout>
                  <HomeList />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/homes/create" element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateHome />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/homes/:homeId" element={
              <ProtectedRoute>
                <MainLayout>
                  <HomeDetail />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/home-requests" element={
              <ProtectedRoute>
                <MainLayout>
                  <HomeJoinRequests />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Tasks Routes */}
            <Route path="/dashboard/tasks" element={
              <ProtectedRoute>
                <MainLayout>
                  <TaskList />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks/create" element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateTask />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks/:taskId" element={
              <ProtectedRoute>
                <MainLayout>
                  <TaskDetails />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks/:taskId/edit" element={
              <ProtectedRoute>
                <MainLayout>
                  <EditTask />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Templates Routes */}
            <Route path="/templates" element={
              <ProtectedRoute>
                <MainLayout>
                  <Templates />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Additional Routes */}
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Leaderboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationList />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Fallback - Redirect to Dashboard if logged in, otherwise Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;