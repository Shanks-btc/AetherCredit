/**
 * @file hooks/useAgentProfile.ts
 * @description Reads agent credit score and limit from 0G Chain via backend.
 */

import { useQuery }       from '@tanstack/react-query'
import { useAccount }     from 'wagmi'
import { fetchAgentScore } from '../lib/api'

export function useAgentProfile(addressOverride?: string) {
  const { address } = useAccount()
  const target      = addressOverride ?? address

  return useQuery({
    queryKey:        ['agentProfile', target],
    queryFn:         () => fetchAgentScore(target!),
    enabled:         !!target,
    refetchInterval: 30_000,
    staleTime:       10_000,
  })
}