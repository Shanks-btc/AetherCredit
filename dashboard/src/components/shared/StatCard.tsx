import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme'

interface Props {
  label:       string
  value:       string | number
  sub?:        string
  icon?:       ReactNode
  accent?:     'indigo' | 'green' | 'cyan' | 'red' | 'yellow' | 'purple'
  trend?:      'up' | 'down' | 'neutral'
  trendValue?: string
}

const accentMap = {
  indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  green:  'text-green-400  bg-green-400/10  border-green-400/20',
  cyan:   'text-cyan-400   bg-cyan-400/10   border-cyan-400/20',
  red:    'text-red-400    bg-red-400/10    border-red-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

const trendMap = {
  up:      { color: 'text-green-400',  symbol: '↑' },
  down:    { color: 'text-red-400',    symbol: '↓' },
  neutral: { color: 'text-slate-400',  symbol: '→' },
}

export function StatCard({ label, value, sub, icon, accent = 'indigo', trend, trendValue }: Props) {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-xl border p-5 transition-all ${
      isDark
        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium uppercase tracking-wider ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {label}
        </span>
        {icon && (
          <div className={`flex items-center justify-center h-8 w-8 rounded-lg border text-sm ${accentMap[accent]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </div>

      <div className="flex items-center gap-2">
        {sub && (
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {sub}
          </span>
        )}
        {trend && trendValue && (
          <span className={`text-xs font-medium ${trendMap[trend].color}`}>
            {trendMap[trend].symbol} {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}