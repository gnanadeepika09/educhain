// src/pages/donor/DonorLayout.jsx
// Layout wrapper for all donor pages
// Includes sidebar navigation and main content area

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

function DonorLayout() {
  const donorMenuItems = [
    { name: 'Dashboard', path: '/donor', icon: '📊' },
    { name: 'Browse Students', path: '/donor/browse', icon: '🔍' },
    { name: 'My Donations', path: '/donor/donations', icon: '💰' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar menuItems={donorMenuItems} userRole="donor" />
      <div className="flex-grow-1 d-flex flex-column">
        <Topbar title="Donor Portal" />
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DonorLayout;
