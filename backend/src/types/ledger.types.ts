export enum EntryType {
  CREDIT_ISSUED    = 'CREDIT_ISSUED',
  CREDIT_DEDUCTED  = 'CREDIT_DEDUCTED',
  CREDIT_REPAID    = 'CREDIT_REPAID',
  CREDIT_DEFAULTED = 'CREDIT_DEFAULTED',
}

export enum AccountType {
  POOL     = 'POOL',
  AGENT    = 'AGENT',
  BAD_DEBT = 'BAD_DEBT',
}

export enum EntryStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
}

export interface LedgerEntry {
  readonly id:            string
  readonly entryType:     EntryType
  readonly agentAddress:  string | null
  readonly debitAccount:  AccountType
  readonly creditAccount: AccountType
  readonly amountWei:     string
  readonly txHash:        string | null
  readonly blockNumber:   number | null
  readonly status:        EntryStatus
  readonly createdAt:     string
}

export interface AgentCreditBalance {
  readonly agentAddress:     string
  readonly outstandingWei:   string
  readonly totalBorrowedWei: string
  readonly totalRepaidWei:   string
  readonly defaultCount:     number
  readonly lastActivityAt:   string | null
}

export interface PoolBalance {
  readonly availableWei:    string
  readonly totalFundedWei:  string
  readonly totalLentWei:    string
  readonly totalBadDebtWei: string
}

export interface IssueCreditRequest {
  agentAddress: string | null
  amountWei:    string
  txHash:       string | null
  blockNumber:  number | null
}

export interface DeductCreditRequest {
  agentAddress: string
  amountWei:    string
  txHash:       string | null
  blockNumber:  number | null
}

export interface LedgerOperationResult {
  entry:        LedgerEntry
  agentBalance: AgentCreditBalance | null
  poolBalance:  PoolBalance
}

export interface BalanceFetchResult {
  agentBalance: AgentCreditBalance
  poolBalance:  PoolBalance
}