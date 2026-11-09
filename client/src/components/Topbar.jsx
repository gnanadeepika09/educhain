// src/components/Topbar.jsx
// Top navigation bar shown inside dashboard pages

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-title">
        <i className="bi bi-mortarboard me-2" style={{ color: '#4f46e5' }}></i>
        {title}
      </div>
      <div className="d-flex align-items-center gap-3">
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Welcome, <strong>{user?.name}</strong>
        </span>
        <span
          className={`badge ${
            user?.role === 'admin' ? 'bg-danger' : user?.role === 'student' ? 'bg-primary' : 'bg-success'
          }`}
        >
          {user?.role?.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default Topbar;

