/**
 * @file data/mock.ts
 * @description Demo data for new wallets with no compute history.
 */

// ── Agent type ────────────────────────────────────────────────────────────────
export type Agent = {
  address:         string
  shortAddress:    string
  score:           number
  limitOG:         string
  verifiedJobs:    number
  totalBorrowedOG: string
  totalRepaidOG:   string
  activeLoans:     number
  defaults:        number
  risk:            string
  lastActive:      number
}

// ── Protocol stats ────────────────────────────────────────────────────────────
export const MOCK_PROTOCOL_STATS = {
  totalDisbursedOG:  '8.20',
  repaymentRatePct:  97.3,
  activeAgents:      8,
  verifiedJobs:      63,
  totalAgents:       8,
  totalJobs:         63,
  poolAvailableOG:   '1.80',
  totalRepaidOG:     '7.98',
  activeLoansCount:  3,
  totalBadDebtOG:    '0.00',
}

// ── Demo agent profile ────────────────────────────────────────────────────────
export const MOCK_AGENT_PROFILE = {
  score:         413,
  limitWei:      '826000000000000000',
  limitOG:       '0.826',
  verifiedJobs:  10,
  totalSpendWei: '1300000000000000000',
  totalSpendOG:  '1.3',
  lastUpdated:   Math.floor(Date.now() / 1000),
}

// ── Demo work history ─────────────────────────────────────────────────────────
export const MOCK_WORK_RECORDS = [
  {
    agent:          '0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262',
    provider:       '0xa48f012800b6b416b24c138e4fe1a5a4a2e67836',
    chatIDHash:     '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    responseHash:   '0xabcdef1234567890abcdef1234567890abcdef12',
    computeCostWei: '150000000000000000',
    timestamp:      Math.floor(Date.now() / 1000) - 86400,
    teeVerified:    true,
  },
  {
    agent:          '0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262',
    provider:       '0xa48f012800b6b416b24c138e4fe1a5a4a2e67836',
    chatIDHash:     '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    responseHash:   '0xbcdef1234567890abcdef1234567890abcdef123',
    computeCostWei: '200000000000000000',
    timestamp:      Math.floor(Date.now() / 1000) - 172800,
    teeVerified:    true,
  },
  {
    agent:          '0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262',
    provider:       '0xa48f012800b6b416b24c138e4fe1a5a4a2e67836',
    chatIDHash:     '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    responseHash:   '0xcdef1234567890abcdef1234567890abcdef1234',
    computeCostWei: '100000000000000000',
    timestamp:      Math.floor(Date.now() / 1000) - 259200,
    teeVerified:    true,
  },
  {
    agent:          '0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262',
    provider:       '0xa48f012800b6b416b24c138e4fe1a5a4a2e67836',
    chatIDHash:     '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    responseHash:   '0xdef1234567890abcdef1234567890abcdef12345',
    computeCostWei: '180000000000000000',
    timestamp:      Math.floor(Date.now() / 1000) - 345600,
    teeVerified:    true,
  },
  {
    agent:          '0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262',
    provider:       '0xa48f012800b6b416b24c138e4fe1a5a4a2e67836',
    chatIDHash:     '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    responseHash:   '0xef1234567890abcdef1234567890abcdef123456',
    computeCostWei: '120000000000000000',
    timestamp:      Math.floor(Date.now() / 1000) - 432000,
    teeVerified:    false,
  },
]

// ── Demo pool health ──────────────────────────────────────────────────────────
export const MOCK_POOL_HEALTH = {
  availableWei:    '1800000000000000000',
  totalFundedWei:  '2000000000000000000',
  totalLentWei:    '200000000000000000',
  totalBadDebtWei: '0',
}

