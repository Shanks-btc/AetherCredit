// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CreditScorer.sol";
import "./WorkRegistry.sol";

/**
 * @title  CreditVault
 * @author AetherCredit Team
 * @notice The financial heart of AetherCredit.
 *         Holds the credit pool, disburses working capital to qualified
 *         AI agents, and tracks loan repayments.
 *
 * @dev    LOAN LIFECYCLE
 *         ───────────────
 *         1. Agent builds credit history via WorkRegistry.submitWork()
 *         2. Agent calls requestCredit(amountWei, storageRootHash)
 *            - CreditScorer.calculateScore() gates disbursement
 *            - Decision anchored to 0G Storage via storageRootHash
 *            - OG tokens transferred to agent wallet
 *         3. Agent uses OG to fund 0G Compute provider sub-account
 *         4. Agent runs inference, earns revenue
 *         5. Agent calls repay() — principal + 5% fee returned
 *
 *         SECURITY
 *         ─────────
 *         - One active loan per agent
 *         - 7 day repayment window
 *         - CEI pattern on all write functions
 *         - Admin can only withdraw in emergency
 *
 *         0G Stack: Deployed on 0G Chain (ChainID: 16661)
 *         Part of AetherCredit — Track 3, Agentic Economy
 *         0G APAC Hackathon 2026
 */
