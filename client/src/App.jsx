// src/App.jsx
// Main application component with React Router setup
// Handles protected routes based on user role

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests';
import AdminAllocations from './pages/admin/AdminAllocations';
import AdminTransactions from './pages/admin/AdminTransactions';

// Student Pages
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentApply from './pages/student/StudentApply';
import StudentRequests from './pages/student/StudentRequests';
import StudentTransactions from './pages/student/StudentTransactions';

// Donor Pages
import DonorLayout from './pages/donor/DonorLayout';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorBrowse from './pages/donor/DonorBrowse';
import DonorDonations from './pages/donor/DonorDonations';

// Loading spinner while checking auth
const LoadingScreen = () => (
  <div className="full-page-loader">
    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
    <p className="text-muted">Loading EduChain...</p>
  </div>
);

// Protected Route - redirects to login if not authenticated
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'student' ? '/student' : '/donor';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Auto-redirect logged-in users away from public pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'student' ? '/student' : '/donor';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="allocations" element={<AdminAllocations />} />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="apply" element={<StudentApply />} />
        <Route path="requests" element={<StudentRequests />} />
        <Route path="transactions" element={<StudentTransactions />} />
      </Route>

      {/* Donor Routes */}
      <Route path="/donor" element={<ProtectedRoute allowedRoles={['donor']}><DonorLayout /></ProtectedRoute>}>
        <Route index element={<DonorDashboard />} />
        <Route path="browse" element={<DonorBrowse />} />
        <Route path="donations" element={<DonorDonations />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

