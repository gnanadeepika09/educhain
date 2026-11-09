// src/pages/student/StudentTransactions.jsx
// View donations received and fund allocations

import React, { useEffect, useState } from 'react';
import { donationAPI, allocationAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

function StudentTransactions() {
  const [donations, setDonations] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const [donRes, allocRes] = await Promise.all([
        donationAPI.getAll(),
        allocationAPI.getAll(),
      ]);
      setDonations(donRes.data.donations);
      setAllocations(allocRes.data.allocations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading transactions...</p>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalAllocations = allocations.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div>
      <h2 className="mb-4">My Transactions</h2>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Donations Received</h6>
              <h3 className="mb-0 text-success">{totalDonations.toFixed(6)} ETH</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Allocated</h6>
              <h3 className="mb-0 text-primary">{totalAllocations.toFixed(6)} ETH</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Transaction Count</h6>
              <h3 className="mb-0 text-info">{donations.length + allocations.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => setActiveTab('donations')}
          >
            Donations ({donations.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'allocations' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocations')}
          >
            Allocations ({allocations.length})
          </button>
        </li>
      </ul>

      {/* Donations Tab */}
      {activeTab === 'donations' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Donations Received</h5>
            {donations.length === 0 ? (
              <p className="text-muted">No donations received yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Donor</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Transaction Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation._id}>
                        <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                        <td className="fw-bold">{donation.donorId?.name || 'Anonymous'}</td>
                        <td className="text-success fw-bold">{donation.amount} ETH</td>
                        <td>
                          <StatusBadge status={donation.status} />
                        </td>
                        <td>
                          <code className="small">{donation.transactionHash.slice(0, 12)}...</code>
                          {donation.blockNumber && (
                            <div className="small text-muted">Block #{donation.blockNumber}</div>
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
      )}

      {/* Allocations Tab */}
      {activeTab === 'allocations' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Fund Allocations</h5>
            {allocations.length === 0 ? (
              <p className="text-muted">No fund allocations yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Request</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Admin Note</th>
                      <th>Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((allocation) => (
                      <tr key={allocation._id}>
                        <td>{new Date(allocation.createdAt).toLocaleDateString()}</td>
                        <td>
                          {allocation.fundingRequestId?.college}
                          <div className="small text-muted">
                            {allocation.fundingRequestId?.course} - {allocation.fundingRequestId?.year}
                          </div>
                        </td>
                        <td className="text-primary fw-bold">{allocation.amount} ETH</td>
                        <td>
                          <StatusBadge status={allocation.status} />
                        </td>
                        <td>{allocation.note || '-'}</td>
                        <td>
                          {allocation.transactionHash ? (
                            <>
                              <code className="small">{allocation.transactionHash.slice(0, 12)}...</code>
                              {allocation.blockNumber && (
                                <div className="small text-muted">Block #{allocation.blockNumber}</div>
                              )}
                            </>
                          ) : (
                            <span className="text-muted">-</span>
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
      )}

      {(donations.length > 0 || allocations.length > 0) && (
        <div className="alert alert-info mt-4">
          <strong>💡 Blockchain Transparency:</strong> All transactions are permanently recorded on the
          blockchain and can be verified in Ganache using the transaction hash.
        </div>
      )}
    </div>
  );
}

export default StudentTransactions;
