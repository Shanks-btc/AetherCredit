/**
 * @file hooks/usePoolBalance.ts
 * @description Reads credit pool health from CreditVault on 0G Chain.
 */

import { useQuery }      from '@tanstack/react-query'
import { fetchPoolHealth } from '../lib/api'

export function usePoolBalance() {
  return useQuery({
    queryKey:        ['poolBalance'],
    queryFn:         fetchPoolHealth,
    refetchInterval: 60_000,
    staleTime:       30_000,
  })
}