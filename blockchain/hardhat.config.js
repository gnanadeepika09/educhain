// hardhat.config.js
// Hardhat configuration for EduChain smart contract development
// Configured to deploy to local Ganache instance

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local Ganache network configuration
    ganache: {
      url: "http://127.0.0.1:7545",
      // Ganache provides test accounts with ETH
      // We use the first account (index 0) as the deployer/admin
      // chainId for Ganache GUI is usually 1337
      chainId: 1337,
    },
    // Hardhat's built-in local network (for testing without Ganache)
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

