import { useAccount }        from 'wagmi'
import { useQueryClient }    from '@tanstack/react-query'
import { PageHeader }        from '../components/shared/PageHeader'
import { StatCard }          from '../components/shared/StatCard'
import { MetricGrid }        from '../components/shared/MetricGrid'
import { ScoreGauge }        from '../components/score/ScoreGauge'
import { ScoreBreakdown }    from '../components/score/ScoreBreakdown'
import { ActiveLoanCard }    from '../components/loan/ActiveLoanCard'
import { RequestCreditForm } from '../components/loan/RequestCreditForm'
import { RepayButton }       from '../components/loan/RepayButton'
import { WorkHistoryTable }  from '../components/work/WorkHistoryTable'
import { LoadingSpinner }    from '../components/shared/LoadingSpinner'
import { ChainScanLink }     from '../components/shared/ChainScanLink'
import { OGAmount }          from '../components/shared/OGAmount'
import { useAgentProfile }   from '../hooks/useAgentProfile'
import { useActiveLoan }     from '../hooks/useActiveLoan'
import { useWorkHistory }    from '../hooks/useWorkHistory'
import { usePoolBalance }    from '../hooks/usePoolBalance'
import { useTheme }          from '../lib/theme'
import {
  MOCK_AGENT_PROFILE,
  MOCK_WORK_RECORDS,
  MOCK_POOL_HEALTH,
} from '../data/mock'

