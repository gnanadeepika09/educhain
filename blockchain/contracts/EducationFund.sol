// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EducationFund
 * @dev Smart contract for managing education fund donations and allocations.
 *
 * This contract is the backbone of EduChain's transparency layer.
 * All donations and fund allocations are recorded here permanently on the blockchain.
 *
 * Key design decisions:
 * - Personal student data (name, college, etc.) is NOT stored here (stored in MongoDB)
 * - Only financial records with IDs are stored on-chain
 * - Admin allocates funds off-chain via MetaMask, the transaction is then verified here
 * - Prevents double-spending by tracking available funds per request
 */
contract EducationFund {
    // ===== STATE VARIABLES =====

    address public owner; // The admin/deployer of the contract
    uint256 public totalDonationsWei; // Total ETH received (in Wei)
    uint256 public totalAllocatedWei; // Total ETH allocated to students

    // Tracks donated amount per funding request (by MongoDB ObjectId as bytes32)
    mapping(bytes32 => uint256) public donationsPerRequest;

    // Tracks allocated amount per funding request
    mapping(bytes32 => uint256) public allocationsPerRequest;

    // ===== STRUCTS =====

    struct Donation {
        address donor;          // MetaMask wallet of donor
        bytes32 requestId;      // MongoDB FundingRequest ID
        uint256 amount;         // Amount in Wei
        uint256 timestamp;      // Block timestamp
    }

    struct Allocation {
        bytes32 requestId;      // MongoDB FundingRequest ID
        bytes32 studentId;      // MongoDB Student User ID
        uint256 amount;         // Amount allocated in Wei
        uint256 timestamp;
    }

    // Store all donations and allocations
    Donation[] public donations;
    Allocation[] public allocations;

    // ===== EVENTS =====
    // Events are emitted on every transaction - visible in Ganache logs and MetaMask

    event DonationReceived(
        address indexed donor,
        bytes32 indexed requestId,
        uint256 amount,
        uint256 donationIndex,
        uint256 timestamp
    );

    event FundsAllocated(
        bytes32 indexed requestId,
        bytes32 indexed studentId,
        uint256 amount,
        uint256 allocationIndex,
        uint256 timestamp
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ===== MODIFIERS =====

    modifier onlyOwner() {
        require(msg.sender == owner, "EducationFund: Only owner can call this function");
        _;
    }

    modifier validAmount() {
        require(msg.value > 0, "EducationFund: Amount must be greater than zero");
        _;
    }

    // ===== CONSTRUCTOR =====

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ===== MAIN FUNCTIONS =====

    /**
     * @dev Donor donates ETH for a specific funding request
     * @param requestId MongoDB FundingRequest ObjectId (as bytes32)
     *
     * Called when donor clicks "Donate" and approves MetaMask transaction.
     * ETH is sent to this contract and tracked per request.
     */
    function donate(bytes32 requestId) external payable validAmount {
        require(requestId != bytes32(0), "EducationFund: Invalid request ID");

        // Record the donation
        donations.push(Donation({
            donor: msg.sender,
            requestId: requestId,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        // Update mappings
        donationsPerRequest[requestId] += msg.value;
        totalDonationsWei += msg.value;

        emit DonationReceived(
            msg.sender,
            requestId,
            msg.value,
            donations.length - 1,
            block.timestamp
        );
    }

    /**
     * @dev Admin allocates funds to an approved student
     * @param requestId MongoDB FundingRequest ObjectId
     * @param studentId MongoDB Student User ID
     * @param amount Amount to allocate in Wei
     *
     * Admin calls this to record an allocation on-chain.
     * The actual ETH transfer to student happens off-chain via admin's MetaMask.
     */
    function allocateFunds(
        bytes32 requestId,
        bytes32 studentId,
        uint256 amount
    ) external onlyOwner {
        require(requestId != bytes32(0), "EducationFund: Invalid request ID");
        require(studentId != bytes32(0), "EducationFund: Invalid student ID");
        require(amount > 0, "EducationFund: Amount must be greater than zero");

        // Check that enough funds are available for this request
        uint256 available = donationsPerRequest[requestId] - allocationsPerRequest[requestId];
        require(amount <= available, "EducationFund: Insufficient funds for this request");

        // Record allocation
        allocations.push(Allocation({
            requestId: requestId,
            studentId: studentId,
            amount: amount,
            timestamp: block.timestamp
        }));

        allocationsPerRequest[requestId] += amount;
        totalAllocatedWei += amount;

        emit FundsAllocated(
            requestId,
            studentId,
            amount,
            allocations.length - 1,
            block.timestamp
        );
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @dev Get available (unallocated) funds for a specific request
     */
    function getAvailableFunds(bytes32 requestId) external view returns (uint256) {
        return donationsPerRequest[requestId] - allocationsPerRequest[requestId];
    }

    /**
     * @dev Get total contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get total number of donations
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    /**
     * @dev Get total number of allocations
     */
    function getAllocationCount() external view returns (uint256) {
        return allocations.length;
    }

    /**
     * @dev Get donation details by index
     */
    function getDonation(uint256 index) external view returns (
        address donor,
        bytes32 requestId,
        uint256 amount,
        uint256 timestamp
    ) {
        require(index < donations.length, "EducationFund: Index out of bounds");
        Donation memory d = donations[index];
        return (d.donor, d.requestId, d.amount, d.timestamp);
    }

    /**
     * @dev Transfer contract ownership to new admin
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "EducationFund: Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Withdraw remaining contract balance (emergency use by owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "EducationFund: No balance to withdraw");
        payable(owner).transfer(balance);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}

