// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GarlawsPropertyNFT.sol";

/**
 * @title PropertyStakingRewards
 * @dev Contract for staking property NFTs to earn rewards
 * @notice Property owners can stake their NFTs to earn platform rewards
 */
contract PropertyStakingRewards is Ownable, ReentrancyGuard {
    // Interfaces
    IERC20 public immutable rewardsToken; // GARLAWS token or other reward token
    GarlawsPropertyNFT public immutable propertyNFT;

    struct StakeInfo {
        uint256 tokenId;
        address owner;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        uint256 accumulatedRewards;
    }

    struct RewardTier {
        uint256 minValuation; // Minimum property valuation for this tier
        uint256 rewardRate; // Rewards per second (in wei)
        uint256 lockPeriod; // Minimum staking period in seconds
    }

    // State variables
    mapping(uint256 => StakeInfo) public stakes;
    mapping(address => uint256[]) public stakerTokens;
    RewardTier[] public rewardTiers;

    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public rewardRateUpdateTime;
    uint256 public constant REWARD_RATE_PRECISION = 1e18;

    // Events
    event PropertyStaked(uint256 indexed tokenId, address indexed owner, uint256 valuation);
    event PropertyUnstaked(uint256 indexed tokenId, address indexed owner);
    event RewardsClaimed(address indexed staker, uint256 amount);
    event RewardTierAdded(uint256 minValuation, uint256 rewardRate, uint256 lockPeriod);

    constructor(address _rewardsToken, address _propertyNFT) {
        rewardsToken = IERC20(_rewardsToken);
        propertyNFT = GarlawsPropertyNFT(_propertyNFT);

        // Initialize default reward tiers
        _addRewardTier(0, 1e15, 30 days); // 0.001 GARLAWS per second for any property
        _addRewardTier(1000000 ether, 2e15, 60 days); // 0.002 GARLAWS per second for 1M+ valuation
        _addRewardTier(5000000 ether, 5e15, 90 days); // 0.005 GARLAWS per second for 5M+ valuation
    }

    /**
     * @dev Stake a property NFT to earn rewards
     * @param tokenId The token ID of the property NFT to stake
     */
    function stakeProperty(uint256 tokenId) external nonReentrant {
        require(propertyNFT.ownerOf(tokenId) == msg.sender, "Not the owner of this property");
        require(stakes[tokenId].owner == address(0), "Property already staked");

        // Transfer NFT to this contract
        propertyNFT.transferFrom(msg.sender, address(this), tokenId);

        // Get property valuation for reward tier calculation
        (, uint256 valuation,,,,,,) = propertyNFT.getPropertyDetails(tokenId);

        stakes[tokenId] = StakeInfo({
            tokenId: tokenId,
            owner: msg.sender,
            stakedAt: block.timestamp,
            lastRewardClaim: block.timestamp,
            accumulatedRewards: 0
        });

        stakerTokens[msg.sender].push(tokenId);
        totalStaked++;

        emit PropertyStaked(tokenId, msg.sender, valuation);
    }

    /**
     * @dev Unstake a property NFT
     * @param tokenId The token ID of the property to unstake
     */
    function unstakeProperty(uint256 tokenId) external nonReentrant {
        StakeInfo storage stake = stakes[tokenId];
        require(stake.owner == msg.sender, "Not the owner of this stake");

        // Check minimum lock period
        uint256 lockPeriod = _getRewardTierLockPeriod(tokenId);
        require(block.timestamp >= stake.stakedAt + lockPeriod, "Lock period not expired");

        // Claim any pending rewards before unstaking
        _claimRewards(tokenId);

        // Transfer NFT back to owner
        propertyNFT.transferFrom(address(this), msg.sender, tokenId);

        // Remove from staker's token list
        _removeTokenFromStaker(msg.sender, tokenId);

        delete stakes[tokenId];
        totalStaked--;

        emit PropertyUnstaked(tokenId, msg.sender);
    }

    /**
     * @dev Claim accumulated rewards for a staked property
     * @param tokenId The token ID of the staked property
     */
    function claimRewards(uint256 tokenId) external nonReentrant {
        _claimRewards(tokenId);
    }

    /**
     * @dev Claim rewards for all staked properties of the caller
     */
    function claimAllRewards() external nonReentrant {
        uint256[] memory tokens = stakerTokens[msg.sender];
        uint256 totalClaimable = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenId = tokens[i];
            StakeInfo storage stake = stakes[tokenId];

            if (stake.owner == msg.sender) {
                uint256 claimable = _calculateRewards(tokenId);
                stake.accumulatedRewards = 0;
                stake.lastRewardClaim = block.timestamp;
                totalClaimable += claimable;
            }
        }

        require(totalClaimable > 0, "No rewards to claim");
        require(rewardsToken.balanceOf(address(this)) >= totalClaimable, "Insufficient reward tokens");

        rewardsToken.transfer(msg.sender, totalClaimable);
        totalRewardsDistributed += totalClaimable;

        emit RewardsClaimed(msg.sender, totalClaimable);
    }

    /**
     * @dev Get pending rewards for a staked property
     * @param tokenId The token ID of the staked property
     * @return Pending rewards amount
     */
    function getPendingRewards(uint256 tokenId) external view returns (uint256) {
        return _calculateRewards(tokenId);
    }

    /**
     * @dev Get total pending rewards for an address
     * @param staker The address of the staker
     * @return Total pending rewards
     */
    function getTotalPendingRewards(address staker) external view returns (uint256) {
        uint256[] memory tokens = stakerTokens[staker];
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            totalRewards += _calculateRewards(tokens[i]);
        }

        return totalRewards;
    }

    /**
     * @dev Get staked properties for an address
     * @param staker The address of the staker
     * @return Array of staked token IDs
     */
    function getStakedProperties(address staker) external view returns (uint256[] memory) {
        return stakerTokens[staker];
    }

    /**
     * @dev Add a new reward tier
     * @param minValuation Minimum property valuation for this tier
     * @param rewardRate Reward rate per second
     * @param lockPeriod Minimum lock period
     */
    function addRewardTier(uint256 minValuation, uint256 rewardRate, uint256 lockPeriod) external onlyOwner {
        _addRewardTier(minValuation, rewardRate, lockPeriod);
    }

    /**
     * @dev Update reward rate for a specific tier
     * @param tierIndex Index of the tier to update
     * @param newRewardRate New reward rate per second
     */
    function updateRewardRate(uint256 tierIndex, uint256 newRewardRate) external onlyOwner {
        require(tierIndex < rewardTiers.length, "Invalid tier index");
        rewardTiers[tierIndex].rewardRate = newRewardRate;
        rewardRateUpdateTime = block.timestamp;
    }

    /**
     * @dev Deposit reward tokens to the contract
     * @param amount Amount of tokens to deposit
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(rewardsToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    /**
     * @dev Emergency withdraw function for owner
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(rewardsToken.transfer(msg.sender, amount), "Transfer failed");
    }

    // Internal functions

    function _claimRewards(uint256 tokenId) internal {
        StakeInfo storage stake = stakes[tokenId];
        require(stake.owner != address(0), "Property not staked");

        uint256 claimable = _calculateRewards(tokenId);
        require(claimable > 0, "No rewards to claim");
        require(rewardsToken.balanceOf(address(this)) >= claimable, "Insufficient reward tokens");

        stake.accumulatedRewards = 0;
        stake.lastRewardClaim = block.timestamp;

        rewardsToken.transfer(stake.owner, claimable);
        totalRewardsDistributed += claimable;

        emit RewardsClaimed(stake.owner, claimable);
    }

    function _calculateRewards(uint256 tokenId) internal view returns (uint256) {
        StakeInfo memory stake = stakes[tokenId];
        if (stake.owner == address(0)) return 0;

        uint256 rewardRate = _getRewardRate(tokenId);
        uint256 timeElapsed = block.timestamp - stake.lastRewardClaim;
        uint256 newRewards = (timeElapsed * rewardRate) / REWARD_RATE_PRECISION;

        return stake.accumulatedRewards + newRewards;
    }

    function _getRewardRate(uint256 tokenId) internal view returns (uint256) {
        (, uint256 valuation,,,,,,) = propertyNFT.getPropertyDetails(tokenId);

        // Find the highest tier that the property qualifies for
        for (uint256 i = rewardTiers.length; i > 0; i--) {
            if (valuation >= rewardTiers[i-1].minValuation) {
                return rewardTiers[i-1].rewardRate;
            }
        }

        return 0;
    }

    function _getRewardTierLockPeriod(uint256 tokenId) internal view returns (uint256) {
        (, uint256 valuation,,,,,,) = propertyNFT.getPropertyDetails(tokenId);

        // Find the highest tier that the property qualifies for
        for (uint256 i = rewardTiers.length; i > 0; i--) {
            if (valuation >= rewardTiers[i-1].minValuation) {
                return rewardTiers[i-1].lockPeriod;
            }
        }

        return 30 days; // Default lock period
    }

    function _addRewardTier(uint256 minValuation, uint256 rewardRate, uint256 lockPeriod) internal {
        rewardTiers.push(RewardTier({
            minValuation: minValuation,
            rewardRate: rewardRate,
            lockPeriod: lockPeriod
        }));

        emit RewardTierAdded(minValuation, rewardRate, lockPeriod);
    }

    function _removeTokenFromStaker(address staker, uint256 tokenId) internal {
        uint256[] storage tokens = stakerTokens[staker];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    // View functions for frontend

    function getRewardTiersCount() external view returns (uint256) {
        return rewardTiers.length;
    }

    function getRewardTier(uint256 index) external view returns (uint256, uint256, uint256) {
        require(index < rewardTiers.length, "Invalid tier index");
        RewardTier memory tier = rewardTiers[index];
        return (tier.minValuation, tier.rewardRate, tier.lockPeriod);
    }

    function getStakingStats() external view returns (uint256, uint256, uint256) {
        return (totalStaked, totalRewardsDistributed, rewardTiers.length);
    }
}