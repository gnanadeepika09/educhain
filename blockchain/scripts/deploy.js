// scripts/deploy.js
// Deployment script for the EducationFund smart contract
// Run with: npx hardhat run scripts/deploy.js --network ganache

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting EduChain contract deployment...");
  console.log("================================================");

  // Get the deployer account (first Ganache account)
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deploying with account: ${deployer.address}`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("Deployer account has no ETH. Make sure Ganache is running.");
  }

  // Deploy the EducationFund contract
  console.log("\n📝 Compiling and deploying EducationFund contract...");
  const EducationFund = await ethers.getContractFactory("EducationFund");
  const contract = await EducationFund.deploy();

  // Wait for deployment transaction to be mined
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`\n✅ EducationFund deployed successfully!`);
  console.log(`📍 Contract Address: ${contractAddress}`);

  // Verify owner
  const owner = await contract.owner();
  console.log(`👤 Contract Owner:   ${owner}`);

  // Save deployment info
  const deploymentInfo = {
    network: "ganache",
    contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../artifacts/contracts/EducationFund.sol/EducationFund.json"),
        "utf8"
      )
    ).abi,
  };

  // Save to deployment.json for reference
  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Instructions for next steps
  console.log("\n================================================");
  console.log("🎯 NEXT STEPS:");
  console.log("================================================");
  console.log(`1. Copy the contract address: ${contractAddress}`);
  console.log("2. Open server/.env file");
  console.log(`3. Set: CONTRACT_ADDRESS=${contractAddress}`);
  console.log("4. Restart the backend server");
  console.log("5. Update the frontend .env file with the same address");
  console.log("================================================\n");
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

