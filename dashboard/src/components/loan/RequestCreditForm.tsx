import { useState }      from 'react'
import { useAccount }    from 'wagmi'
import { ethers }        from 'ethers'
import { OGAmount }      from '../shared/OGAmount'
import { LoadingSpinner } from '../shared/LoadingSpinner'

interface Props {
  limitWei:  string
  onSuccess: () => void
}

export function RequestCreditForm({ limitWei, onSuccess }: Props) {
  const { address } = useAccount()
  const [amount,  setAmount]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const limitOG = parseFloat(ethers.formatEther(limitWei))

  async function handleRequest() {
    if (!address || !amount) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const amountWei = ethers.parseEther(amount).toString()

      // Connect to 0G Mainnet via window.ethereum (Rabby/MetaMask)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer   = await provider.getSigner()

      const vault = new ethers.Contract(
        '0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D',
        ['function requestCredit(uint256 amountWei, bytes32 storageRootHash) external'],
        signer
      )

      const tx      = await vault.requestCredit(amountWei, ethers.ZeroHash)
      const receipt = await tx.wait()

      setSuccess(`Approved! Tx: ${receipt.hash.slice(0, 16)}...`)
      onSuccess()
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Amount (OG) — Max: <OGAmount wei={limitWei} decimals={3} />
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`0.0 – ${limitOG.toFixed(3)}`}
          min="0"
          max={limitOG}
          step="0.001"
          className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {error   && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        onClick={handleRequest}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-2.5 text-white font-semibold transition-colors"
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Request Credit'}
      </button>

      <p className="text-xs text-slate-500 text-center">
        7-day repayment window · 5% fee · Signs via your wallet
      </p>
    </div>
  )
}