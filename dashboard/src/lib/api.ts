/// <reference types="vite/client" />

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  },
  post: async (path: string, body: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  },
}