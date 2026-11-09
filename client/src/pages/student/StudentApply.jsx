// src/pages/student/StudentApply.jsx
// Student submits a funding request with optional document uploads

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { fundingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentApply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    college: '',
    course: '',
    year: '',
    requiredAmount: '',
    reason: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setMessage({ type: 'warning', text: 'You can upload a maximum of 3 documents.' });
      return;
    }
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (parseFloat(form.requiredAmount) <= 0) {
      return setMessage({ type: 'danger', text: 'Required amount must be greater than 0.' });
    }

    if (form.reason.length < 20) {
      return setMessage({ type: 'danger', text: 'Please provide a detailed reason (at least 20 characters).' });
    }

    setLoading(true);
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      files.forEach((file) => formData.append('documents', file));

      await fundingAPI.create(formData);
      setMessage({ type: 'success', text: '🎉 Funding request submitted successfully! Admin will review it soon.' });
      setTimeout(() => navigate('/student/requests'), 2000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Apply for Funding" />
      <div className="page-content">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Info Banner */}
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>How it works:</strong> Fill in your funding request. Admin will review it. Once approved, donors can donate ETH for your request.
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <i className="bi bi-file-earmark-plus me-2"></i>New Funding Request
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Pre-filled from profile */}
                    <div className="col-md-6">
                      <label className="form-label">Student Name</label>
                      <input type="text" className="form-control" value={user?.name} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="text" className="form-control" value={user?.email} disabled />
                    </div>

                    <div className="col-12">
                      <label className="form-label">College / University *</label>
                      <input
                        type="text"
                        name="college"
                        className="form-control"
                        placeholder="Enter your college name"
                        value={form.college}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Course / Degree *</label>
                      <input
                        type="text"
                        name="course"
                        className="form-control"
                        placeholder="B.Tech CSE, BCA, etc."
                        value={form.course}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Year of Study *</label>
                      <select
                        name="year"
                        className="form-select"
                        value={form.year}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Required Amount (ETH) *</label>
                      <div className="input-group">
                        <span className="input-group-text">Ξ</span>
                        <input
                          type="number"
                          name="requiredAmount"
                          className="form-control"
                          placeholder="e.g. 1.5"
                          step="0.001"
                          min="0.001"
                          value={form.requiredAmount}
                          onChange={handleChange}
                          required
                        />
                        <span className="input-group-text">ETH</span>
                      </div>
                      <small className="text-muted">Enter amount in ETH (test Ethereum on Ganache)</small>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Reason for Funding *
                        <small className="text-muted ms-2">(min 20 characters)</small>
                      </label>
                      <textarea
                        name="reason"
                        className="form-control"
                        rows={5}
                        placeholder="Explain your financial situation and how this funding will help your education. Be specific about what the funds will be used for (tuition fee, hostel, books, etc.)"
                        value={form.reason}
                        onChange={handleChange}
                        required
                        minLength={20}
                      />
                      <small className="text-muted">{form.reason.length} / 20 minimum characters</small>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Supporting Documents <small className="text-muted">(Optional, max 3 files)</small>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={handleFileChange}
                      />
                      <small className="text-muted">
                        Accepted: PDF, JPG, PNG (max 5MB each). Examples: College ID, fee receipt, income certificate.
                      </small>
                      {files.length > 0 && (
                        <div className="mt-2">
                          {files.map((f, i) => (
                            <span key={i} className="badge bg-light text-dark border me-1">
                              <i className="bi bi-paperclip me-1"></i>{f.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                      ) : (
                        <><i className="bi bi-send me-2"></i>Submit Request</>
                      )}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/student')}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentApply;

