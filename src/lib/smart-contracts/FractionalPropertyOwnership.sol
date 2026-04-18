// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FractionalPropertyOwnership
 * @dev ERC20 token contract for fractional property ownership
 * @notice This contract allows multiple investors to own shares in a property
 */
contract FractionalPropertyOwnership is ERC20, Ownable, ReentrancyGuard {
    struct PropertyInfo {
        string propertyAddress;
        uint256 totalValuation; // in wei
        uint256 totalShares;
        uint256 sharePrice; // in wei per share
        address propertyNFT; // Address of the corresponding NFT contract
        uint256 nftTokenId; // Token ID of the property NFT
        bool initialized;
    }

    struct DividendDistribution {
        uint256 amount;
        uint256 timestamp;
        string description;
        mapping(address => bool) claimed;
    }

    PropertyInfo public propertyInfo;

    // Dividend distributions
    DividendDistribution[] public dividendDistributions;
    uint256 public totalDividendsDistributed;

    // Investment tracking
    mapping(address => uint256) public investmentAmount;
    mapping(address => uint256) public lastDividendClaim;

    // Events
    event SharesPurchased(address indexed buyer, uint256 shareAmount, uint256 totalCost);
    event SharesSold(address indexed seller, uint256 shareAmount, uint256 totalReceived);
    event DividendDistributed(uint256 amount, string description);
    event DividendClaimed(address indexed claimant, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        string memory propertyAddress,
        uint256 totalValuation,
        uint256 totalShares,
        address propertyNFT_,
        uint256 nftTokenId_
    ) ERC20(name, symbol) {
        require(totalShares > 0, "Total shares must be greater than 0");
        require(totalValuation > 0, "Total valuation must be greater than 0");

        propertyInfo = PropertyInfo({
            propertyAddress: propertyAddress,
            totalValuation: totalValuation,
            totalShares: totalShares,
            sharePrice: totalValuation / totalShares,
            propertyNFT: propertyNFT_,
            nftTokenId: nftTokenId_,
            initialized: true
        });

        // Mint all shares to the contract initially
        _mint(address(this), totalShares);
    }

    /**
     * @dev Purchase shares in the property
     * @param shareAmount Number of shares to purchase
     */
    function buyShares(uint256 shareAmount) public payable nonReentrant {
        require(shareAmount > 0, "Share amount must be greater than 0");
        require(shareAmount <= balanceOf(address(this)), "Insufficient shares available");

        uint256 totalCost = shareAmount * propertyInfo.sharePrice;
        require(msg.value >= totalCost, "Insufficient payment");

        // Transfer shares from contract to buyer
        _transfer(address(this), msg.sender, shareAmount);

        // Track investment
        investmentAmount[msg.sender] += totalCost;

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit SharesPurchased(msg.sender, shareAmount, totalCost);
    }

    /**
     * @dev Sell shares back to the contract
     * @param shareAmount Number of shares to sell
     */
    function sellShares(uint256 shareAmount) public nonReentrant {
        require(shareAmount > 0, "Share amount must be greater than 0");
        require(balanceOf(msg.sender) >= shareAmount, "Insufficient shares owned");

        uint256 totalValue = shareAmount * getCurrentSharePrice();
        require(address(this).balance >= totalValue, "Insufficient contract balance");

        // Transfer shares from seller to contract
        _transfer(msg.sender, address(this), shareAmount);

        // Pay seller
        payable(msg.sender).transfer(totalValue);

        // Update investment tracking
        uint256 shareValue = shareAmount * propertyInfo.sharePrice;
        if (investmentAmount[msg.sender] >= shareValue) {
            investmentAmount[msg.sender] -= shareValue;
        } else {
            investmentAmount[msg.sender] = 0;
        }

        emit SharesSold(msg.sender, shareAmount, totalValue);
    }

    /**
     * @dev Distribute dividends to all shareholders
     * @param description Description of the dividend (e.g., "Monthly rental income")
     */
    function distributeDividends(string memory description) public payable onlyOwner {
        require(msg.value > 0, "Dividend amount must be greater than 0");

        DividendDistribution storage newDistribution = dividendDistributions.push();
        newDistribution.amount = msg.value;
        newDistribution.timestamp = block.timestamp;
        newDistribution.description = description;

        totalDividendsDistributed += msg.value;

        emit DividendDistributed(msg.value, description);
    }

    /**
     * @dev Claim dividends for the caller
     */
    function claimDividends() public nonReentrant {
        uint256 shareholderBalance = balanceOf(msg.sender);
        require(shareholderBalance > 0, "No shares owned");

        uint256 totalClaimable = 0;

        for (uint256 i = lastDividendClaim[msg.sender]; i < dividendDistributions.length; i++) {
            DividendDistribution storage distribution = dividendDistributions[i];

            if (!distribution.claimed[msg.sender]) {
                // Calculate share of dividend based on ownership percentage
                uint256 shareholderShare = (shareholderBalance * distribution.amount) / propertyInfo.totalShares;
                totalClaimable += shareholderShare;
                distribution.claimed[msg.sender] = true;
            }
        }

        require(totalClaimable > 0, "No dividends available to claim");
        require(address(this).balance >= totalClaimable, "Insufficient contract balance");

        lastDividendClaim[msg.sender] = dividendDistributions.length;
        payable(msg.sender).transfer(totalClaimable);

        emit DividendClaimed(msg.sender, totalClaimable);
    }

    /**
     * @dev Get current share price (may be different from initial price)
     * @return Current share price in wei
     */
    function getCurrentSharePrice() public view returns (uint256) {
        // In a real implementation, this could be based on property valuation updates
        // For simplicity, we'll return the initial share price
        return propertyInfo.sharePrice;
    }

    /**
     * @dev Get shareholder's ownership percentage
     * @param shareholder Address of the shareholder
     * @return Percentage ownership (0-10000, where 10000 = 100%)
     */
    function getOwnershipPercentage(address shareholder) public view returns (uint256) {
        uint256 balance = balanceOf(shareholder);
        return (balance * 10000) / propertyInfo.totalShares;
    }

    /**
     * @dev Get total value of shareholder's investment
     * @param shareholder Address of the shareholder
     * @return Total value in wei
     */
    function getShareholderValue(address shareholder) public view returns (uint256) {
        return balanceOf(shareholder) * getCurrentSharePrice();
    }

    /**
     * @dev Get available shares for purchase
     * @return Number of shares available
     */
    function getAvailableShares() public view returns (uint256) {
        return balanceOf(address(this));
    }

    /**
     * @dev Get dividend distributions count
     * @return Number of dividend distributions
     */
    function getDividendDistributionsCount() public view returns (uint256) {
        return dividendDistributions.length;
    }

    /**
     * @dev Get dividend distribution details
     * @param index Index of the distribution
     * @return amount, timestamp, description, claimed status
     */
    function getDividendDistribution(uint256 index) public view returns (
        uint256 amount,
        uint256 timestamp,
        string memory description,
        bool claimed
    ) {
        require(index < dividendDistributions.length, "Invalid distribution index");

        DividendDistribution storage distribution = dividendDistributions[index];
        return (
            distribution.amount,
            distribution.timestamp,
            distribution.description,
            distribution.claimed[msg.sender]
        );
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     */
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback function to receive ether (for dividends)
    receive() external payable {}
}