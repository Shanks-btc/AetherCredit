interface Props {
  type:   'address' | 'tx'
  value:  string
  label?: string
}

export function ChainScanLink({ type, value, label }: Props) {
  const base = 'https://chainscan.0g.ai'
  const url  = `${base}/${type}/${value}`
  const text = label ?? `${value.slice(0, 8)}...${value.slice(-6)}`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline text-sm font-mono">
      {text} ↗
    </a>
  )
}