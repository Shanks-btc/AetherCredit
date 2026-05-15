// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./WorkRegistry.sol";

/**
 * @title  CreditScorer
 * @author AetherCredit Team
 * @notice Calculates transparent on-chain credit scores for AI agents.
 *
 * SCORING FORMULA
 * ────────────────
 * jobScore   = verifiedJobs * 40
 * spendScore = totalSpendWei / 1e14
 * ageScore   = min(100, accountAgeDays)
 * score      = min(1000, jobScore + spendScore + ageScore)
 * limitWei   = min(2e18, score * 2e15)
 *
 * 0G Stack: Deployed on 0G Chain (ChainID: 16661)
 * Part of AetherCredit — Track 3, Agentic Economy
 * 0G APAC Hackathon 2026
 */
contract CreditScorer {

    struct CreditProfile {
        uint256 score;
        uint256 limitWei;
        uint256 verifiedJobs;
        uint256 totalSpendWei;
        uint256 lastUpdated;
    }

    WorkRegistry public immutable registry;

    uint256 public constant SCORE_PER_JOB         = 40;
    uint256 public constant SPEND_DIVISOR         = 1e14;
    uint256 public constant MAX_SCORE             = 1000;
    uint256 public constant LIMIT_PER_SCORE_POINT = 2e15;
    uint256 public constant MAX_LIMIT_WEI         = 2e18;

    mapping(address => CreditProfile) private _profiles;
    mapping(address => uint256) public firstJobTimestamp;

    event ProfileRefreshed(
        address indexed agent,
        uint256 score,
        uint256 limitWei,
        uint256 verifiedJobs,
        uint256 totalSpendWei,
        uint256 timestamp
    );

    error InvalidRegistry();

    constructor(address _registry) {
        if (_registry == address(0)) revert InvalidRegistry();
        registry = WorkRegistry(_registry);
    }

    function calculateScore(address agent)
        public view returns (uint256 score, uint256 limitWei)
    {
        (uint256 verifiedJobs, uint256 totalSpendWei) =
            registry.getScoringInputs(agent);

        uint256 jobScore   = verifiedJobs * SCORE_PER_JOB;
        uint256 spendScore = totalSpendWei / SPEND_DIVISOR;

        uint256 ageScore = 0;
        uint256 firstJob = firstJobTimestamp[agent];
        if (firstJob > 0) {
            uint256 ageDays = (block.timestamp - firstJob) / 1 days;
            ageScore = ageDays > 100 ? 100 : ageDays;
        }

        uint256 rawScore = jobScore + spendScore + ageScore;
        score = rawScore > MAX_SCORE ? MAX_SCORE : rawScore;

        uint256 rawLimit = score * LIMIT_PER_SCORE_POINT;
        limitWei = rawLimit > MAX_LIMIT_WEI ? MAX_LIMIT_WEI : rawLimit;
    }

    function qualifies(address agent, uint256 amountWei)
        external view returns (bool)
    {
        (, uint256 limitWei) = calculateScore(agent);
        return amountWei <= limitWei;
    }

    function recordFirstJob(address agent) external {
        if (firstJobTimestamp[agent] == 0) {
            firstJobTimestamp[agent] = block.timestamp;
        }
    }

    function refreshProfile(address agent)
        external returns (CreditProfile memory profile)
    {
        (uint256 score, uint256 limitWei) = calculateScore(agent);
        (uint256 verifiedJobs, uint256 totalSpendWei) =
            registry.getScoringInputs(agent);

        profile = CreditProfile({
            score:         score,
            limitWei:      limitWei,
            verifiedJobs:  verifiedJobs,
            totalSpendWei: totalSpendWei,
            lastUpdated:   block.timestamp
        });

        _profiles[agent] = profile;

        emit ProfileRefreshed(
            agent, score, limitWei,
            verifiedJobs, totalSpendWei,
            block.timestamp
        );
    }

    function getProfile(address agent)
        external view returns (CreditProfile memory)
    {
        return _profiles[agent];
    }
}