import { useState }     from 'react'
import { PageHeader }   from '../components/shared/PageHeader'
import { DataTable }    from '../components/shared/DataTable'
import { StatCard }     from '../components/shared/StatCard'
import { MetricGrid }   from '../components/shared/MetricGrid'
import { useTheme }     from '../lib/theme'
import { ChainScanLink } from '../components/shared/ChainScanLink'
import {
  MOCK_AGENTS,
  MOCK_PROTOCOL_STATS,
  getRiskColor,
  getRiskBg,
  type Agent,
} from '../data/mock'

export function Agents() {
  const { isDark }             = useTheme()
  const [search, setSearch]    = useState('')
  const [selected, setSelected] = useState<Agent | null>(null)

  const card  = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const text  = isDark ? 'text-white' : 'text-slate-900'
  const input = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'

  const filtered = MOCK_AGENTS.filter((a) =>
    a.address.toLowerCase().includes(search.toLowerCase()) ||
    a.shortAddress.toLowerCase().includes(search.toLowerCase())
  )

  function scoreColor(score: number) {
    if (score >= 700) return 'text-green-400'
    if (score >= 400) return 'text-yellow-400'
    return 'text-red-400'
  }

  function scoreBar(score: number) {
    const pct = (score / 1000) * 100
    const color = score >= 700 ? 'bg-green-400' : score >= 400 ? 'bg-yellow-400' : 'bg-red-400'
    return (
      <div className="flex items-center gap-2">
        <div className={`text-sm font-bold font-mono ${scoreColor(score)}`}>{score}</div>
        <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Intelligence"
        description="Credit scores, loan history and risk profiles for all agents on AetherCredit."
      />

      {/* Stats */}
      <MetricGrid cols={4}>
        <StatCard label="Total Agents"   value={MOCK_PROTOCOL_STATS.totalAgents}  sub="on-chain"         accent="indigo" icon="◆" />
        <StatCard label="Active Loans"   value={MOCK_PROTOCOL_STATS.activeLoansCount} sub="outstanding"  accent="yellow" icon="◎" />
        <StatCard label="Total Jobs"     value={MOCK_PROTOCOL_STATS.totalJobs}    sub="TEE-verified"     accent="cyan"   icon="⬡" />
        <StatCard label="Repayment Rate" value={`${MOCK_PROTOCOL_STATS.repaymentRatePct}%`} sub="all time" accent="green" icon="↺" />
      </MetricGrid>

      <div className={`grid gap-6 ${selected ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>

        {/* Table */}
        <div className={selected ? 'lg:col-span-2' : ''}>
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by wallet address..."
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${input}`}
            />
          </div>

          <DataTable<Agent>
            keyField="address"
            data={filtered}
            onRowClick={(row) => setSelected(selected?.address === row.address ? null : row)}
            columns={[

{
  key:    'rank',
  header: '#',
  width:  '48px',
  render: (row) => (
    <span className={`text-xs font-mono ${muted}`}>
      {MOCK_AGENTS.findIndex(a => a.address === row.address) + 1}
    </span>
  ),
},
              {
                key:    'address',
                header: 'Agent',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {row.shortAddress}
                    </span>
                  </div>
                ),
              },
              {
                key:    'score',
                header: 'Credit Score',
                render: (row) => (
                  <div className="w-32">{scoreBar(row.score)}</div>
                ),
              },
              {
                key:    'limitOG',
                header: 'Limit',
                align:  'right',
                render: (row) => (
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {row.limitOG} OG
                  </span>
                ),
              },
              {
                key:    'verifiedJobs',
                header: 'Jobs',
                align:  'right',
                render: (row) => (
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {row.verifiedJobs}
                  </span>
                ),
              },
              {
                key:    'risk',
                header: 'Risk',
                render: (row) => (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${getRiskBg(row.risk)} ${getRiskColor(row.risk)}`}>
                    {row.risk}
                  </span>
                ),
              },
              {
                key:    'lastActive',
                header: 'Last Active',
                render: (row) => (
                  <span className={`text-xs ${muted}`}>{row.lastActive}</span>
                ),
              },
            ]}
            emptyText="No agents found matching your search."
          />
        </div>

        {/* Agent profile panel */}
        {selected && (
          <div className={`rounded-2xl border p-6 space-y-5 h-fit ${card}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className={`text-sm font-bold ${text}`}>Agent Profile</h2>
                <p className={`text-xs mt-0.5 ${muted}`}>Click row to close</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className={`text-xs ${muted} hover:text-red-400 transition-colors`}
              >
                ✕
              </button>
            </div>

            {/* Avatar + address */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
              <div>
                <div className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {selected.shortAddress}
                </div>
                <ChainScanLink type="address" value={selected.address} label="View on ChainScan" />
              </div>
            </div>

            {/* Score */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-xs ${muted} mb-1`}>Credit Score</div>
              <div className={`text-3xl font-bold mb-2 ${scoreColor(selected.score)}`}>
                {selected.score}
                <span className={`text-sm font-normal ml-1 ${muted}`}>/1000</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full ${
                    selected.score >= 700 ? 'bg-green-400' :
                    selected.score >= 400 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${(selected.score / 1000) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Credit Limit',    value: `${selected.limitOG} OG`        },
                { label: 'Verified Jobs',   value: selected.verifiedJobs            },
                { label: 'Total Borrowed',  value: `${selected.totalBorrowedOG} OG` },
                { label: 'Total Repaid',    value: `${selected.totalRepaidOG} OG`   },
                { label: 'Active Loans',    value: selected.activeLoans             },
                { label: 'Defaults',        value: selected.defaults                },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg border p-3 ${
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs ${muted} mb-0.5`}>{item.label}</div>
                  <div className={`text-sm font-bold font-mono ${text}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Risk badge */}
            <div className="flex items-center justify-between">
              <span className={`text-xs ${muted}`}>Risk Level</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getRiskBg(selected.risk)} ${getRiskColor(selected.risk)}`}>
                {selected.risk} risk
              </span>
            </div>

            {/* Last active */}
            <div className="flex items-center justify-between">
              <span className={`text-xs ${muted}`}>Last Active</span>
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {selected.lastActive}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}