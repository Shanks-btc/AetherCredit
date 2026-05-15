import { PageHeader }   from '../components/shared/PageHeader'
import { StatCard }     from '../components/shared/StatCard'
import { MetricGrid }   from '../components/shared/MetricGrid'
import { useTheme }     from '../lib/theme'
import { ChainScanLink } from '../components/shared/ChainScanLink'
import {
  MOCK_PROTOCOL_STATS,
  MOCK_ACTIVITY,
  getEventColor,
  getEventLabel,
} from '../data/mock'

export function Economy() {
  const { isDark } = useTheme()
  const s = MOCK_PROTOCOL_STATS

  const card  = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const text  = isDark ? 'text-white' : 'text-slate-900'

  const utilizationColor =
    s.poolUtilizationPct > 80 ? 'text-red-400' :
    s.poolUtilizationPct > 50 ? 'text-yellow-400' :
    'text-green-400'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Protocol Economy"
        description="Real-time financial metrics for the AetherCredit credit protocol on 0G Mainnet."
      />

      {/* Primary metrics */}
      <MetricGrid cols={4}>
        <StatCard
          label="Total Disbursed"
          value={`${s.totalDisbursedOG} OG`}
          sub="all time"
          accent="indigo"
          icon="⬆"
          trend="up"
          trendValue="active"
        />
        <StatCard
          label="Total Repaid"
          value={`${s.totalRepaidOG} OG`}
          sub="all time"
          accent="green"
          icon="✓"
          trend="up"
          trendValue={`${s.repaymentRatePct}% rate`}
        />
        <StatCard
          label="Active Loans"
          value={s.activeLoansCount}
          sub={`${s.activeLoansOG} OG outstanding`}
          accent="yellow"
          icon="◎"
        />
        <StatCard
          label="Pool Available"
          value={`${s.poolAvailableOG} OG`}
          sub="ready to disburse"
          accent="cyan"
          icon="◈"
        />
      </MetricGrid>

      {/* Secondary metrics */}
      <MetricGrid cols={4}>
        <StatCard
          label="Total Agents"
          value={s.totalAgents}
          sub="registered on-chain"
          accent="purple"
          icon="◆"
        />
        <StatCard
          label="Total Jobs"
          value={s.totalJobs}
          sub="TEE-verified"
          accent="indigo"
          icon="⬡"
        />
        <StatCard
          label="Defaulted Loans"
          value={s.defaultedLoansCount}
          sub={`${s.defaultedLoansOG} OG`}
          accent="red"
          icon="✕"
        />
        <StatCard
          label="Repayment Rate"
          value={`${s.repaymentRatePct}%`}
          sub="of all loans repaid"
          accent="green"
          icon="↺"
          trend="up"
          trendValue="healthy"
        />
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pool utilization */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${muted}`}>
            Pool Utilization
          </h2>

          <div className="flex items-end justify-between mb-2">
            <span className={`text-3xl font-bold ${utilizationColor}`}>
              {s.poolUtilizationPct}%
            </span>
            <span className={`text-xs ${muted}`}>
              {s.activeLoansOG} / {(parseFloat(s.activeLoansOG) + parseFloat(s.poolAvailableOG)).toFixed(2)} OG
            </span>
          </div>

          {/* Bar */}
          <div className={`h-2 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${s.poolUtilizationPct}%` }}
            />
          </div>

          <div className="space-y-2">
            {[
              { label: 'Available',    value: `${s.poolAvailableOG} OG`,  color: 'bg-green-400'  },
              { label: 'Lent Out',     value: `${s.activeLoansOG} OG`,    color: 'bg-indigo-400' },
              { label: 'Bad Debt',     value: `${s.defaultedLoansOG} OG`, color: 'bg-red-400'    },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className={`text-xs ${muted}`}>{item.label}</span>
                </div>
                <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${muted}`}>
              0G Chain Activity
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-xs ${muted}`}>Live</span>
            </div>
          </div>

          <div className="space-y-1">
            {MOCK_ACTIVITY.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`text-xs font-semibold w-28 flex-shrink-0 ${getEventColor(event.type)}`}>
                    {getEventLabel(event.type)}
                  </div>
                  <div className={`text-xs font-mono truncate ${muted}`}>
                    {event.agent}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  {event.amountOG && (
                    <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {event.amountOG} OG
                    </span>
                  )}
                  <span className={`text-xs ${muted} hidden sm:block`}>
                    {event.timestamp}
                  </span>
                  <ChainScanLink type="tx" value={event.txHash} label="↗" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract verification */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${muted}`}>
          On-Chain Verification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'WorkRegistry',  addr: '0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC', desc: 'TEE-verified job receipts' },
            { name: 'CreditScorer',  addr: '0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602', desc: 'On-chain credit scoring'   },
            { name: 'CreditVault',   addr: '0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D', desc: 'Loan lifecycle management' },
          ].map((c) => (
            <div key={c.name} className={`rounded-xl border p-4 ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {c.name}
              </div>
              <div className={`text-xs mb-2 ${muted}`}>{c.desc}</div>
              <ChainScanLink type="address" value={c.addr} label={`${c.addr.slice(0, 10)}...`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}