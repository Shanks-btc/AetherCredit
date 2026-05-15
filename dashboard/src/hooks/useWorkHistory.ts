/**
 * @file hooks/useWorkHistory.ts
 * @description Reads agent work history from 0G Chain and 0G Storage KV.
 */

import { useQuery }        from '@tanstack/react-query'
import { useAccount }      from 'wagmi'
import { fetchWorkHistory } from '../lib/api'

export function useWorkHistory(addressOverride?: string) {
  const { address } = useAccount()
  const target      = addressOverride ?? address

  return useQuery({
    queryKey:        ['workHistory', target],
    queryFn:         () => fetchWorkHistory(target!),
    enabled:         !!target,
    refetchInterval: 60_000,
    staleTime:       30_000,
  })
}