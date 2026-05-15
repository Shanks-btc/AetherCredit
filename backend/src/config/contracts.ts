/**
 * @file config/contracts.ts
 * @description AetherCredit contract ABIs and deployed addresses.
 *
 * Addresses are filled after deployment to 0G Mainnet.
 * Verified from: https://chainscan.0g.ai
 *
 * Deployer: 0xeFb9014198317F703408069CDA811e1253601A92
 * Agent:    0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262
 * Protocol: 0xf6e345D3C7B44C4D7cD27F34D8e9e1D55A112142
 */

import { ethers } from 'ethers'
import { env }    from './env'

// ─────────────────────────────────────────────────────────────────────────────
// Deployed contract addresses on 0G Mainnet (ChainID: 16661)
// Filled after: npx hardhat run scripts/deploy.js --network mainnet
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  WorkRegistry:  process.env['WORK_REGISTRY_ADDRESS']  ?? '',
  CreditScorer:  process.env['CREDIT_SCORER_ADDRESS']  ?? '',
  CreditVault:   process.env['CREDIT_VAULT_ADDRESS']   ?? '',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// ABIs — minimal interfaces for the three contracts
// ─────────────────────────────────────────────────────────────────────────────

export const WORK_REGISTRY_ABI = [
  // Write
  'function submitWork(address provider, bytes32 chatIDHash, bytes32 responseHash, uint256 computeCostWei, bool teeVerified) external',
  // Read
  'function getVerifiedJobCount(address agent) external view returns (uint256)',
  'function getVerifiedComputeSpend(address agent) external view returns (uint256)',
  'function getScoringInputs(address agent) external view returns (uint256 verifiedJobs, uint256 totalSpendWei)',
  'function getAllWorkRecords(address agent) external view returns (tuple(address agent, address provider, bytes32 chatIDHash, bytes32 responseHash, uint256 computeCostWei, uint256 timestamp, bool teeVerified)[])',
  'function isSubmitted(address agent, bytes32 chatIDHash) external view returns (bool)',
  'function MIN_COMPUTE_COST_WEI() external view returns (uint256)',
] as const

export const CREDIT_SCORER_ABI = [
  'function calculateScore(address agent) external view returns (uint256 score, uint256 limitWei)',
  'function refreshProfile(address agent) external returns (tuple(uint256 score, uint256 limitWei, uint256 verifiedJobs, uint256 totalSpendWei, uint256 lastUpdated))',
  'function getProfile(address agent) external view returns (tuple(uint256 score, uint256 limitWei, uint256 verifiedJobs, uint256 totalSpendWei, uint256 lastUpdated))',
  'function qualifies(address agent, uint256 amountWei) external view returns (bool)',
] as const

export const CREDIT_VAULT_ABI = [
  // Write
  'function requestCredit(uint256 amountWei, bytes32 storageRootHash) external',
  'function repay() external payable',
  'function processDefault(address agent) external',
  'function fundPool() external payable',
  // Read
  'function poolBalance() external view returns (uint256)',
  'function hasActiveLoan(address agent) external view returns (bool)',
  'function getActiveLoan(address agent) external view returns (tuple(uint256 principal, uint256 issuedAt, uint256 dueBy, bytes32 storageRootHash, bool repaid, bool defaulted))',
  'function getCreditStatus(address agent) external view returns (uint256 score, uint256 limitWei, uint256 verifiedJobs, bool hasLoan, uint256 loanPrincipal, uint256 loanDueBy, uint256 defaults, uint256 repaidTotal)',
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Provider — read-only connection to 0G Chain
// ─────────────────────────────────────────────────────────────────────────────

export const getProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(env.ZERO_G_RPC)
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract instances — read-only
// ─────────────────────────────────────────────────────────────────────────────

export const getWorkRegistry = (): ethers.Contract => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.WorkRegistry,
    WORK_REGISTRY_ABI,
    getProvider()
  )
}

export const getCreditScorer = (): ethers.Contract => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.CreditScorer,
    CREDIT_SCORER_ABI,
    getProvider()
  )
}

export const getCreditVault = (): ethers.Contract => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.CreditVault,
    CREDIT_VAULT_ABI,
    getProvider()
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Signed contract instances — for write operations
// ─────────────────────────────────────────────────────────────────────────────

export const getSignedWorkRegistry = (privateKey: string): ethers.Contract => {
  const provider = getProvider()
  const signer   = new ethers.Wallet(privateKey, provider)
  return new ethers.Contract(
    CONTRACT_ADDRESSES.WorkRegistry,
    WORK_REGISTRY_ABI,
    signer
  )
}

export const getSignedCreditVault = (privateKey: string): ethers.Contract => {
  const provider = getProvider()
  const signer   = new ethers.Wallet(privateKey, provider)
  return new ethers.Contract(
    CONTRACT_ADDRESSES.CreditVault,
    CREDIT_VAULT_ABI,
    signer
  )
}