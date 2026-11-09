// src/pages/admin/AdminAllocations.jsx
// Admin allocates collected donation funds to approved students

import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { allocationAPI, fundingAPI, donationAPI } from '../../services/api';

const AdminAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fundingRequestId: '', amount: '', transactionHash: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocRes, reqRes, donRes] = await Promise.all([
          allocationAPI.getAll(),
          fundingAPI.getAll({ status: 'approved' }),
          donationAPI.getAll(),
        ]);
        setAllocations(allocRes.data.allocations);
        setApprovedRequests(reqRes.data.fundingRequests);
        setDonations(donRes.data.donations);
      } catch {
        setMessage({ type: 'danger', text: 'Failed to load data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate available funds when a request is selected
  const handleRequestSelect = (requestId) => {
    setForm({ ...form, fundingRequestId: requestId, amount: '' });
    if (requestId) {
      const req = approvedRequests.find((r) => r._id === requestId);
      setSelectedRequest(req || null);
    } else {
      setSelectedRequest(null);
    }
  };

  const getAvailableFunds = (req) => {
    if (!req) return 0;
    return Math.max(0, (req.amountRaised || 0) - (req.amountAllocated || 0));
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await allocationAPI.allocate(form);
      setMessage({ type: 'success', text: res.data.message });
      setShowForm(false);
      setForm({ fundingRequestId: '', amount: '', transactionHash: '', note: '' });
      setSelectedRequest(null);
      // Refresh
      const [allocRes, reqRes] = await Promise.all([allocationAPI.getAll(), fundingAPI.getAll({ status: 'approved' })]);
      setAllocations(allocRes.data.allocations);
      setApprovedRequests(reqRes.data.fundingRequests);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Allocation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Fund Allocations" />
      <div className="page-content">
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible`}>
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        {/* Allocate Form */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className="bi bi-send-check me-2"></i>Allocate Funds to Student</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              <i className={`bi ${showForm ? 'bi-chevron-up' : 'bi-plus-circle'} me-1`}></i>
              {showForm ? 'Hide Form' : 'New Allocation'}
            </button>
          </div>
          {showForm && (
            <div className="card-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>How allocation works:</strong> Select an approved request, enter the amount to allocate. Optionally provide a blockchain transaction hash if you've transferred ETH directly to the student.
              </div>
              <form onSubmit={handleAllocate}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Approved Funding Request *</label>
                    <select
                      className="form-select"
                      value={form.fundingRequestId}
                      onChange={(e) => handleRequestSelect(e.target.value)}
                      required
                    >
                      <option value="">-- Select a request --</option>
                      {approvedRequests.map((req) => {
                        const available = getAvailableFunds(req);
                        return (
                          <option key={req._id} value={req._id} disabled={available <= 0}>
                            {req.studentName} — {req.college} ({available.toFixed(4)} ETH available)
                          </option>
                        );
                      })}
                    </select>
                    {selectedRequest && (
                      <small className="text-muted mt-1 d-block">
                        Required: {selectedRequest.requiredAmount} ETH |
                        Raised: {(selectedRequest.amountRaised || 0).toFixed(4)} ETH |
                        Already Allocated: {(selectedRequest.amountAllocated || 0).toFixed(4)} ETH |
                        <strong className="text-success"> Available: {getAvailableFunds(selectedRequest).toFixed(4)} ETH</strong>
                      </small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Amount to Allocate (ETH) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 0.5"
                      step="0.0001"
                      min="0.0001"
                      max={selectedRequest ? getAvailableFunds(selectedRequest) : undefined}
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Blockchain Tx Hash (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0x... (if ETH transferred on-chain)"
                      value={form.transactionHash}
                      onChange={(e) => setForm({ ...form, transactionHash: e.target.value })}
                    />
                    <small className="text-muted">Leave blank for off-chain allocation record</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Note (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Semester fee payment"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Allocating...</> : '✅ Confirm Allocation'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Allocations Table */}
        <div className="card">
          <div className="card-header"><i className="bi bi-clock-history me-2"></i>Allocation History ({allocations.length})</div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr><th>Student</th><th>College/Course</th><th>Amount (ETH)</th><th>Tx Hash</th><th>Status</th><th>Note</th><th>Date</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                ) : allocations.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted py-4">No allocations yet.</td></tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a._id}>
                      <td className="fw-semibold">{a.studentId?.name}</td>
                      <td><small>{a.fundingRequestId?.college}<br />{a.fundingRequestId?.course}</small></td>
                      <td className="fw-bold text-success">{a.amount} ETH</td>
                      <td>
                        {a.transactionHash ? (
                          <span className="tx-hash" title={a.transactionHash}>
                            {a.transactionHash.slice(0, 12)}...{a.transactionHash.slice(-6)}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>{a.note || '—'}</td>
                      <td><small>{new Date(a.createdAt).toLocaleDateString()}</small></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAllocations;

