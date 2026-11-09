// src/pages/LandingPage.jsx
// Landing page - introduces EduChain to visitors

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: '🎓',
      title: 'For Students',
      desc: 'Submit funding requests with supporting documents. Track approval status and received funds in real-time.',
      color: '#4f46e5',
    },
    {
      icon: '💝',
      title: 'For Donors',
      desc: 'Browse approved student profiles. Donate using MetaMask — your contributions are recorded on blockchain forever.',
      color: '#06b6d4',
    },
    {
      icon: '⚙️',
      title: 'For Admins',
      desc: 'Review and approve funding requests. Allocate collected donations to deserving students transparently.',
      color: '#10b981',
    },
    {
      icon: '🔗',
      title: 'Blockchain Transparency',
      desc: 'Every donation and allocation is recorded on Ethereum blockchain — immutable, verifiable, trustworthy.',
      color: '#f59e0b',
    },
    {
      icon: '🦊',
      title: 'MetaMask Integration',
      desc: 'Donors connect their MetaMask wallet and donate test ETH directly. No intermediaries, no hidden fees.',
      color: '#f97316',
    },
    {
      icon: '📊',
      title: 'Real-time Dashboard',
      desc: 'Students, donors, and admins each get role-specific dashboards with live statistics and history.',
      color: '#8b5cf6',
    },
  ];

  const steps = [
    { step: '1', title: 'Students Apply', desc: 'Register and submit a funding request with reason and documents.' },
    { step: '2', title: 'Admin Reviews', desc: 'Admin verifies the request and approves or rejects it.' },
    { step: '3', title: 'Donors Contribute', desc: 'Approved requests appear for donors. They donate via MetaMask.' },
    { step: '4', title: 'Funds Allocated', desc: 'Admin allocates collected ETH to the student. All tracked on-chain.' },
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="container">
          <a className="navbar-brand fw-bold" href="#" style={{ color: '#4f46e5', fontSize: '1.4rem' }}>
            <i className="bi bi-mortarboard-fill me-2"></i>EduChain
          </a>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white">
              <span className="badge bg-white text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                🔗 Powered by Blockchain
              </span>
              <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.2 }}>
                Transparent Education<br />
                <span style={{ color: '#fbbf24' }}>Fund Management</span>
              </h1>
              <p className="lead mt-3 mb-4" style={{ opacity: 0.9 }}>
                EduChain connects students who need financial assistance with generous donors using Ethereum blockchain — ensuring every donation is transparent, verifiable, and reaches the right hands.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/register" className="btn btn-warning btn-lg fw-semibold px-4">
                  <i className="bi bi-rocket-takeoff me-2"></i>Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login
                </Link>
              </div>
              <div className="mt-4 d-flex gap-4" style={{ opacity: 0.8 }}>
                <div><strong>🔒</strong> Secure JWT Auth</div>
                <div><strong>⛓️</strong> Blockchain Verified</div>
                <div><strong>🦊</strong> MetaMask Ready</div>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0 text-center">
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎓</div>
                <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>How It Works</h3>
                {steps.map((s) => (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
                    <div style={{ background: '#fbbf24', color: '#1e293b', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
                      {s.step}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600 }}>{s.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontWeight: 700, color: '#1e293b' }}>Everything You Need</h2>
            <p className="text-muted">A complete ecosystem for education fund management</p>
          </div>
          <div className="row g-4">
            {features.map((feature, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="landing-feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h5 style={{ fontWeight: 600, color: '#1e293b' }}>{feature.title}</h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 0 }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <div className="container text-center text-white">
          <h2 style={{ fontWeight: 700 }}>Ready to Make a Difference?</h2>
          <p className="lead mb-4" style={{ opacity: 0.9 }}>Join EduChain today — whether you're a student seeking help or a donor wanting to give back.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-warning btn-lg fw-semibold px-5">Register Now</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-5">Login</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center" style={{ background: '#1e293b', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
        <div className="container">
          <strong style={{ color: 'white' }}>EduChain</strong> — Blockchain-Based Education Fund Management System
          <br />Built with React, Node.js, MongoDB, Solidity &amp; Hardhat
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

