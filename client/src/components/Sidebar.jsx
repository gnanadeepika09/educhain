// src/components/Sidebar.jsx
// Sidebar navigation component - shows different menu items based on user role

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin, isStudent, isDonor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get first letter of name for avatar
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  // Role-specific nav items
  const adminNavItems = [
    { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/users', icon: 'bi-people', label: 'Users' },
    { to: '/admin/requests', icon: 'bi-file-earmark-text', label: 'Funding Requests' },
    { to: '/admin/allocations', icon: 'bi-send-check', label: 'Fund Allocations' },
    { to: '/admin/transactions', icon: 'bi-link-45deg', label: 'Blockchain Txns' },
  ];

  const studentNavItems = [
    { to: '/student', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/student/apply', icon: 'bi-plus-circle', label: 'Apply for Funds' },
    { to: '/student/requests', icon: 'bi-file-earmark-text', label: 'My Requests' },
    { to: '/student/transactions', icon: 'bi-clock-history', label: 'Transaction History' },
  ];

  const donorNavItems = [
    { to: '/donor', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/donor/browse', icon: 'bi-search', label: 'Browse Requests' },
    { to: '/donor/donations', icon: 'bi-heart', label: 'My Donations' },
  ];

  const navItems = isAdmin ? adminNavItems : isStudent ? studentNavItems : donorNavItems;

  const roleBadgeColor = isAdmin ? 'danger' : isStudent ? 'primary' : 'success';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <h4>
          <i className="bi bi-mortarboard-fill brand-icon"></i>
          EduChain
        </h4>
        <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
          Blockchain Education Fund
        </small>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/student' || item.to === '/donor'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{avatarLetter}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <span className={`badge bg-${roleBadgeColor}`} style={{ fontSize: '0.65rem' }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            style={{ color: 'rgba(255,255,255,0.6)', padding: '0.25rem 0.5rem' }}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