// ── Demo agents leaderboard ───────────────────────────────────────────────────
export const MOCK_AGENTS: Agent[] = [
  {
    address:         '0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262',
    shortAddress:    '0x8cfE...8262',
    score:           413,
    limitOG:         '0.826',
    verifiedJobs:    10,
    totalBorrowedOG: '0.300',
    totalRepaidOG:   '0.315',
    activeLoans:     0,
    defaults:        0,
    risk:            'low',
    lastActive:      Math.floor(Date.now() / 1000) - 3600,
  },
  {
    address:         '0xeFb9014198317F703408069CDA811e1253601A92',
    shortAddress:    '0xeFb9...1A92',
    score:           820,
    limitOG:         '1.640',
    verifiedJobs:    21,
    totalBorrowedOG: '1.200',
    totalRepaidOG:   '1.260',
    activeLoans:     1,
    defaults:        0,
    risk:            'low',
    lastActive:      Math.floor(Date.now() / 1000) - 7200,
  },
  {
    address:         '0xf6e345D3C7B44C4D7cD27F34D8e9e1D55A112142',
    shortAddress:    '0xf6e3...2142',
    score:           276,
    limitOG:         '0.552',
    verifiedJobs:    6,
    totalBorrowedOG: '0.500',
    totalRepaidOG:   '0.525',
    activeLoans:     0,
    defaults:        0,
    risk:            'medium',
    lastActive:      Math.floor(Date.now() / 1000) - 14400,
  },
  {
    address:         '0x1234567890abcdef1234567890abcdef12345678',
    shortAddress:    '0x1234...5678',
    score:           540,
    limitOG:         '1.080',
    verifiedJobs:    14,
    totalBorrowedOG: '0.800',
    totalRepaidOG:   '0.840',
    activeLoans:     1,
    defaults:        0,
    risk:            'low',
    lastActive:      Math.floor(Date.now() / 1000) - 21600,
  },
  {
    address:         '0xabcdef1234567890abcdef1234567890abcdef12',
    shortAddress:    '0xabcd...ef12',
    score:           120,
    limitOG:         '0.240',
    verifiedJobs:    3,
    totalBorrowedOG: '0.200',
    totalRepaidOG:   '0.000',
    activeLoans:     1,
    defaults:        1,
    risk:            'high',
    lastActive:      Math.floor(Date.now() / 1000) - 86400,
  },
]

// ── Demo activity feed ────────────────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  {
    type:      'LOAN_DISBURSED',
    agent:     '0x8cfE...8262',
    amountOG:  '0.300',
    txHash:    '0x6517a06a6808b6ff411d272cebf206865190cca0',
    timestamp: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    type:      'LOAN_REPAID',
    agent:     '0xeFb9...1A92',
    amountOG:  '0.315',
    txHash:    '0x18f866866116df8a4be0159134f7bea8c06a09ea',
    timestamp: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    type:      'WORK_SUBMITTED',
    agent:     '0x1234...5678',
    amountOG:  '0.150',
    txHash:    '0x823e9b8f1f7728d4af3b86522083392eb7227a61',
    timestamp: Math.floor(Date.now() / 1000) - 10800,
  },
  {
    type:      'LOAN_DISBURSED',
    agent:     '0xf6e3...2142',
    amountOG:  '0.500',
    txHash:    '0x9abc123def456789012345678901234567890abc',
    timestamp: Math.floor(Date.now() / 1000) - 14400,
  },
  {
    type:      'WORK_SUBMITTED',
    agent:     '0xabcd...ef12',
    amountOG:  '0.200',
    txHash:    '0xdef123456789012345678901234567890abcdef1',
    timestamp: Math.floor(Date.now() / 1000) - 18000,
  },
]

// ── Helper functions ──────────────────────────────────────────────────────────
export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low':    return 'text-green-400'
    case 'medium': return 'text-yellow-400'
    case 'high':   return 'text-red-400'
    default:       return 'text-slate-400'
  }
}

export function getRiskBg(risk: string): string {
  switch (risk) {
    case 'low':    return 'bg-green-900/20 border-green-700/30'
    case 'medium': return 'bg-yellow-900/20 border-yellow-700/30'
    case 'high':   return 'bg-red-900/20 border-red-700/30'
    default:       return 'bg-slate-800 border-slate-700'
  }
}

export function getEventColor(type: string): string {
  switch (type) {
    case 'LOAN_DISBURSED':  return 'text-indigo-400'
    case 'LOAN_REPAID':     return 'text-green-400'
    case 'WORK_SUBMITTED':  return 'text-cyan-400'
    case 'LOAN_DEFAULTED':  return 'text-red-400'
    default:                return 'text-slate-400'
  }
}

export function getEventLabel(type: string): string {
  switch (type) {
    case 'LOAN_DISBURSED':  return 'Loan Disbursed'
    case 'LOAN_REPAID':     return 'Loan Repaid'
    case 'WORK_SUBMITTED':  return 'Work Submitted'
    case 'LOAN_DEFAULTED':  return 'Loan Defaulted'
    default:                return type
  }
}