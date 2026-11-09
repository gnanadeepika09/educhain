// controllers/adminController.js
// Admin-specific endpoints: dashboard stats, user management, reports

const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const FundingRequest = require('../models/FundingRequest');
const Donation = require('../models/Donation');
const FundAllocation = require('../models/FundAllocation');
const BlockchainTransaction = require('../models/BlockchainTransaction');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Count users by role
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalDonors = await User.countDocuments({ role: 'donor' });

    // Funding request stats
    const totalRequests = await FundingRequest.countDocuments();
    const pendingRequests = await FundingRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await FundingRequest.countDocuments({ status: 'approved' });
    const completedRequests = await FundingRequest.countDocuments({ status: 'completed' });
    const rejectedRequests = await FundingRequest.countDocuments({ status: 'rejected' });

    // Financial stats - aggregate total donations
    const donationStats = await Donation.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const allocationStats = await FundAllocation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const totalDonationsETH = donationStats.length > 0 ? donationStats[0].total : 0;
    const totalAllocatedETH = allocationStats.length > 0 ? allocationStats[0].total : 0;
    const availableFundsETH = totalDonationsETH - totalAllocatedETH;

    res.json({
      success: true,
      stats: {
        users: { totalStudents, totalDonors },
        requests: { total: totalRequests, pending: pendingRequests, approved: approvedRequests, completed: completedRequests, rejected: rejectedRequests },
        finance: {
          totalDonationsETH: parseFloat(totalDonationsETH.toFixed(6)),
          totalAllocatedETH: parseFloat(totalAllocatedETH.toFixed(6)),
          availableFundsETH: parseFloat(availableFundsETH.toFixed(6)),
          totalDonationCount: donationStats.length > 0 ? donationStats[0].count : 0,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch dashboard statistics.' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update user status.' });
  }
};

// @desc    Get all blockchain transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin only)
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await BlockchainTransaction.find()
      .populate('donorId', 'name email')
      .populate('studentId', 'name email')
      .populate('fundingRequestId', 'college course')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch transactions.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, getAllTransactions };
