// src/pages/donor/DonorDashboard.jsx
// Donor home page showing overview and quick stats

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ethers } from 'ethers';

function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, donationCount: 0 });
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    fetchDonations();
    checkWalletConnection();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await donationAPI.getAll();
      setDonations(res.data.donations);
      
      const total = res.data.donations.reduce((sum, d) => sum + d.amount, 0);
      setStats({ totalDonated: total, donationCount: res.data.count });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setWalletAddress(address);
          
          // Get wallet balance
          const balance = await provider.getBalance(address);
          setWalletBalance(ethers.formatEther(balance));
        }
      } catch (error) {
        console.error('Wallet check error:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask to donate.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      const balance = await provider.getBalance(address);
      setWalletBalance(ethers.formatEther(balance));
      
      alert(`✅ Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Welcome back, {user?.name}! 👋</h2>
        <p className="text-muted">Thank you for supporting students' education.</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Donated</h6>
              <h3 className="mb-0 text-primary">{stats.totalDonated.toFixed(4)} ETH</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Donations Made</h6>
              <h3 className="mb-0 text-success">{stats.donationCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Wallet Status</h6>
              <h3 className="mb-0 text-info">
                {walletAddress ? '🟢 Connected' : '🔴 Not Connected'}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Wallet Balance</h6>
              <h3 className="mb-0 text-warning">
                {walletBalance ? `${parseFloat(walletBalance).toFixed(4)} ETH` : 'N/A'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* MetaMask Connection */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">🦊 MetaMask Wallet</h5>
          {walletAddress ? (
            <div>
              <p className="mb-2">
                <strong>Connected Address:</strong>{' '}
                <code className="bg-light px-2 py-1 rounded">{walletAddress}</code>
              </p>
              <p className="text-success mb-0">✅ Your wallet is connected and ready to donate!</p>
            </div>
          ) : (
            <div>
              <p className="text-muted mb-3">
                Connect your MetaMask wallet to start donating to students in need.
              </p>
              <button onClick={connectWallet} className="btn btn-primary">
                🦊 Connect MetaMask
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Quick Actions</h5>
          <Link to="/donor/browse" className="btn btn-outline-primary me-2">
            🔍 Browse Students
          </Link>
          <Link to="/donor/donations" className="btn btn-outline-secondary">
            📜 View Donations
          </Link>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Recent Donations</h5>
          {donations.length === 0 ? (
            <p className="text-muted">You haven't made any donations yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>College</th>
                    <th>Amount</th>
                    <th>Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 5).map((donation) => (
                    <tr key={donation._id}>
                      <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                      <td>{donation.studentId?.name}</td>
                      <td>{donation.fundingRequestId?.college}</td>
                      <td className="text-success fw-bold">{donation.amount} ETH</td>
                      <td>
                        <code className="small">{donation.transactionHash.slice(0, 10)}...</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;
