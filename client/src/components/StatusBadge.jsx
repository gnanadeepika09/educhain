// src/components/StatusBadge.jsx
// Reusable component to display colored status badges

import React from 'react';

const statusConfig = {
  pending: { className: 'badge-pending', label: '⏳ Pending', icon: 'bi-clock' },
  approved: { className: 'badge-approved', label: '✅ Approved', icon: 'bi-check-circle' },
  rejected: { className: 'badge-rejected', label: '❌ Rejected', icon: 'bi-x-circle' },
  completed: { className: 'badge-completed', label: '🎓 Completed', icon: 'bi-patch-check' },
  confirmed: { className: 'badge-confirmed', label: '✅ Confirmed', icon: 'bi-shield-check' },
  failed: { className: 'badge-rejected', label: '❌ Failed', icon: 'bi-exclamation-circle' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { className: 'bg-secondary', label: status };
  return (
    <span className={`badge ${config.className}`} style={{ fontSize: '0.78rem', padding: '0.4em 0.75em' }}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

