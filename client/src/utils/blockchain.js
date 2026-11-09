// src/utils/blockchain.js
// Frontend blockchain utilities using Ethers.js + MetaMask
// Handles wallet connection and smart contract calls

import { ethers } from 'ethers';

const GANACHE_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || '1337';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ABI - only the functions we need on the frontend
const CONTRACT_ABI = [
  "function donate(bytes32 requestId) external payable",
  "function allocateFunds(bytes32 requestId, bytes32 studentId, uint256 amount) external",
  "function getAvailableFunds(bytes32 requestId) external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function getDonationCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event DonationReceived(address indexed donor, bytes32 indexed requestId, uint256 amount, uint256 donationIndex, uint256 timestamp)",
  "event FundsAllocated(bytes32 indexed requestId, bytes32 indexed studentId, uint256 amount, uint256 allocationIndex, uint256 timestamp)"
];

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Connect MetaMask wallet and return address
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask browser extension.');
  }

  // Request account access
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please unlock MetaMask.');
  }

  return accounts[0];
};

// Get current connected account (without popup)
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) return null;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts.length > 0 ? accounts[0] : null;
};

// Get ethers.js provider from MetaMask
export const getProvider = () => {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask not installed');
  return new ethers.BrowserProvider(window.ethereum);
};

// Get contract instance for read-only calls
export const getReadContract = async () => {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured. Set VITE_CONTRACT_ADDRESS in .env');
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Get contract instance with signer (for write calls = transactions)
export const getWriteContract = async () => {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured. Set VITE_CONTRACT_ADDRESS in .env');
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Convert MongoDB ObjectId string to bytes32 for smart contract
// MongoDB ObjectId is 24 hex chars, we pad it to 32 bytes
export const objectIdToBytes32 = (objectId) => {
  // Pad the 24-char hex ObjectId to 32 bytes (64 hex chars)
  return ethers.zeroPadBytes('0x' + objectId, 32);
};

/**
 * Donor donates ETH to a funding request via smart contract
 * @param {string} requestId - MongoDB FundingRequest ObjectId
 * @param {string} amountEth - Amount in ETH (e.g., "0.1")
 * @returns {object} - { transactionHash, blockNumber }
 */
export const donateToRequest = async (requestId, amountEth) => {
  const contract = await getWriteContract();
  const requestIdBytes32 = objectIdToBytes32(requestId);
  const amountWei = ethers.parseEther(amountEth.toString());

  console.log(`Donating ${amountEth} ETH for request ${requestId}`);

  // This triggers MetaMask popup for user approval
  const tx = await contract.donate(requestIdBytes32, { value: amountWei });

  console.log('Transaction submitted:', tx.hash);

  // Wait for 1 confirmation
  const receipt = await tx.wait(1);
  console.log('Transaction confirmed at block:', receipt.blockNumber);

  return {
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
  };
};

// Switch MetaMask to Ganache network
export const switchToGanache = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(GANACHE_CHAIN_ID).toString(16)}` }],
    });
  } catch (switchError) {
    // Network not added yet, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${parseInt(GANACHE_CHAIN_ID).toString(16)}`,
          chainName: 'Ganache Local',
          rpcUrls: [import.meta.env.VITE_GANACHE_RPC || 'http://127.0.0.1:7545'],
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        }],
      });
    } else {
      throw switchError;
    }
  }
};

// Format wei to ETH string
export const weiToEth = (wei) => {
  return ethers.formatEther(wei);
};

// Format ETH amount nicely
export const formatEth = (amount) => {
  return parseFloat(amount).toFixed(4) + ' ETH';
};

