// src/services/api.js
// Axios instance with JWT token auto-attachment
// All API calls go through this

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('educhain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('educhain_token');
      localStorage.removeItem('educhain_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH APIs =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateWallet: (walletAddress) => api.put('/auth/wallet', { walletAddress }),
};

// ===== FUNDING REQUEST APIs =====
export const fundingAPI = {
  create: (formData) => api.post('/funding-requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/funding-requests', { params }),
  getById: (id) => api.get(`/funding-requests/${id}`),
  review: (id, data) => api.put(`/funding-requests/${id}/review`, data),
};

// ===== DONATION APIs =====
export const donationAPI = {
  record: (data) => api.post('/donations', data),
  getAll: () => api.get('/donations'),
};

// ===== ALLOCATION APIs =====
export const allocationAPI = {
  allocate: (data) => api.post('/allocations', data),
  getAll: () => api.get('/allocations'),
};

// ===== ADMIN APIs =====
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getTransactions: () => api.get('/admin/transactions'),
};

export default api;

