import { VerifiedBadge } from '../shared/VerifiedBadge'
import { OGAmount }      from '../shared/OGAmount'

interface WorkRecord {
  agent:          string
  provider:       string
  chatIDHash:     string
  responseHash:   string
  computeCostWei: string
  timestamp:      number
  teeVerified:    boolean
}

interface Props {
  records: WorkRecord[]
}

export function WorkHistoryTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 text-center">
        <p className="text-slate-400 text-sm">No work records yet.</p>
        <p className="text-slate-500 text-xs mt-1">
          Submit 0G Compute jobs to build credit history.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 border-b border-slate-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Provider</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Cost</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {records.slice(0, 10).map((record, i) => (
            <tr key={i} className="bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                {new Date(record.timestamp * 1000).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                {record.provider.slice(0, 8)}...{record.provider.slice(-4)}
              </td>
              <td className="px-4 py-3 text-slate-300">
                <OGAmount wei={record.computeCostWei} decimals={4} />
              </td>
              <td className="px-4 py-3">
                <VerifiedBadge verified={record.teeVerified} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}