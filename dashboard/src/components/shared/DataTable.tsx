import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme'

export interface Column<T> {
  key:       string
  header:    string
  render:    (row: T) => ReactNode
  width?:    string
  align?:    'left' | 'right' | 'center'
}

interface Props<T> {
  columns:     Column<T>[]
  data:        T[]
  onRowClick?: (row: T) => void
  emptyText?:  string
  keyField:    keyof T
}

export function DataTable<T>({ columns, data, onRowClick, emptyText = 'No data', keyField }: Props<T>) {
  const { isDark } = useTheme()
  const alignMap   = { left: 'text-left', right: 'text-right', center: 'text-center' }

  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-200'}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${alignMap[col.align ?? 'left']} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`px-4 py-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${
                    isDark ? 'bg-slate-950 hover:bg-slate-900' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${alignMap[col.align ?? 'left']}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}