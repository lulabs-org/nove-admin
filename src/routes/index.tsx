import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

/**
 * Application route configuration
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for future pages */}
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <div>Students Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <div>Courses Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div>Settings Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
