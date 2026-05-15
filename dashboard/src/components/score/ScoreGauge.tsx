interface Props {
  score:    number
  maxScore?: number
}

export function ScoreGauge({ score, maxScore = 1000 }: Props) {
  const pct        = Math.min(100, (score / maxScore) * 100)
  const color      = score >= 700 ? '#22c55e' : score >= 400 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 54

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-36 w-36">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/ {maxScore}</span>
        </div>
      </div>
      <div className="text-sm font-medium" style={{ color }}>
        {score >= 700 ? 'Excellent' : score >= 400 ? 'Good' : score >= 200 ? 'Fair' : 'Building'}
      </div>
    </div>
  )
}