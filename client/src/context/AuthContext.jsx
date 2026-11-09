// src/context/AuthContext.jsx
// Global authentication state management using React Context
// All child components can access user info and auth functions

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Check saved token on startup

  // On app load, check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('educhain_token');
      const savedUser = localStorage.getItem('educhain_user');

      if (token && savedUser) {
        try {
          // Verify token is still valid by calling /me
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch {
          // Token invalid or expired - clear storage
          localStorage.removeItem('educhain_token');
          localStorage.removeItem('educhain_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function - saves token and user to state and localStorage
  const login = (token, userData) => {
    localStorage.setItem('educhain_token', token);
    localStorage.setItem('educhain_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout - clear everything
  const logout = () => {
    localStorage.removeItem('educhain_token');
    localStorage.removeItem('educhain_user');
    setUser(null);
  };

  // Update user data in state (e.g., after wallet connection)
  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('educhain_user', JSON.stringify(updated));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isDonor: user?.role === 'donor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

