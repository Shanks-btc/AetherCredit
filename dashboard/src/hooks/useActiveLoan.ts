/**
 * @file hooks/useActiveLoan.ts
 * @description Reads active loan status from CreditVault via backend.
 */

import { useQuery }      from '@tanstack/react-query'
import { useAccount }    from 'wagmi'
import { fetchActiveLoan } from '../lib/api'

export function useActiveLoan(addressOverride?: string) {
  const { address } = useAccount()
  const target      = addressOverride ?? address

  return useQuery({
    queryKey:        ['activeLoan', target],
    queryFn:         () => fetchActiveLoan(target!),
    enabled:         !!target,
    refetchInterval: 10_000,
    staleTime:       5_000,
  })
}