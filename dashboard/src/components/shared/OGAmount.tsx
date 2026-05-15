import { ethers } from 'ethers'

interface Props {
  wei:       string | bigint
  decimals?: number
  suffix?:   boolean
}

export function OGAmount({ wei, decimals = 4, suffix = true }: Props) {
  const formatted = parseFloat(ethers.formatEther(wei.toString())).toFixed(decimals)
  return (
    <span className="font-mono">
      {formatted}{suffix ? ' OG' : ''}
    </span>
  )
}