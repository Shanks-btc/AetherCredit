import { OGAmount } from '../shared/OGAmount'

interface Props {
  score:         number
  limitWei:      string
  verifiedJobs:  number
  totalSpendWei: string
}

export function ScoreBreakdown({ score, limitWei, verifiedJobs, totalSpendWei }: Props) {
  const jobScore   = Math.min(400, verifiedJobs * 40)
  const spendScore = Math.min(500, Math.floor(Number(BigInt(totalSpendWei) / BigInt('100000000000000'))))

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        Score Breakdown
      </h3>

      <div className="space-y-2">
        {/* Job score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Verified Jobs ({verifiedJobs})</span>
          <span className="text-sm font-mono text-indigo-400">+{jobScore} pts</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-indigo-500"
            style={{ width: `${(jobScore / 400) * 100}%` }}
          />
        </div>

        {/* Spend score */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-slate-400">
            Compute Spend (<OGAmount wei={totalSpendWei} decimals={4} />)
          </span>
          <span className="text-sm font-mono text-purple-400">+{spendScore} pts</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-purple-500"
            style={{ width: `${Math.min(100, (spendScore / 500) * 100)}%` }}
          />
        </div>
      </div>

      {/* Credit limit */}
      <div className="mt-4 rounded-lg bg-slate-800 border border-slate-700 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Credit Limit</span>
          <span className="text-lg font-bold text-green-400">
            <OGAmount wei={limitWei} decimals={3} />
          </span>
        </div>
      </div>
    </div>
  )
}