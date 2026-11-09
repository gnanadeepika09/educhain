// utils/blockchain.js
// Utility to connect to Ganache and interact with the smart contract
// Used by the backend to verify transactions

const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Get a provider connected to Ganache
const getProvider = () => {
  const rpcUrl = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Get contract ABI from compiled artifacts
const getContractABI = () => {
  try {
    // Path to compiled contract artifact (after running 'npx hardhat compile')
    const artifactPath = path.join(
      __dirname,
      '../../blockchain/artifacts/contracts/EducationFund.sol/EducationFund.json'
    );

    if (!fs.existsSync(artifactPath)) {
      console.warn('⚠️  Contract artifact not found. Run: cd blockchain && npx hardhat compile');
      return null;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    console.error('Error loading contract ABI:', error.message);
    return null;
  }
};

// Get a read-only contract instance
const getContract = () => {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.warn('⚠️  CONTRACT_ADDRESS not set in .env');
    return null;
  }

  const abi = getContractABI();
  if (!abi) return null;

  const provider = getProvider();
  return new ethers.Contract(contractAddress, abi, provider);
};

// Test connection to Ganache
const testConnection = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    console.log(`✅ Connected to blockchain network: chainId ${network.chainId}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  Could not connect to Ganache: ${error.message}`);
    return false;
  }
};

module.exports = { getProvider, getContract, getContractABI, testConnection };
