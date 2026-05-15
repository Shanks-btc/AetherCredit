/**
 * @file types/agent.types.ts
 * @description Types for agent profiles and work records in AetherCredit.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Agent profile — derived from on-chain state
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentProfile {
  /** Agent wallet address on 0G Chain */
  address:         string
  /** Credit score 0-1000 from CreditScorer contract */
  score:           number
  /** Max borrowable OG in wei */
  limitWei:        string
  /** Human readable limit */
  limitOG:         string
  /** Number of TEE-verified qualifying jobs */
  verifiedJobs:    number
  /** Total OG wei spent on qualifying jobs */
  totalSpendWei:   string
  /** Number of defaults — permanent record */
  defaultCount:    number
  /** Total OG wei repaid across all loans */
  totalRepaidWei:  string
}

// ─────────────────────────────────────────────────────────────────────────────
// Work record — from WorkRegistry contract + 0G Storage KV
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkRecord {
  /** Agent wallet address */
  agent:           string
  /** 0G Compute provider address */
  provider:        string
  /** keccak256 of ZG-Res-Key chatID */
  chatIDHash:      string
  /** keccak256 of inference response body */
  responseHash:    string
  /** OG wei paid for this job */
  computeCostWei:  string
  /** Block timestamp */
  timestamp:       number
  /** Result of broker.inference.processResponse() */
  teeVerified:     boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Work submission request
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmitWorkRequest {
  /** 0G Compute provider address */
  provider:        string
  /** Raw ZG-Res-Key header value from inference response */
  chatID:          string
  /** keccak256 of inference response body */
  responseHash:    string
  /** OG wei spent — must be >= 1e14 (0.0001 OG) */
  computeCostWei:  string
}

export interface SubmitWorkResponse {
  /** keccak256 of chatID stored on-chain */
  chatIDHash:        string
  /** Result of TEE verification */
  teeVerified:       boolean
  /** True if this job counts toward credit score */
  countsTowardScore: boolean
  /** 0G Chain tx hash */
  txHash:            string
}