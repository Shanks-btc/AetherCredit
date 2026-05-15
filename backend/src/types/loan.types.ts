/**
 * @file types/loan.types.ts
 * @description Types for loan lifecycle in AetherCredit.
 */

export enum LoanStatus {
  ACTIVE    = 'ACTIVE',
  REPAID    = 'REPAID',
  DEFAULTED = 'DEFAULTED',
}

export interface Loan {
  /** Agent wallet address */
  agentAddress:    string
  /** OG wei borrowed */
  principalWei:    string
  /** Human readable principal */
  principalOG:     string
  /** Loan creation timestamp */
  issuedAt:        number
  /** Repayment deadline timestamp */
  dueBy:           number
  /** 0G Storage root hash of decision archive */
  storageRootHash: string
  /** Current status */
  status:          LoanStatus
  /** 0G Chain tx hash of disbursement */
  txHash:          string | null
}

export interface CreditRequest {
  /** Amount of OG wei to borrow */
  amountWei: string
}

export interface CreditRequestResponse {
  /** Whether request was approved */
  approved:      boolean
  /** Rejection reason if denied */
  reason:        string | null
  /** Loan details if approved */
  loan:          Loan | null
  /** 0G Chain tx hash if approved */
  txHash:        string | null
}

export interface PoolHealth {
  /** OG wei available for lending */
  availableWei:    string
  /** Human readable available */
  availableOG:     string
  /** Total OG wei ever deposited */
  totalFundedWei:  string
  /** OG wei currently lent out */
  totalLentWei:    string
  /** OG wei written off as bad debt */
  totalBadDebtWei: string
  /** Percentage of pool currently lent */
  utilizationPct:  number
}