import { useQuery }          from '@tanstack/react-query'
import { useAccount }        from 'wagmi'
import { fetchAgentProfile } from '../lib/api'

export function useAgentProfile(addressOverride?: string) {
  const { address } = useAccount()
  const target      = addressOverride ?? address
  return useQuery({
    queryKey:        ['agentProfile', target],
    queryFn:         () => fetchAgentProfile(target!),
    enabled:         !!target,
    refetchInterval: 30_000,
    staleTime:       10_000,
  })
}