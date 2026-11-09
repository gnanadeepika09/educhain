// src/pages/student/StudentRequests.jsx
import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { fundingAPI } from '../../services/api';

const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fundingAPI.getAll();
        setRequests(res.data.fundingRequests);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <Topbar title="My Funding Requests" />
      <div className="page-content">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem' }}>📭</div>
            <h5 className="text-muted">No requests yet</h5>
            <p className="text-muted">Submit your first funding request to get started.</p>
          </div>
        ) : (
          <div className="row g-4">
            {requests.map((req) => {
              const pct = req.requiredAmount > 0 ? Math.min(100, Math.round(((req.amountRaised || 0) / req.requiredAmount) * 100)) : 0;
              return (
                <div key={req._id} className="col-lg-6">
                  <div className="request-card">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-semibold mb-0">{req.college}</h6>
                        <small className="text-muted">{req.course} · {req.year}</small>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-4 text-center p-2 rounded" style={{ background: '#f8fafc' }}>
                        <div className="fw-bold text-primary">{req.requiredAmount}</div>
                        <small className="text-muted">Required ETH</small>
                      </div>
                      <div className="col-4 text-center p-2 rounded" style={{ background: '#f8fafc' }}>
                        <div className="fw-bold text-success">{(req.amountRaised || 0).toFixed(4)}</div>
                        <small className="text-muted">Raised ETH</small>
                      </div>
                      <div className="col-4 text-center p-2 rounded" style={{ background: '#f8fafc' }}>
                        <div className="fw-bold text-info">{(req.amountAllocated || 0).toFixed(4)}</div>
                        <small className="text-muted">Allocated ETH</small>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Funding Progress</small>
                        <small className="fw-semibold">{pct}%</small>
                      </div>
                      <div className="progress">
                        <div
                          className={`progress-bar ${pct >= 100 ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${pct}%`, transition: 'width 0.5s' }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-muted small mb-2" style={{ lineHeight: 1.5 }}>
                      {req.reason.length > 120 ? req.reason.slice(0, 120) + '...' : req.reason}
                    </p>

                    {req.adminNote && (
                      <div className="p-2 rounded mt-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                        <small><strong>Admin Note:</strong> {req.adminNote}</small>
                      </div>
                    )}

                    <small className="text-muted d-block mt-2">
                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentRequests;

