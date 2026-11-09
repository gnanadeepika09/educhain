// models/Donor.js
// Extended profile for donor users
// Stores wallet address for blockchain interactions

const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      // Ethereum wallet address (connected via MetaMask)
    },
    organization: {
      type: String,
      trim: true,
    },
    // Total ETH donated across all transactions
    totalDonated: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donor', donorSchema);
