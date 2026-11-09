// src/pages/admin/AdminTransactions.jsx
// View all blockchain transactions - donations and allocations

import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { adminAPI } from '../../services/api';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await adminAPI.getTransactions();
        setTransactions(res.data.transactions);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, []);

  const filtered = filterType ? transactions.filter((t) => t.type === filterType) : transactions;

  return (
    <>
      <Topbar title="Blockchain Transactions" />
      <div className="page-content">
        <div className="card mb-3">
          <div className="card-body d-flex gap-2 align-items-center">
            <span className="text-muted me-2 small">Filter:</span>
            {['', 'donation', 'allocation'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {t === '' ? '🔗 All' : t === 'donation' ? '💝 Donations' : '📤 Allocations'}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="bi bi-link-45deg me-2"></i>Blockchain Transactions ({filtered.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Tx Hash</th>
                  <th>Block</th>
                  <th>From</th>
                  <th>Amount (ETH)</th>
                  <th>Donor</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-muted py-4">No blockchain transactions found.</td></tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <span className={`badge ${tx.type === 'donation' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                          {tx.type === 'donation' ? '💝 Donation' : '📤 Allocation'}
                        </span>
                      </td>
                      <td>
                        <span className="tx-hash" title={tx.transactionHash}>
                          {tx.transactionHash.slice(0, 10)}...{tx.transactionHash.slice(-6)}
                        </span>
                      </td>
                      <td><small>#{tx.blockNumber || '—'}</small></td>
                      <td>
                        {tx.fromAddress ? (
                          <span className="tx-hash">{tx.fromAddress.slice(0, 8)}...</span>
                        ) : '—'}
                      </td>
                      <td className="fw-bold">{tx.amount} ETH</td>
                      <td><small>{tx.donorId?.name || '—'}</small></td>
                      <td><small>{tx.studentId?.name || '—'}</small></td>
                      <td><StatusBadge status={tx.status} /></td>
                      <td><small>{new Date(tx.createdAt).toLocaleDateString()}</small></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 p-3 rounded" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <i className="bi bi-shield-check text-success me-2"></i>
          <strong className="text-success">Blockchain Verified:</strong>
          <span className="text-muted ms-1 small">All transaction hashes above are verified against the Ganache blockchain before being recorded in the database.</span>
        </div>
      </div>
    </>
  );
};

export default AdminTransactions;

