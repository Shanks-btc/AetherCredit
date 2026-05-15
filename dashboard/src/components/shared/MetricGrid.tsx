import { type ReactNode } from 'react'

interface Props {
  children:  ReactNode
  cols?:     2 | 3 | 4
  className?: string
}

const colsMap = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function MetricGrid({ children, cols = 4, className = '' }: Props) {
  return (
    <div className={`grid gap-4 ${colsMap[cols]} ${className}`}>
      {children}
    </div>
  )
}