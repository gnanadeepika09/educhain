// src/pages/donor/DonorDonations.jsx
// View donation history with blockchain transaction details

import React, { useEffect, useState } from 'react';
import { donationAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

function DonorDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await donationAPI.getAll();
      setDonations(res.data.donations);
      
      const total = res.data.donations.reduce((sum, d) => sum + d.amount, 0);
      setStats({ total, count: res.data.count });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setLoading(false);
    }
  };

  const openGanache = (txHash) => {
    // For Ganache local network, we just copy the hash
    // In production with Etherscan, this would be a clickable link
    navigator.clipboard.writeText(txHash);
    alert(`Transaction hash copied to clipboard:\n${txHash}`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading donations...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">My Donations</h2>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Donated</h6>
              <h3 className="mb-0 text-primary">{stats.total.toFixed(6)} ETH</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Donations</h6>
              <h3 className="mb-0 text-success">{stats.count}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {donations.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">You haven't made any donations yet.</p>
              <a href="/donor/browse" className="btn btn-primary">
                Browse Students
              </a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>College</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation._id}>
                      <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                      <td className="fw-bold">{donation.studentId?.name || 'N/A'}</td>
                      <td>{donation.fundingRequestId?.college || 'N/A'}</td>
                      <td>
                        {donation.fundingRequestId?.course} ({donation.fundingRequestId?.year})
                      </td>
                      <td className="text-success fw-bold">{donation.amount} ETH</td>
                      <td>
                        <StatusBadge status={donation.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openGanache(donation.transactionHash)}
                          title="Copy transaction hash"
                        >
                          📋 {donation.transactionHash.slice(0, 8)}...
                        </button>
                        {donation.blockNumber && (
                          <small className="d-block text-muted mt-1">
                            Block #{donation.blockNumber}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {donations.length > 0 && (
        <div className="alert alert-info mt-4">
          <strong>💡 Tip:</strong> All donation transactions are permanently recorded on the blockchain.
          Click the transaction hash to copy it and view it in Ganache.
        </div>
      )}
    </div>
  );
}

export default DonorDonations;
