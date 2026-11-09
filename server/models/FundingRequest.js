// models/FundingRequest.js
// Represents a student's request for educational funding
// Admin approves or rejects these requests
// Approved requests are shown to donors

const mongoose = require('mongoose');

const fundingRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
    },
    requiredAmount: {
      type: Number,
      required: [true, 'Required amount is required'],
      min: [0.001, 'Amount must be greater than 0'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for funding is required'],
      trim: true,
      minlength: [20, 'Please provide a detailed reason (at least 20 characters)'],
    },
    // Supporting documents uploaded by student
    documents: [
      {
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Status flow: pending → approved/rejected
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    // Admin's note when approving or rejecting
    adminNote: {
      type: String,
      trim: true,
    },
    // Amount already donated by donors for this request
    amountRaised: {
      type: Number,
      default: 0,
    },
    // Amount allocated to student from collected funds
    amountAllocated: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FundingRequest', fundingRequestSchema);
