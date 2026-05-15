/**
 * @file lib/api.ts
 * @description Axios instance for AetherCredit backend API calls.
 */

import axios from 'axios'

const API_BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor — unwrap success envelope
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message ?? error.message
    return Promise.reject(new Error(message))
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAgentScore(address: string) {
  const res = await api.get(`/agents/${address}/score`)
  return res.data.data
}

export async function fetchActiveLoan(address: string) {
  const res = await api.get(`/agents/${address}/loan`)
  return res.data.data
}

export async function fetchWorkHistory(address: string) {
  const res = await api.get(`/agents/${address}/history`)
  return res.data.data
}

export async function fetchPoolHealth() {
  const res = await api.get('/pool/health')
  return res.data.data
}

export async function fetchCreditStatus(address: string) {
  const res = await api.get(`/ledger/balance/${address}`)
  return res.data.data
}