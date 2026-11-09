// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    // Student fields
    college: '', course: '', year: '', rollNumber: '',
    // Donor fields
    organization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const payload = { ...form, role };
      const res = await authAPI.register(payload);
      const { token, user } = res.data;
      login(token, user);
      navigate(role === 'student' ? '/student' : '/donor');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <Link to="/" className="d-flex align-items-center mb-4 text-white text-decoration-none">
              <i className="bi bi-arrow-left me-2"></i>Back to Home
            </Link>

            <div className="card border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div style={{ fontSize: '2.5rem' }}>🎓</div>
                  <h4 className="fw-bold" style={{ color: '#4f46e5' }}>Create Account</h4>
                  <p className="text-muted small">Join EduChain today</p>
                </div>

                {/* Role Selector */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">I am a...</label>
                  <div className="d-flex gap-2">
                    {['student', 'donor'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`btn flex-1 ${role === r ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ flex: 1, textTransform: 'capitalize' }}
                      >
                        {r === 'student' ? '🎓 Student' : '💝 Donor'}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>{error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Common fields */}
                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label">Full Name *</label>
                      <input type="text" name="name" className="form-control" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input type="email" name="email" className="form-control" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" name="phone" className="form-control" placeholder="10-digit number" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Password * <small className="text-muted">(min 6 characters)</small></label>
                      <input type="password" name="password" className="form-control" placeholder="Create a strong password" value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                  </div>

                  {/* Student-specific fields */}
                  {role === 'student' && (
                    <div className="row g-3 mb-3">
                      <div className="col-12">
                        <div className="p-3 rounded" style={{ background: '#f0f4ff', border: '1px solid #c7d2fe' }}>
                          <div className="fw-semibold text-primary mb-2">
                            <i className="bi bi-mortarboard me-1"></i>Academic Details
                          </div>
                          <div className="row g-2">
                            <div className="col-12">
                              <label className="form-label">College / University *</label>
                              <input type="text" name="college" className="form-control" placeholder="Your college name" value={form.college} onChange={handleChange} required={role === 'student'} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Course / Degree *</label>
                              <input type="text" name="course" className="form-control" placeholder="B.Tech, BCA, etc." value={form.course} onChange={handleChange} required={role === 'student'} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Year of Study *</label>
                              <select name="year" className="form-select" value={form.year} onChange={handleChange} required={role === 'student'}>
                                <option value="">Select year</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Roll Number (Optional)</label>
                              <input type="text" name="rollNumber" className="form-control" placeholder="Your roll number" value={form.rollNumber} onChange={handleChange} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Donor-specific fields */}
                  {role === 'donor' && (
                    <div className="mb-3">
                      <div className="p-3 rounded" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div className="fw-semibold text-success mb-2">
                          <i className="bi bi-building me-1"></i>Donor Details
                        </div>
                        <label className="form-label">Organization (Optional)</label>
                        <input type="text" name="organization" className="form-control" placeholder="Your company or organization" value={form.organization} onChange={handleChange} />
                        <small className="text-muted mt-1 d-block">
                          <i className="bi bi-info-circle me-1"></i>You can connect your MetaMask wallet after logging in.
                        </small>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</>
                    ) : (
                      <><i className="bi bi-person-plus me-2"></i>Create Account</>
                    )}
                  </button>
                </form>

                <hr className="my-3" />
                <p className="text-center text-muted small mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-semibold">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

