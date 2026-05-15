/**
 * @file lib/contracts.ts
 * @description AetherCredit contract addresses and ABIs for the dashboard.
 * Deployed on 0G Mainnet (ChainID: 16661)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Deployed contract addresses — 0G Mainnet
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  WorkRegistry: '0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC',
  CreditScorer: '0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602',
  CreditVault:  '0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 0G Mainnet config
// ─────────────────────────────────────────────────────────────────────────────

export const ZG_MAINNET = {
  id:          16661,
  name:        '0G Mainnet',
  rpcUrl:      'https://evmrpc.0g.ai',
  explorerUrl: 'https://chainscan.0g.ai',
  nativeCurrency: {
    name:     'OG',
    symbol:   'OG',
    decimals: 18,
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// ABIs
// ─────────────────────────────────────────────────────────────────────────────

export const WORK_REGISTRY_ABI = [
  'function submitWork(address provider, bytes32 chatIDHash, bytes32 responseHash, uint256 computeCostWei, bool teeVerified) external',
  'function getVerifiedJobCount(address agent) external view returns (uint256)',
  'function getScoringInputs(address agent) external view returns (uint256 verifiedJobs, uint256 totalSpendWei)',
  'function getAllWorkRecords(address agent) external view returns (tuple(address agent, address provider, bytes32 chatIDHash, bytes32 responseHash, uint256 computeCostWei, uint256 timestamp, bool teeVerified)[])',
  'function isSubmitted(address agent, bytes32 chatIDHash) external view returns (bool)',
  'function MIN_COMPUTE_COST_WEI() external view returns (uint256)',
] as const

export const CREDIT_SCORER_ABI = [
  'function calculateScore(address agent) external view returns (uint256 score, uint256 limitWei)',
  'function qualifies(address agent, uint256 amountWei) external view returns (bool)',
  'function getProfile(address agent) external view returns (tuple(uint256 score, uint256 limitWei, uint256 verifiedJobs, uint256 totalSpendWei, uint256 lastUpdated))',
] as const

export const CREDIT_VAULT_ABI = [
  'function requestCredit(uint256 amountWei, bytes32 storageRootHash) external',
  'function repay() external payable',
  'function poolBalance() external view returns (uint256)',
  'function hasActiveLoan(address agent) external view returns (bool)',
  'function getActiveLoan(address agent) external view returns (tuple(uint256 principal, uint256 issuedAt, uint256 dueBy, bytes32 storageRootHash, bool repaid, bool defaulted))',
  'function getCreditStatus(address agent) external view returns (uint256 score, uint256 limitWei, uint256 verifiedJobs, bool hasLoan, uint256 loanPrincipal, uint256 loanDueBy, uint256 defaults, uint256 repaidTotal)',
  'function fundPool() external payable',
] as const