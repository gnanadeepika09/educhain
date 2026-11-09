// controllers/allocationController.js
// Admin allocates funds to approved students
// Records allocation on blockchain for transparency

const FundAllocation = require('../models/FundAllocation');
const FundingRequest = require('../models/FundingRequest');
const Donation = require('../models/Donation');
const BlockchainTransaction = require('../models/BlockchainTransaction');
const Student = require('../models/Student');
const { getProvider, getContract } = require('../utils/blockchain');
const { ethers } = require('ethers');

// @desc    Admin allocates funds to a student
// @route   POST /api/allocations
// @access  Private (Admin only)
const allocateFunds = async (req, res) => {
  try {
    const { fundingRequestId, amount, transactionHash, blockNumber, note } = req.body;

    if (!fundingRequestId || !amount) {
      return res.status(400).json({ success: false, message: 'Funding request ID and amount are required.' });
    }

    // Find the funding request
    const fundingRequest = await FundingRequest.findById(fundingRequestId).populate('studentId', 'name email');
    if (!fundingRequest) {
      return res.status(404).json({ success: false, message: 'Funding request not found.' });
    }

    if (fundingRequest.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved funding requests can receive allocations.' });
    }

    // Calculate total funds available (all confirmed donations for this request)
    const donations = await Donation.find({ fundingRequestId, status: 'confirmed' });
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const alreadyAllocated = fundingRequest.amountAllocated || 0;
    const availableForAllocation = totalRaised - alreadyAllocated;

    if (parseFloat(amount) > availableForAllocation) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Available for allocation: ${availableForAllocation.toFixed(4)} ETH`,
      });
    }

    // Verify blockchain transaction if provided
    let verifiedBlockNumber = blockNumber;
    if (transactionHash) {
      const existingAlloc = await FundAllocation.findOne({ transactionHash });
      if (existingAlloc) {
        return res.status(400).json({ success: false, message: 'This transaction hash already recorded.' });
      }

      try {
        const provider = getProvider();
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (receipt && receipt.status === 1) {
          verifiedBlockNumber = receipt.blockNumber;
          console.log(`✅ Allocation transaction verified: ${transactionHash}`);
        }
      } catch (err) {
        console.warn('Could not verify allocation transaction:', err.message);
      }
    }

    // Create allocation record
    const allocation = await FundAllocation.create({
      studentId: fundingRequest.studentId._id,
      fundingRequestId,
      adminId: req.user._id,
      amount: parseFloat(amount),
      transactionHash: transactionHash || null,
      blockNumber: verifiedBlockNumber || null,
      status: 'completed',
      note: note || '',
    });

    // Update funding request allocated amount
    fundingRequest.amountAllocated = alreadyAllocated + parseFloat(amount);

    // If fully funded, mark as completed
    if (fundingRequest.amountAllocated >= fundingRequest.requiredAmount) {
      fundingRequest.status = 'completed';
    }
    await fundingRequest.save();

    // Update student's total funds received
    await Student.findOneAndUpdate(
      { userId: fundingRequest.studentId._id },
      { $inc: { totalFundsReceived: parseFloat(amount) } }
    );

    // Log to blockchain transaction master table (if tx hash provided)
    if (transactionHash) {
      await BlockchainTransaction.create({
        type: 'allocation',
        referenceId: allocation._id,
        transactionHash,
        blockNumber: verifiedBlockNumber,
        amount: parseFloat(amount),
        status: 'confirmed',
        studentId: fundingRequest.studentId._id,
        fundingRequestId,
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully allocated ${amount} ETH to ${fundingRequest.studentId.name}`,
      allocation,
    });
  } catch (error) {
    console.error('Allocate funds error:', error);
    res.status(500).json({ success: false, message: 'Could not allocate funds.' });
  }
};

// @desc    Get all fund allocations
// @route   GET /api/allocations
// @access  Private
const getAllocations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const allocations = await FundAllocation.find(query)
      .populate('studentId', 'name email')
      .populate('fundingRequestId', 'college course year')
      .populate('adminId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: allocations.length, allocations });
  } catch (error) {
    console.error('Get allocations error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch allocations.' });
  }
};

module.exports = { allocateFunds, getAllocations };