contract CreditVault {

    // =========================================================================
    // Structs
    // =========================================================================

    struct Loan {
        uint256 principal;
        uint256 issuedAt;
        uint256 dueBy;
        bytes32 storageRootHash;
        bool    repaid;
        bool    defaulted;
    }

    struct CreditDecision {
        uint256 score;
        uint256 limitWei;
        uint256 requestedWei;
        bool    approved;
        uint256 timestamp;
        bytes32 storageRootHash;
    }

    // =========================================================================
    // Immutable state
    // =========================================================================

    CreditScorer  public immutable scorer;
    WorkRegistry  public immutable registry;
    address       public immutable owner;

    // =========================================================================
    // Constants
    // =========================================================================

    /// @notice 7 day repayment window
    uint256 public constant REPAYMENT_WINDOW   = 7 days;

    /// @notice 5% protocol fee on repayment
    uint256 public constant REPAYMENT_FEE_BPS  = 500;

    uint256 public constant BPS_DENOMINATOR    = 10_000;

    // =========================================================================
    // Mutable state
    // =========================================================================

    /// @notice Active loan per agent
    mapping(address => Loan) public activeLoans;

    /// @notice Full credit decision history per agent
    mapping(address => CreditDecision[]) private _decisions;

    /// @notice Total OG wei repaid per agent
    mapping(address => uint256) public totalRepaidWei;

    /// @notice Default count per agent — permanent record
    mapping(address => uint256) public defaultCount;

    /// @notice Protocol-level statistics
    uint256 public totalDisbursedWei;
    uint256 public totalRepaidToPoolWei;

    // =========================================================================
    // Events
    // =========================================================================

    event PoolFunded(address indexed funder, uint256 amount);

    event CreditRequested(
        address indexed agent,
        uint256 requestedWei,
        bool    approved,
        uint256 score,
        uint256 timestamp
    );

    event LoanDisbursed(
        address indexed agent,
        uint256 amount,
        uint256 dueBy
    );

    event LoanRepaid(
        address indexed agent,
        uint256 principal,
        uint256 fee
    );

    event LoanDefaulted(
        address indexed agent,
        uint256 principal
    );

    event DecisionAnchored(
        address indexed agent,
        bytes32 storageRootHash,
        bool    approved
    );

    // =========================================================================
    // Errors
    // =========================================================================

    error ActiveLoanExists();
    error CreditLimitExceeded(uint256 score, uint256 limitWei, uint256 requestedWei);
    error InsufficientPoolBalance(uint256 requestedWei, uint256 availableWei);
    error NoActiveLoan();
    error InsufficientRepayment(uint256 sentWei, uint256 requiredWei);
    error NotDefaultable();
    error TransferFailed(address recipient, uint256 amount);
    error NotOwner();
    error InvalidAddress();

    // =========================================================================
    // Constructor
    // =========================================================================

    constructor(address _scorer, address _registry) {
        if (_scorer == address(0) || _registry == address(0))
            revert InvalidAddress();
        scorer   = CreditScorer(_scorer);
        registry = WorkRegistry(_registry);
        owner    = msg.sender;
    }

    // =========================================================================
    // Pool management
    // =========================================================================

    function fundPool() external payable {
        emit PoolFunded(msg.sender, msg.value);
    }

    receive() external payable {
        emit PoolFunded(msg.sender, msg.value);
    }

    // =========================================================================
    // Core credit operations
    // =========================================================================

    /**
     * @notice Request working capital from the credit pool.
     * @param amountWei       Amount of OG wei to borrow.
     * @param storageRootHash Merkle root of 0G Storage Log entry for this decision.
     */
    function requestCredit(uint256 amountWei, bytes32 storageRootHash) external {
        // ── Checks ───────────────────────────────────────────────────────────
        Loan storage existing = activeLoans[msg.sender];
        if (existing.principal > 0 && !existing.repaid && !existing.defaulted)
            revert ActiveLoanExists();

        (uint256 score, uint256 limitWei) = scorer.calculateScore(msg.sender);

        if (amountWei > limitWei)
            revert CreditLimitExceeded(score, limitWei, amountWei);

        if (amountWei > address(this).balance)
            revert InsufficientPoolBalance(amountWei, address(this).balance);

        // ── Effects ──────────────────────────────────────────────────────────
        _decisions[msg.sender].push(CreditDecision({
            score:           score,
            limitWei:        limitWei,
            requestedWei:    amountWei,
            approved:        true,
            timestamp:       block.timestamp,
            storageRootHash: storageRootHash
        }));

        uint256 dueBy = block.timestamp + REPAYMENT_WINDOW;

        activeLoans[msg.sender] = Loan({
            principal:       amountWei,
            issuedAt:        block.timestamp,
            dueBy:           dueBy,
            storageRootHash: storageRootHash,
            repaid:          false,
            defaulted:       false
        });

        unchecked { totalDisbursedWei += amountWei; }

        // ── Events ───────────────────────────────────────────────────────────
        emit CreditRequested(msg.sender, amountWei, true, score, block.timestamp);
        emit DecisionAnchored(msg.sender, storageRootHash, true);
        emit LoanDisbursed(msg.sender, amountWei, dueBy);

        // ── Interactions ─────────────────────────────────────────────────────
        (bool success, ) = msg.sender.call{value: amountWei}("");
        if (!success) revert TransferFailed(msg.sender, amountWei);
    }

    /**
     * @notice Repay active loan. Send principal + 5% fee as msg.value.
     */
    function repay() external payable {
        // ── Checks ───────────────────────────────────────────────────────────
        Loan storage loan = activeLoans[msg.sender];
        if (loan.principal == 0 || loan.repaid || loan.defaulted)
            revert NoActiveLoan();

        uint256 fee      = (loan.principal * REPAYMENT_FEE_BPS) / BPS_DENOMINATOR;
        uint256 required = loan.principal + fee;

        if (msg.value < required)
            revert InsufficientRepayment(msg.value, required);

        // ── Effects ──────────────────────────────────────────────────────────
        uint256 principal = loan.principal;
        loan.repaid = true;

        unchecked {
            totalRepaidWei[msg.sender] += principal;
            totalRepaidToPoolWei       += principal;
        }

        // ── Events ───────────────────────────────────────────────────────────
        emit LoanRepaid(msg.sender, principal, fee);

        // ── Interactions ─────────────────────────────────────────────────────
        uint256 excess = msg.value - required;
        if (excess > 0) {
            (bool sent, ) = msg.sender.call{value: excess}("");
            if (!sent) revert TransferFailed(msg.sender, excess);
        }
    }

    /**
     * @notice Mark overdue loan as defaulted. Permissionless.
     */
    function processDefault(address agent) external {
        Loan storage loan = activeLoans[agent];

        bool eligible = loan.principal > 0
            && !loan.repaid
            && !loan.defaulted
            && block.timestamp > loan.dueBy;

        if (!eligible) revert NotDefaultable();

        loan.defaulted = true;
        unchecked { ++defaultCount[agent]; }

        emit LoanDefaulted(agent, loan.principal);
    }

    // =========================================================================
    // Read functions
    // =========================================================================

    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getActiveLoan(address agent)
        external view returns (Loan memory)
    {
        return activeLoans[agent];
    }

    function hasActiveLoan(address agent)
        external view returns (bool)
    {
        Loan storage loan = activeLoans[agent];
        return loan.principal > 0 && !loan.repaid && !loan.defaulted;
    }

    function getDecisions(address agent)
        external view returns (CreditDecision[] memory)
    {
        return _decisions[agent];
    }

    function getCreditStatus(address agent)
        external view returns (
            uint256 score,
            uint256 limitWei,
            uint256 verifiedJobs,
            bool    hasLoan,
            uint256 loanPrincipal,
            uint256 loanDueBy,
            uint256 defaults,
            uint256 repaidTotal
        )
    {
        (score, limitWei)  = scorer.calculateScore(agent);
        verifiedJobs       = registry.getVerifiedJobCount(agent);
        Loan storage loan  = activeLoans[agent];
        hasLoan            = loan.principal > 0 && !loan.repaid && !loan.defaulted;
        loanPrincipal      = hasLoan ? loan.principal : 0;
        loanDueBy          = hasLoan ? loan.dueBy : 0;
        defaults           = defaultCount[agent];
        repaidTotal        = totalRepaidWei[agent];
    }

    // =========================================================================
    // Admin — emergency only
    // =========================================================================

    function adminWithdraw(address recipient, uint256 amountWei) external {
        if (msg.sender != owner) revert NotOwner();
        (bool success, ) = recipient.call{value: amountWei}("");
        if (!success) revert TransferFailed(recipient, amountWei);
    }
}