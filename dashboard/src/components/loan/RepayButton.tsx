import { useState }      from 'react'
import { useAccount }    from 'wagmi'
import { ethers }        from 'ethers'
import { OGAmount }      from '../shared/OGAmount'
import { LoadingSpinner } from '../shared/LoadingSpinner'

interface Props {
  principalWei: string
  onSuccess:    () => void
}

export function RepayButton({ principalWei, onSuccess }: Props) {
  const { address }           = useAccount()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // principal + 5% fee
  const principal    = BigInt(principalWei)
  const fee          = (principal * 500n) / 10000n
  const totalOwed    = principal + fee

  async function handleRepay() {
    if (!address) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer   = await provider.getSigner()

      const vault = new ethers.Contract(
        '0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D',
        ['function repay() external payable'],
        signer
      )

      const tx      = await vault.repay({ value: totalOwed })
      const receipt = await tx.wait()

      setSuccess(`Repaid! Tx: ${receipt.hash.slice(0, 16)}...`)
      onSuccess()
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Principal</span>
          <OGAmount wei={principalWei} decimals={4} />
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-slate-400">Fee (5%)</span>
          <OGAmount wei={fee.toString()} decimals={4} />
        </div>
        <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-slate-700">
          <span className="text-white">Total</span>
          <span className="text-green-400"><OGAmount wei={totalOwed.toString()} decimals={4} /></span>
        </div>
      </div>

      {error   && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        onClick={handleRepay}
        disabled={loading}
        className="w-full rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-slate-700 px-4 py-2.5 text-white font-semibold transition-colors"
      >
        {loading ? <LoadingSpinner size="sm" /> : `Repay ${ethers.formatEther(totalOwed)} OG`}
      </button>
    </div>
  )
}