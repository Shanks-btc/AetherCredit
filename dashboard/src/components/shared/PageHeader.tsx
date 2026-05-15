import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme'

interface Props {
  title:       string
  description?: string
  action?:     ReactNode
}

export function PageHeader({ title, description, action }: Props) {
  const { isDark } = useTheme()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h1>
        {description && (
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}