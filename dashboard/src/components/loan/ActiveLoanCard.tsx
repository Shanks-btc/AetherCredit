import { OGAmount }      from '../shared/OGAmount'
import { ChainScanLink } from '../shared/ChainScanLink'

interface Loan {
  principalWei: string
  dueBy:        number
  txHash:       string | null
  status:       string
}

interface Props {
  loan: Loan
}

export function ActiveLoanCard({ loan }: Props) {
  const now       = Math.floor(Date.now() / 1000)
  const remaining = Math.max(0, loan.dueBy - now)
  const days      = Math.floor(remaining / 86400)
  const hours     = Math.floor((remaining % 86400) / 3600)
  const isOverdue = remaining === 0

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${
      isOverdue
        ? 'border-red-700 bg-red-900/20'
        : 'border-yellow-700 bg-yellow-900/20'
    }`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Active Loan</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isOverdue ? 'bg-red-800 text-red-300' : 'bg-yellow-800 text-yellow-300'
        }`}>
          {isOverdue ? 'OVERDUE' : 'ACTIVE'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Principal</span>
        <span className="text-white font-bold text-lg">
          <OGAmount wei={loan.principalWei} decimals={3} />
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Repayment Due</span>
        <span className={`font-mono text-sm ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`}>
          {isOverdue ? 'Overdue!' : `${days}d ${hours}h remaining`}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Total Repayment</span>
        <span className="text-white font-mono text-sm">
          <OGAmount wei={(BigInt(loan.principalWei) * 105n / 100n).toString()} decimals={4} />
          <span className="text-slate-500 text-xs ml-1">(+5% fee)</span>
        </span>
      </div>

      {loan.txHash && (
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Transaction</span>
          <ChainScanLink type="tx" value={loan.txHash} />
        </div>
      )}
    </div>
  )
}