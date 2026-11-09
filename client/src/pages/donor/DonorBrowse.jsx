// src/pages/donor/DonorBrowse.jsx
// Browse and donate to approved student funding requests

import React, { useEffect, useState } from 'react';
import { fundingAPI, donationAPI } from '../../services/api';
import { ethers } from 'ethers';
import StatusBadge from '../../components/StatusBadge';

function DonorBrowse() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchRequests();
    checkWalletConnection();
  }, []);

  const fetchRequests = async () => {
    try {
      // Donors see only approved requests
      const res = await fundingAPI.getAll({ status: 'approved' });
      setRequests(res.data.fundingRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        setWalletConnected(accounts.length > 0);
      } catch (error) {
        console.error('Wallet check error:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      alert('✅ Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet.');
    }
  };

  const handleDonateClick = (request) => {
    if (!walletConnected) {
      alert('Please connect your MetaMask wallet first.');
      return;
    }
    setSelectedRequest(request);
    setDonationAmount('');
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    if (!CONTRACT_ADDRESS) {
      alert('Smart contract address not configured. Please deploy the contract first.');
      return;
    }

    setDonating(true);

    try {
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const donorAddress = await signer.getAddress();

      // Convert request ID to bytes32 for smart contract
      const requestIdBytes32 = ethers.zeroPadValue(
        ethers.toBeHex(ethers.toBigInt('0x' + selectedRequest._id.slice(-24).padStart(64, '0'))),
        32
      );

      // ABI for the donate function
      const contractABI = [
        'function donate(bytes32 requestId) external payable',
      ];

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      // Send donation transaction
      const amountWei = ethers.parseEther(donationAmount);
      console.log(`Sending ${donationAmount} ETH to contract ${CONTRACT_ADDRESS}`);

      const tx = await contract.donate(requestIdBytes32, { value: amountWei });
      console.log('Transaction sent:', tx.hash);

      alert('Transaction sent! Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Record donation in backend
      await donationAPI.record({
        fundingRequestId: selectedRequest._id,
        amount: parseFloat(donationAmount),
        transactionHash: receipt.hash,
        donorWalletAddress: donorAddress,
      });

      alert(`✅ Donation of ${donationAmount} ETH successful!\nTx: ${receipt.hash}`);

      // Refresh requests and close modal
      fetchRequests();
      setSelectedRequest(null);
      setDonationAmount('');
    } catch (error) {
      console.error('Donation error:', error);
      let errorMsg = 'Donation failed. Please try again.';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMsg = 'Transaction rejected by user.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(errorMsg);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading funding requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Browse Students</h2>
          <p className="text-muted mb-0">Support students by donating to their education fund</p>
        </div>
        {!walletConnected && (
          <button onClick={connectWallet} className="btn btn-primary">
            🦊 Connect Wallet
          </button>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="alert alert-info">No approved funding requests available at the moment.</div>
      ) : (
        <div className="row g-4">
          {requests.map((request) => {
            const remaining = request.requiredAmount - (request.amountRaised || 0);
            const progress = ((request.amountRaised || 0) / request.requiredAmount) * 100;

            return (
              <div key={request._id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0">{request.studentName}</h5>
                      <StatusBadge status={request.status} />
                    </div>

                    <p className="text-muted mb-2">
                      <strong>🎓 College:</strong> {request.college}
                    </p>
                    <p className="text-muted mb-2">
                      <strong>📚 Course:</strong> {request.course} ({request.year})
                    </p>
                    <p className="text-muted mb-3">
                      <strong>📝 Reason:</strong> {request.reason.slice(0, 100)}
                      {request.reason.length > 100 && '...'}
                    </p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Funding Progress</small>
                        <small className="text-muted">{progress.toFixed(1)}%</small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                          Raised: {(request.amountRaised || 0).toFixed(4)} ETH
                        </small>
                        <small className="text-muted">Goal: {request.requiredAmount} ETH</small>
                      </div>
                    </div>

                    {remaining > 0 && (
                      <button
                        onClick={() => handleDonateClick(request)}
                        className="btn btn-primary w-100"
                        disabled={!walletConnected}
                      >
                        💰 Donate Now
                      </button>
                    )}
                    {remaining <= 0 && (
                      <button className="btn btn-success w-100" disabled>
                        ✅ Fully Funded
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Donation Modal */}
      {selectedRequest && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedRequest(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Donate to {selectedRequest.studentName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                ></button>
              </div>
              <form onSubmit={handleDonationSubmit}>
                <div className="modal-body">
                  <p>
                    <strong>College:</strong> {selectedRequest.college}
                  </p>
                  <p>
                    <strong>Required:</strong> {selectedRequest.requiredAmount} ETH
                  </p>
                  <p>
                    <strong>Raised:</strong> {(selectedRequest.amountRaised || 0).toFixed(4)} ETH
                  </p>
                  <p>
                    <strong>Remaining:</strong>{' '}
                    {(selectedRequest.requiredAmount - (selectedRequest.amountRaised || 0)).toFixed(4)} ETH
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Donation Amount (ETH)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.1"
                      step="0.001"
                      min="0.001"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted">Minimum: 0.001 ETH</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                    disabled={donating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={donating}>
                    {donating ? 'Processing...' : '💰 Donate with MetaMask'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorBrowse;