export function Dashboard() {
  const { address }   = useAccount()
  const queryClient   = useQueryClient()
  const { isDark }    = useTheme()

  const { data: profile, isLoading: profileLoading } = useAgentProfile()
  const { data: loan,    isLoading: loanLoading }    = useActiveLoan()
  const { data: history, isLoading: historyLoading } = useWorkHistory()
  const { data: pool }                               = usePoolBalance()

  function refetchAll() {
    queryClient.invalidateQueries({ queryKey: ['agentProfile'] })
    queryClient.invalidateQueries({ queryKey: ['activeLoan']   })
    queryClient.invalidateQueries({ queryKey: ['workHistory']  })
    queryClient.invalidateQueries({ queryKey: ['poolBalance']  })
  }

  // Demo mode — always show data, never blank
  const isDemoMode = !profileLoading && !profile

  const score         = isDemoMode ? MOCK_AGENT_PROFILE.score         : (profile?.score        ?? 0)
  const limitWei      = isDemoMode ? MOCK_AGENT_PROFILE.limitWei      : (profile?.limitWei     ?? '0')
  const verifiedJobs  = isDemoMode ? MOCK_AGENT_PROFILE.verifiedJobs  : (profile?.verifiedJobs ?? 0)
  const totalSpendWei = isDemoMode ? MOCK_AGENT_PROFILE.totalSpendWei : (profile?.totalSpendWei ?? '0')
  const hasActiveLoan = loan?.hasActiveLoan ?? false
  const workRecords   = isDemoMode ? MOCK_WORK_RECORDS : (history?.onChain ?? [])
  const poolData      = isDemoMode ? MOCK_POOL_HEALTH  : pool

  const card   = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  const muted  = isDark ? 'text-slate-400' : 'text-slate-500'
  const border = isDark ? 'border-slate-700' : 'border-slate-200'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Dashboard"
        description="Your on-chain credit profile powered by 0G Chain, Compute and Storage."
        action={
          <button
            onClick={refetchAll}
            className={`text-xs border rounded-lg px-3 py-1.5 transition-colors ${
              isDark
                ? 'border-slate-700 text-slate-400 hover:text-slate-200'
                : 'border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            ↻ Refresh
          </button>
        }
      />
      {/* Stats */}
      <MetricGrid cols={4}>
        <StatCard
          label="Credit Score"
          value={profileLoading ? '...' : `${score}/1000`}
          sub="on-chain score"
          accent="indigo"
          icon="◆"
        />
        <StatCard
          label="Credit Limit"
          value={profileLoading ? '...' : <OGAmount wei={limitWei} decimals={2} />}
          sub="max borrowable"
          accent="green"
          icon="↑"
        />
        <StatCard
          label="Verified Jobs"
          value={profileLoading ? '...' : verifiedJobs}
          sub="TEE-attested"
          accent="purple"
          icon="⬡"
        />
        <StatCard
          label="Pool Available"
          value={poolData ? <OGAmount wei={poolData.availableWei ?? '0'} decimals={2} /> : '...'}
          sub="ready to disburse"
          accent="cyan"
          icon="◈"
        />
      </MetricGrid>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score panel */}
        <div className={`rounded-2xl border p-6 space-y-5 ${card}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${muted}`}>
            Credit Score
          </h2>

          {profileLoading ? <LoadingSpinner /> : (
            <>
              <div className="flex justify-center">
                <ScoreGauge score={score} />
              </div>
              <ScoreBreakdown
                score={score}
                limitWei={limitWei}
                verifiedJobs={verifiedJobs}
                totalSpendWei={totalSpendWei}
              />
            </>
          )}

          <div className={`pt-4 border-t ${border} space-y-2`}>
            <div className={`text-xs ${muted} mb-2`}>Verify on-chain</div>
            <div className="space-y-1.5">
              <ChainScanLink type="address" value="0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC" label="WorkRegistry" />
              <ChainScanLink type="address" value="0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602" label="CreditScorer" />
              <ChainScanLink type="address" value="0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D" label="CreditVault"  />
            </div>
          </div>
        </div>

        {/* Loan + Pool */}
        <div className="lg:col-span-2 space-y-5">

          <div className={`rounded-2xl border p-6 ${card}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${muted}`}>
              {hasActiveLoan ? 'Active Loan' : 'Request Credit'}
            </h2>

            {loanLoading ? <LoadingSpinner /> : hasActiveLoan && loan ? (
              <div className="space-y-4">
                <ActiveLoanCard loan={{
                  principalWei: loan.principalWei ?? loan.loanPrincipal ?? '0',
                  dueBy:        loan.dueBy ?? loan.loanDueBy ?? 0,
                  txHash:       loan.txHash ?? null,
                  status:       'ACTIVE',
                }} />
                <RepayButton
                  principalWei={loan.principalWei ?? loan.loanPrincipal ?? '0'}
                  onSuccess={refetchAll}
                />
              </div>
            ) : (
              <RequestCreditForm limitWei={limitWei} onSuccess={refetchAll} />
            )}
          </div>

          {/* Pool health */}
          {poolData && (
            <div className={`rounded-2xl border p-6 ${card}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${muted}`}>
                Pool Health
              </h2>
              <MetricGrid cols={4}>
                {[
                  { label: 'Available',    wei: poolData.availableWei    ?? '0', color: 'text-green-400'  },
                  { label: 'Lent Out',     wei: poolData.totalLentWei    ?? '0', color: 'text-yellow-400' },
                  { label: 'Total Funded', wei: poolData.totalFundedWei  ?? '0', color: 'text-indigo-400' },
                  { label: 'Bad Debt',     wei: poolData.totalBadDebtWei ?? '0', color: 'text-red-400'    },
                ].map((p) => (
                  <div key={p.label} className={`rounded-xl border p-3 ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`text-xs ${muted} mb-1`}>{p.label}</div>
                    <div className={`text-sm font-bold ${p.color}`}>
                      <OGAmount wei={p.wei} decimals={2} />
                    </div>
                  </div>
                ))}
              </MetricGrid>
            </div>
          )}
        </div>
      </div>

      {/* Work history */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${muted}`}>
            Work History
          </h2>
          <span className={`text-xs ${muted}`}>
            {historyLoading ? '...' : `${workRecords.length} records · 0G Chain + 0G Storage KV`}
          </span>
        </div>
        {historyLoading
          ? <LoadingSpinner />
          : <WorkHistoryTable records={workRecords} />
        }
      </div>

      {/* Agent address */}
      {address && (
        <div className="text-center">
          <ChainScanLink
            type="address"
            value={address}
            label={`Your wallet: ${address.slice(0, 10)}...${address.slice(-6)}`}
          />
        </div>
      )}
    </div>
  )
}