// controllers/fundingRequestController.js
// Handles student funding request submission, admin approval/rejection, and listing

const FundingRequest = require('../models/FundingRequest');
const Student = require('../models/Student');

// @desc    Student submits a new funding request
// @route   POST /api/funding-requests
// @access  Private (Student only)
const createFundingRequest = async (req, res) => {
  try {
    const { college, course, year, requiredAmount, reason } = req.body;

    // Validate required fields
    if (!college || !course || !year || !requiredAmount || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (requiredAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Required amount must be greater than 0.' });
    }

    // Check if student already has a pending request
    const existingPending = await FundingRequest.findOne({
      studentId: req.user._id,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending funding request. Please wait for admin review.',
      });
    }

    // Build documents array from uploaded files
    const documents = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
        }))
      : [];

    const fundingRequest = await FundingRequest.create({
      studentId: req.user._id,
      studentName: req.user.name,
      college,
      course,
      year,
      requiredAmount: parseFloat(requiredAmount),
      reason,
      documents,
    });

    res.status(201).json({
      success: true,
      message: 'Funding request submitted successfully! Admin will review it soon.',
      fundingRequest,
    });
  } catch (error) {
    console.error('Create funding request error:', error);
    res.status(500).json({ success: false, message: 'Could not submit funding request.' });
  }
};

// @desc    Get all funding requests (Admin) or own requests (Student)
// @route   GET /api/funding-requests
// @access  Private
const getFundingRequests = async (req, res) => {
  try {
    let query = {};

    // Students can only see their own requests
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    // Donors can only see approved requests
    if (req.user.role === 'donor') {
      query.status = 'approved';
    }

    // Allow filtering by status
    if (req.query.status && req.user.role === 'admin') {
      query.status = req.query.status;
    }

    const requests = await FundingRequest.find(query)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, fundingRequests: requests });
  } catch (error) {
    console.error('Get funding requests error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch funding requests.' });
  }
};

// @desc    Get a single funding request by ID
// @route   GET /api/funding-requests/:id
// @access  Private
const getFundingRequestById = async (req, res) => {
  try {
    const request = await FundingRequest.findById(req.params.id).populate('studentId', 'name email phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Funding request not found.' });
    }

    // Students can only view their own requests
    if (req.user.role === 'student' && request.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, fundingRequest: request });
  } catch (error) {
    console.error('Get funding request by ID error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch funding request.' });
  }
};

// @desc    Admin approves or rejects a funding request
// @route   PUT /api/funding-requests/:id/review
// @access  Private (Admin only)
const reviewFundingRequest = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const request = await FundingRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Funding request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status}.`,
      });
    }

    request.status = status;
    request.adminNote = adminNote || '';
    await request.save();

    res.json({
      success: true,
      message: `Funding request ${status} successfully.`,
      fundingRequest: request,
    });
  } catch (error) {
    console.error('Review funding request error:', error);
    res.status(500).json({ success: false, message: 'Could not review funding request.' });
  }
};

module.exports = { createFundingRequest, getFundingRequests, getFundingRequestById, reviewFundingRequest };
