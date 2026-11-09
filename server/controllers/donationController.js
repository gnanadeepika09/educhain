// controllers/donationController.js
// Handles donation recording after MetaMask blockchain transaction
// IMPORTANT: We verify the transaction on blockchain before saving to DB

const Donation = require('../models/Donation');
const FundingRequest = require('../models/FundingRequest');
const Donor = require('../models/Donor');
const BlockchainTransaction = require('../models/BlockchainTransaction');
const { getProvider } = require('../utils/blockchain');
const { ethers } = require('ethers');

// @desc    Record a confirmed donation (called after MetaMask transaction)
// @route   POST /api/donations
// @access  Private (Donor only)
const recordDonation = async (req, res) => {
  try {
    const { fundingRequestId, amount, transactionHash, donorWalletAddress } = req.body;

    // Validate required fields
    if (!fundingRequestId || !amount || !transactionHash || !donorWalletAddress) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if this transaction hash already exists (prevent duplicate recording)
    const existingDonation = await Donation.findOne({ transactionHash });
    if (existingDonation) {
      return res.status(400).json({ success: false, message: 'This transaction has already been recorded.' });
    }

    // Verify the funding request exists and is approved
    const fundingRequest = await FundingRequest.findById(fundingRequestId);
    if (!fundingRequest) {
      return res.status(404).json({ success: false, message: 'Funding request not found.' });
    }
    if (fundingRequest.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Funding request is not approved for donations.' });
    }

    // ===== BLOCKCHAIN VERIFICATION =====
    // Verify the transaction actually happened on the blockchain
    // This prevents fake transaction hashes from being submitted
    let blockNumber = null;
    try {
      const provider = getProvider();
      const receipt = await provider.getTransactionReceipt(transactionHash);

      if (!receipt) {
        return res.status(400).json({
          success: false,
          message: 'Transaction not found on blockchain. Please wait for confirmation.',
        });
      }

      if (receipt.status === 0) {
        return res.status(400).json({
          success: false,
          message: 'Blockchain transaction failed. Donation not recorded.',
        });
      }

      blockNumber = receipt.blockNumber;
      console.log(`✅ Blockchain transaction verified: ${transactionHash} at block ${blockNumber}`);
    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError.message);
      return res.status(400).json({
        success: false,
        message: 'Could not verify blockchain transaction. Ensure Ganache is running.',
      });
    }
    // ===== END BLOCKCHAIN VERIFICATION =====

    // Save donation to database
    const donation = await Donation.create({
      donorId: req.user._id,
      fundingRequestId,
      studentId: fundingRequest.studentId,
      amount: parseFloat(amount),
      donorWalletAddress: donorWalletAddress.toLowerCase(),
      transactionHash,
      blockNumber,
      status: 'confirmed',
    });

    // Update funding request's raised amount
    fundingRequest.amountRaised = (fundingRequest.amountRaised || 0) + parseFloat(amount);
    await fundingRequest.save();

    // Update donor's total donated amount
    await Donor.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { totalDonated: parseFloat(amount) } }
    );

    // Log to blockchain transaction master table
    await BlockchainTransaction.create({
      type: 'donation',
      referenceId: donation._id,
      transactionHash,
      blockNumber,
      fromAddress: donorWalletAddress.toLowerCase(),
      amount: parseFloat(amount),
      status: 'confirmed',
      donorId: req.user._id,
      studentId: fundingRequest.studentId,
      fundingRequestId,
    });

    res.status(201).json({
      success: true,
      message: `Donation of ${amount} ETH recorded successfully!`,
      donation,
    });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ success: false, message: 'Could not record donation.' });
  }
};

// @desc    Get donations (donor sees own, admin sees all)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'donor') {
      query.donorId = req.user._id;
    }
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const donations = await Donation.find(query)
      .populate('donorId', 'name email')
      .populate('studentId', 'name email')
      .populate('fundingRequestId', 'college course year requiredAmount')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch donations.' });
  }
};

module.exports = { recordDonation, getDonations };
