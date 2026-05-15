import { useTheme } from '../../lib/theme'

interface Props {
  address: string
  size?:   'sm' | 'md'
}

export function WalletBadge({ address, size = 'md' }: Props) {
  const { isDark } = useTheme()
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`

  function copy() {
    navigator.clipboard.writeText(address)
  }

  return (
    <button
      onClick={copy}
      title={`${address} (click to copy)`}
      className={`inline-flex items-center gap-1.5 rounded-md font-mono transition-colors ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      } ${
        isDark
          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
      {short}
    </button>
  )
}