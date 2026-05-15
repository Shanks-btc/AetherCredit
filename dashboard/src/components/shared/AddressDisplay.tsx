interface Props {
  address: string
  chars?: number
}

export function AddressDisplay({ address, chars = 6 }: Props) {
  const short = `${address.slice(0, chars)}...${address.slice(-4)}`

  function copy() {
    navigator.clipboard.writeText(address)
  }

  return (
    <span
      onClick={copy}
      title={address}
      className="cursor-pointer font-mono text-sm text-indigo-400 hover:text-indigo-300"
    >
      {short}
    </span>
  )
}