// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title  WorkRegistry
 * @author AetherCredit Team
 * @notice Immutable registry of TEE-verified 0G Compute inference job receipts.
 *
 * @dev    Every AI agent on 0G that wants credit must first prove it has done
 *         real verifiable work on 0G Compute. This contract stores that proof.
 *
 *         HOW RECEIPTS ARE GENERATED
 *         1. Agent runs inference job on 0G Compute provider
 *         2. Agent captures chatID = response.headers.get("ZG-Res-Key")
 *         3. Agent calls broker.inference.processResponse(provider, chatID)
 *         4. Agent submits receipt to this contract
 *
 *         SYBIL RESISTANCE
 *         - Duplicate prevention: each chatIDHash submitted once per agent
 *         - Minimum cost threshold: jobs < MIN_COMPUTE_COST_WEI excluded
 *
 *         0G Stack: Deployed on 0G Chain (ChainID: 16661)
 *         Part of AetherCredit — Track 3, Agentic Economy
 *         0G APAC Hackathon 2026
 */
contract WorkRegistry {

    // =========================================================================
    // Structs
    // =========================================================================

    struct WorkRecord {
        address agent;
        address provider;
        bytes32 chatIDHash;
        bytes32 responseHash;
        uint256 computeCostWei;
        uint256 timestamp;
        bool    teeVerified;
    }

    // =========================================================================
    // Constants
    // =========================================================================

    /// @notice Minimum OG wei a job must cost to qualify for credit scoring.
    /// @dev 0.0001 OG = 1e14 wei. Prevents sybil attacks via spam of tiny jobs.
    uint256 public constant MIN_COMPUTE_COST_WEI = 1e14;

    // =========================================================================
    // Storage
    // =========================================================================

    /// @notice Work history per agent. Append-only. Never deleted.
    mapping(address => WorkRecord[]) private _workHistory;

    /// @notice Deduplication: agent => chatIDHash => submitted
    mapping(address => mapping(bytes32 => bool)) private _submittedChatIDs;

    // =========================================================================
    // Events
    // =========================================================================

    event WorkSubmitted(
        address indexed agent,
        address indexed provider,
        bytes32 indexed chatIDHash,
        uint256         computeCostWei,
        bool            teeVerified,
        bool            countsTowardScore,
        uint256         timestamp
    );

    // =========================================================================
    // Errors
    // =========================================================================

    error DuplicateChatID(bytes32 chatIDHash);
    error ZeroComputeCost();
    error InvalidProvider();

    // =========================================================================
    // Write
    // =========================================================================

    /**
     * @notice Submit a completed 0G Compute job to build credit history.
     * @param provider        0G Compute provider address
     * @param chatIDHash      keccak256(toUtf8Bytes(chatID from ZG-Res-Key header))
     * @param responseHash    keccak256(toUtf8Bytes(response body))
     * @param computeCostWei  OG wei paid for this inference job
     * @param teeVerified     Result of broker.inference.processResponse()
     */
    function submitWork(
        address provider,
        bytes32 chatIDHash,
        bytes32 responseHash,
        uint256 computeCostWei,
        bool    teeVerified
    ) external {
        if (provider == address(0))              revert InvalidProvider();
        if (computeCostWei == 0)                 revert ZeroComputeCost();
        if (_submittedChatIDs[msg.sender][chatIDHash]) revert DuplicateChatID(chatIDHash);

        _submittedChatIDs[msg.sender][chatIDHash] = true;

        bool countsTowardScore = teeVerified && (computeCostWei >= MIN_COMPUTE_COST_WEI);

        _workHistory[msg.sender].push(WorkRecord({
            agent:          msg.sender,
            provider:       provider,
            chatIDHash:     chatIDHash,
            responseHash:   responseHash,
            computeCostWei: computeCostWei,
            timestamp:      block.timestamp,
            teeVerified:    teeVerified
        }));

        emit WorkSubmitted(
            msg.sender,
            provider,
            chatIDHash,
            computeCostWei,
            teeVerified,
            countsTowardScore,
            block.timestamp
        );
    }

    // =========================================================================
    // Read
    // =========================================================================

    function getJobCount(address agent)
        external view returns (uint256)
    {
        return _workHistory[agent].length;
    }

    function getWorkRecord(address agent, uint256 index)
        external view returns (WorkRecord memory)
    {
        return _workHistory[agent][index];
    }

    function getAllWorkRecords(address agent)
        external view returns (WorkRecord[] memory)
    {
        return _workHistory[agent];
    }

    function isSubmitted(address agent, bytes32 chatIDHash)
        external view returns (bool)
    {
        return _submittedChatIDs[agent][chatIDHash];
    }

    function getVerifiedJobCount(address agent)
        public view returns (uint256 count)
    {
        WorkRecord[] storage records = _workHistory[agent];
        for (uint256 i = 0; i < records.length; ) {
            if (records[i].teeVerified && records[i].computeCostWei >= MIN_COMPUTE_COST_WEI) {
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
    }

    function getVerifiedComputeSpend(address agent)
        public view returns (uint256 total)
    {
        WorkRecord[] storage records = _workHistory[agent];
        for (uint256 i = 0; i < records.length; ) {
            if (records[i].teeVerified && records[i].computeCostWei >= MIN_COMPUTE_COST_WEI) {
                unchecked { total += records[i].computeCostWei; }
            }
            unchecked { ++i; }
        }
    }

    function getScoringInputs(address agent)
        external view returns (uint256 verifiedJobs, uint256 totalSpendWei)
    {
        WorkRecord[] storage records = _workHistory[agent];
        for (uint256 i = 0; i < records.length; ) {
            if (records[i].teeVerified && records[i].computeCostWei >= MIN_COMPUTE_COST_WEI) {
                unchecked { ++verifiedJobs; }
                unchecked { totalSpendWei += records[i].computeCostWei; }
            }
            unchecked { ++i; }
        }
    }
}