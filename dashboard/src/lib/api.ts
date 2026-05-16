/// <reference types="vite/client" />

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export type PoolHealth = {
  availableWei:    string
  totalFundedWei:  string
  totalLentWei:    string
  totalBadDebtWei: string
}

export type AgentProfile = {
  score:         number
  limitWei:      string
  verifiedJobs:  number
  totalSpendWei: string
}

export type ActiveLoan = {
  hasActiveLoan: boolean
  principalWei:  string
  loanPrincipal: string
  dueBy:         number
  loanDueBy:     number
  txHash:        string | null
}

export type WorkRecord = {
  agent:          string
  provider:       string
  chatIDHash:     string
  responseHash:   string
  computeCostWei: string
  timestamp:      number
  teeVerified:    boolean
}

export type WorkHistory = {
  onChain: WorkRecord[]
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  return (json.data ?? json) as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  return (json.data ?? json) as T
}

export const api = { get, post }

export async function fetchPoolHealth(): Promise<PoolHealth> {
  return get<PoolHealth>('/api/pool/health')
}

export async function fetchAgentProfile(address: string): Promise<AgentProfile> {
  return get<AgentProfile>(`/api/agents/${address}/score`)
}

export async function fetchActiveLoan(address: string): Promise<ActiveLoan> {
  return get<ActiveLoan>(`/api/credit/${address}/loan`)
}

export async function fetchWorkHistory(address: string): Promise<WorkHistory> {
  return get<WorkHistory>(`/api/work/${address}/history`)
}