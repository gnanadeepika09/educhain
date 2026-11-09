// models/BlockchainTransaction.js
// Master log of all blockchain interactions (donations + allocations)
// Provides a complete audit trail of all financial movements

const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema(
  {
    // Type of blockchain event
    type: {
      type: String,
      enum: ['donation', 'allocation'],
      required: true,
    },
    // Reference to the specific Donation or FundAllocation document
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    blockNumber: {
      type: Number,
    },
    fromAddress: {
      type: String,
      lowercase: true,
    },
    toAddress: {
      type: String,
      lowercase: true,
    },
    // Amount in ETH
    amount: {
      type: Number,
      required: true,
    },
    // Gas used for the transaction
    gasUsed: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['confirmed', 'failed'],
      default: 'confirmed',
    },
    network: {
      type: String,
      default: 'Ganache Local',
    },
    // Involved parties
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fundingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundingRequest',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
