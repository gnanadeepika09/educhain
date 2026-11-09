// routes/allocationRoutes.js
const express = require('express');
const router = express.Router();
const { allocateFunds, getAllocations } = require('../controllers/allocationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllocations)
  .post(protect, authorize('admin'), allocateFunds);

module.exports = router;

