// models/Donation.js
// Records every donation made by a donor
// Links to blockchain transaction for transparency

const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fundingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundingRequest',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Amount donated in ETH
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [0.001, 'Minimum donation is 0.001 ETH'],
    },
    // Donor's Ethereum wallet address
    donorWalletAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    // Blockchain transaction hash - this is the proof of donation
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Block number where transaction was confirmed
    blockNumber: {
      type: Number,
    },
    // Status of the donation
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'confirmed',
    },
    // Network where the transaction happened
    network: {
      type: String,
      default: 'Ganache Local',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
