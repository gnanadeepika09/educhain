// routes/fundingRequestRoutes.js
const express = require('express');
const router = express.Router();
const {
  createFundingRequest,
  getFundingRequests,
  getFundingRequestById,
  reviewFundingRequest,
} = require('../controllers/fundingRequestController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all requests (filtered by role) | Student submits new request
router.route('/')
  .get(protect, getFundingRequests)
  .post(protect, authorize('student'), upload.array('documents', 3), createFundingRequest);

// Get single request
router.route('/:id')
  .get(protect, getFundingRequestById);

// Admin reviews a request
router.route('/:id/review')
  .put(protect, authorize('admin'), reviewFundingRequest);

module.exports = router;

