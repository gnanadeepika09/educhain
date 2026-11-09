// src/pages/admin/AdminRequests.jsx
// Admin views and approves/rejects student funding requests

import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { fundingAPI } from '../../services/api';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [reviewing, setReviewing] = useState(null); // request being reviewed
  const [reviewForm, setReviewForm] = useState({ status: 'approved', adminNote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fundingAPI.getAll(filterStatus ? { status: filterStatus } : {});
      setRequests(res.data.fundingRequests);
    } catch {
      setMessage('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filterStatus]);

  const handleReview = async () => {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      await fundingAPI.review(reviewing._id, reviewForm);
      setMessage(`Request ${reviewForm.status} successfully!`);
      setReviewing(null);
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Review failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Funding Requests" />
      <div className="page-content">
        {message && (
          <div className={`alert ${message.includes('failed') ? 'alert-danger' : 'alert-success'} alert-dismissible`}>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}

        {/* Filter */}
        <div className="card mb-4">
          <div className="card-body d-flex gap-2 flex-wrap">
            {['', 'pending', 'approved', 'rejected', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className="bi bi-file-earmark-text me-2"></i>Funding Requests ({requests.length})</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College / Course</th>
                  <th>Year</th>
                  <th>Required (ETH)</th>
                  <th>Raised (ETH)</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No funding requests found.</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <div className="fw-semibold">{req.studentName}</div>
                        <small className="text-muted">{req.studentId?.email}</small>
                      </td>
                      <td>
                        <div>{req.college}</div>
                        <small className="text-muted">{req.course}</small>
                      </td>
                      <td>{req.year}</td>
                      <td className="fw-semibold">{req.requiredAmount}</td>
                      <td>{(req.amountRaised || 0).toFixed(4)}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td><small>{new Date(req.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        {req.status === 'pending' ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => { setReviewing(req); setReviewForm({ status: 'approved', adminNote: '' }); }}
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => { setReviewing(req); setReviewForm({ status: req.status, adminNote: req.adminNote || '' }); }}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewing && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: '12px' }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {reviewing.status === 'pending' ? '📋 Review Request' : '📋 Request Details'}
                </h5>
                <button className="btn-close" onClick={() => setReviewing(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Student Name</label>
                    <div className="fw-semibold">{reviewing.studentName}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">College</label>
                    <div className="fw-semibold">{reviewing.college}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Course</label>
                    <div>{reviewing.course}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Year</label>
                    <div>{reviewing.year}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Required Amount</label>
                    <div className="fw-bold text-primary">{reviewing.requiredAmount} ETH</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small">Reason for Funding</label>
                    <div className="p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      {reviewing.reason}
                    </div>
                  </div>
                  {reviewing.documents?.length > 0 && (
                    <div className="col-12">
                      <label className="form-label text-muted small">Documents</label>
                      <div>
                        {reviewing.documents.map((doc, i) => (
                          <span key={i} className="badge bg-light text-dark me-1 border">
                            <i className="bi bi-paperclip me-1"></i>{doc.originalName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {reviewing.status === 'pending' && (
                    <>
                      <div className="col-12">
                        <label className="form-label">Decision *</label>
                        <div className="d-flex gap-2">
                          <button
                            className={`btn flex-1 ${reviewForm.status === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setReviewForm({ ...reviewForm, status: 'approved' })}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className={`btn flex-1 ${reviewForm.status === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Admin Note (Optional)</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Add a note for the student..."
                          value={reviewForm.adminNote}
                          onChange={(e) => setReviewForm({ ...reviewForm, adminNote: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {reviewing.status !== 'pending' && reviewing.adminNote && (
                    <div className="col-12">
                      <label className="form-label text-muted small">Admin Note</label>
                      <div className="p-2 rounded bg-light">{reviewing.adminNote}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReviewing(null)}>Close</button>
                {reviewing.status === 'pending' && (
                  <button className="btn btn-primary" onClick={handleReview} disabled={submitting}>
                    {submitting ? 'Submitting...' : `Submit ${reviewForm.status === 'approved' ? 'Approval' : 'Rejection'}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRequests;

