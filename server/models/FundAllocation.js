// models/FundAllocation.js
// Records when admin allocates collected funds to an approved student
// Also recorded on blockchain for transparency

const mongoose = require('mongoose');

const fundAllocationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fundingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundingRequest',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Amount allocated in ETH
    amount: {
      type: Number,
      required: [true, 'Allocation amount is required'],
      min: [0.001, 'Minimum allocation is 0.001 ETH'],
    },
    // Blockchain transaction hash for allocation
    transactionHash: {
      type: String,
      unique: true,
      sparse: true, // Allow null but unique when set
    },
    blockNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FundAllocation', fundAllocationSchema);
