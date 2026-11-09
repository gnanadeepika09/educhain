// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { fundingAPI, donationAPI, allocationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, donRes, allocRes] = await Promise.all([
          fundingAPI.getAll(),
          donationAPI.getAll(),
          allocationAPI.getAll(),
        ]);
        setRequests(reqRes.data.fundingRequests);
        setDonations(donRes.data.donations);
        setAllocations(allocRes.data.allocations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRaised = donations.reduce((s, d) => s + d.amount, 0);
  const totalAllocated = allocations.reduce((s, a) => s + a.amount, 0);
  const latestRequest = requests[0];

  return (
    <>
      <Topbar title="Student Dashboard" />
      <div className="page-content">
        {/* Welcome Banner */}
        <div className="p-4 mb-4 rounded-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
          <h4 className="mb-1">👋 Welcome back, {user?.name}!</h4>
          <p className="mb-3 opacity-75">Track your funding requests and received funds here.</p>
          <Link to="/student/apply" className="btn btn-warning btn-sm fw-semibold">
            <i className="bi bi-plus-circle me-1"></i>Apply for Funding
          </Link>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">My Requests</div>
              <div className="stat-value">{requests.length}</div>
              <div className="stat-icon" style={{ background: '#ede9fe', color: '#4f46e5' }}>
                <i className="bi bi-file-earmark-text"></i>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Total Raised</div>
              <div className="stat-value">{totalRaised.toFixed(4)}</div>
              <div className="stat-label">ETH</div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Total Allocated</div>
              <div className="stat-value">{totalAllocated.toFixed(4)}</div>
              <div className="stat-label">ETH</div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Pending Requests</div>
              <div className="stat-value">{requests.filter((r) => r.status === 'pending').length}</div>
            </div>
          </div>
        </div>

        {/* Latest Request */}
        {latestRequest && (
          <div className="card mb-4">
            <div className="card-header">
              <i className="bi bi-clock me-2"></i>Latest Funding Request
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="mb-1 fw-semibold">{latestRequest.college} — {latestRequest.course}</h6>
                  <small className="text-muted">{latestRequest.year} | Submitted {new Date(latestRequest.createdAt).toLocaleDateString()}</small>
                </div>
                <StatusBadge status={latestRequest.status} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-sm-4">
                  <small className="text-muted d-block">Required</small>
                  <strong>{latestRequest.requiredAmount} ETH</strong>
                </div>
                <div className="col-sm-4">
                  <small className="text-muted d-block">Raised</small>
                  <strong>{(latestRequest.amountRaised || 0).toFixed(4)} ETH</strong>
                </div>
                <div className="col-sm-4">
                  <small className="text-muted d-block">Allocated</small>
                  <strong>{(latestRequest.amountAllocated || 0).toFixed(4)} ETH</strong>
                </div>
              </div>
              {/* Progress bar */}
              <div className="progress mb-1" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${Math.min(100, ((latestRequest.amountRaised || 0) / latestRequest.requiredAmount) * 100)}%` }}
                ></div>
              </div>
              <small className="text-muted">
                {Math.min(100, Math.round(((latestRequest.amountRaised || 0) / latestRequest.requiredAmount) * 100))}% funded
              </small>
              {latestRequest.adminNote && (
                <div className="mt-3 p-2 rounded" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <small><strong>Admin Note:</strong> {latestRequest.adminNote}</small>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="row g-3">
          <div className="col-sm-6">
            <Link to="/student/requests" className="card text-decoration-none" style={{ cursor: 'pointer' }}>
              <div className="card-body d-flex align-items-center gap-3">
                <div style={{ width: 48, height: 48, background: '#ede9fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📋</div>
                <div>
                  <div className="fw-semibold">My Requests</div>
                  <small className="text-muted">View all funding requests</small>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-sm-6">
            <Link to="/student/transactions" className="card text-decoration-none">
              <div className="card-body d-flex align-items-center gap-3">
                <div style={{ width: 48, height: 48, background: '#d1fae5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⛓️</div>
                <div>
                  <div className="fw-semibold">Transaction History</div>
                  <small className="text-muted">Donations & allocations</small>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;

