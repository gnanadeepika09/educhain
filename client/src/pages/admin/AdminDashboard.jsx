// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import { adminAPI } from '../../services/api';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="stat-card">
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '...'}</div>
      </div>
      <div className="stat-icon" style={{ background: bg, color }}>
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.stats);
      } catch {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Topbar title="Admin Dashboard" />
      <div className="page-content">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : stats && (
          <>
            {/* User Stats */}
            <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              <i className="bi bi-people me-2"></i>Users Overview
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-mortarboard" label="Total Students" value={stats.users.totalStudents} color="#4f46e5" bg="#ede9fe" />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-heart" label="Total Donors" value={stats.users.totalDonors} color="#06b6d4" bg="#cffafe" />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-file-earmark-text" label="Total Requests" value={stats.requests.total} color="#8b5cf6" bg="#ede9fe" />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-clock" label="Pending Review" value={stats.requests.pending} color="#f59e0b" bg="#fef3c7" />
              </div>
            </div>

            {/* Financial Stats */}
            <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              <i className="bi bi-currency-bitcoin me-2"></i>Financial Overview (ETH)
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-arrow-down-circle" label="Total Donations" value={`${stats.finance.totalDonationsETH} ETH`} color="#10b981" bg="#d1fae5" />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-arrow-up-circle" label="Total Allocated" value={`${stats.finance.totalAllocatedETH} ETH`} color="#f97316" bg="#ffedd5" />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-wallet2" label="Available Funds" value={`${stats.finance.availableFundsETH} ETH`} color="#4f46e5" bg="#ede9fe" />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard icon="bi-send-check" label="Donation Count" value={stats.finance.totalDonationCount} color="#06b6d4" bg="#cffafe" />
              </div>
            </div>

            {/* Request Status Summary */}
            <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              <i className="bi bi-bar-chart me-2"></i>Request Status Summary
            </h6>
            <div className="row g-3">
              {[
                { label: 'Pending', value: stats.requests.pending, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Approved', value: stats.requests.approved, color: '#10b981', bg: '#d1fae5' },
                { label: 'Rejected', value: stats.requests.rejected, color: '#ef4444', bg: '#fee2e2' },
                { label: 'Completed', value: stats.requests.completed, color: '#3b82f6', bg: '#dbeafe' },
              ].map((s) => (
                <div key={s.label} className="col-sm-6 col-lg-3">
                  <div className="stat-card">
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>{s.label} Requests</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ height: '4px', background: s.bg, borderRadius: '2px', marginTop: '0.75rem' }}>
                      <div style={{ height: '100%', width: stats.requests.total > 0 ? `${(s.value / stats.requests.total) * 100}%` : '0%', background: s.color, borderRadius: '2px', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;

