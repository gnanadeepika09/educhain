// routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const { recordDonation, getDonations } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getDonations)
  .post(protect, authorize('donor'), recordDonation);

module.exports = router;

