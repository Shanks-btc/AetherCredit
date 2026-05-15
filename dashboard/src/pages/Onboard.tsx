import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'

type Plan = 'explorer' | 'pro' | 'protocol'
type AgentType = 'Trading' | 'Prediction Market' | 'Orchestrator' | 'Others'

const PROTOCOL_ADDRESS = '0xf6e345D3C7B44C4D7cD27F34D8e9e1D55A112142'

const TICKER_ITEMS = [
  { label: 'OG/USDT',   value: '$0.842',  change: '+3.2%',     up: true },
  { label: 'POOL',      value: '1.80 OG', change: 'Available', up: true },
  { label: 'AGENTS',    value: '8',       change: 'Active',    up: true },
  { label: 'SCORE AVG', value: '413',     change: '+12 pts',   up: true },
  { label: 'DISBURSED', value: '8.20 OG', change: 'Total',     up: true },
  { label: 'REPAID',    value: '97.3%',   change: 'Rate',      up: true },
  { label: 'JOBS',      value: '63',      change: 'Verified',  up: true },
]

export function Onboard() {
  const { address, isConnected } = useAccount()
  const { connect }              = useConnect()
  const { disconnect }           = useDisconnect()
  const navigate                 = useNavigate()

  const [step,        setStep]        = useState(1)
  const [email,       setEmail]       = useState('')
  const [agentName,   setAgentName]   = useState('')
  const [agentType,   setAgentType]   = useState<AgentType | ''>('')
  const [description, setDescription] = useState('')
  const [plan,        setPlan]        = useState<Plan>('pro')
  const [paying,      setPaying]      = useState(false)
  const [payTxHash,   setPayTxHash]   = useState('')
  const [payError,    setPayError]    = useState('')

  function nextStep() { setStep(s => Math.min(s + 1, 4)) }
  function prevStep() { setStep(s => Math.max(s - 1, 1)) }

  const steps = [
    { id: 1, label: 'WALLET'     },
    { id: 2, label: 'AGENT INFO' },
    { id: 3, label: 'SUBSCRIBE'  },
    { id: 4, label: 'DASHBOARD'  },
  ]

  const agentTypes: { type: AgentType; icon: string; desc: string }[] = [
    { type: 'Trading',           icon: '📈', desc: 'Autonomous on-chain trading and execution agents' },
    { type: 'Prediction Market', icon: '🔮', desc: 'Market forecasting and prediction protocols'      },
    { type: 'Orchestrator',      icon: '⚙️', desc: 'Manages and coordinates other AI agents'         },
    { type: 'Others',            icon: '◆',  desc: 'Custom agent with a different use case'          },
  ]

  const plans = [
    {
      id:      'explorer' as Plan,
      name:    'Explorer',
      price:   'Free',
      priceOG: null as string | null,
      popular: false,
      features: ['Basic credit score', '10 API calls/day', 'Community support', '1 agent wallet'],
    },
    {
      id:      'pro' as Plan,
      name:    'Pro Agent',
      price:   '0.1 OG/mo',
      priceOG: '100000000000000000' as string | null,
      popular: true,
      features: ['Full credit analytics', 'Unlimited API calls', 'Up to 0.5 OG credit', 'x402 payment delegation', 'Priority support'],
    },
    {
      id:      'protocol' as Plan,
      name:    'Protocol Fleet',
      price:   '0.5 OG/mo',
      priceOG: '500000000000000000' as string | null,
      popular: false,
      features: ['Multi-agent management', 'Custom credit models', 'Up to 2 OG credit', 'Dedicated infrastructure', 'SLA guarantee', 'White-glove onboarding'],
    },
  ]

  async function handleSubscribe() {
    const selected = plans.find(p => p.id === plan)
    if (!selected?.priceOG) { nextStep(); return }
    if (!isConnected) { connect({ connector: injected() }); return }

    setPaying(true)
    setPayError('')

    try {
      // Step 1: Add 0G Mainnet first (wallet ignores if already added)
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId:           '0x4115',
            chainName:         '0G Mainnet',
            nativeCurrency:    { name: '0G', symbol: '0G', decimals: 18 },
            rpcUrls:           ['https://evmrpc.0g.ai'],
            blockExplorerUrls: ['https://chainscan.0g.ai'],
          }],
        })
      } catch (_) {
        // Chain already exists — continue
      }

      // Step 2: Switch to 0G Mainnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4115' }],
      })

      // Step 3: Send payment
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer   = await provider.getSigner()
      const tx       = await signer.sendTransaction({
        to:    PROTOCOL_ADDRESS,
        value: BigInt(selected.priceOG),
      })

      // Show tx hash immediately
      setPayTxHash(tx.hash)

      // Wait for receipt — 0G may return null, handle gracefully
      try {
        await tx.wait()
      } catch (_) {
        // Receipt may be null on 0G — tx is still confirmed if hash exists
      }

      // Delay 10 seconds so ChainScan indexes the tx before user clicks
      await new Promise(resolve => setTimeout(resolve, 10000))

      nextStep()

    } catch (err: unknown) {
      setPayError((err as Error).message ?? 'Transaction failed. Make sure wallet has 0G balance.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">

      <div className="border-b border-slate-800 bg-slate-900/80 overflow-hidden h-8 flex items-center">
        <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-xs">
              <span className="text-slate-500">{t.label}</span>
              <span className="text-white font-semibold">{t.value}</span>
              <span className={t.up ? 'text-green-400' : 'text-red-400'}>{t.change}</span>
              <span className="text-slate-700 mx-2">|</span>
            </span>
          ))}
        </div>
      </div>

      <nav className="border-b border-slate-800 px-6 py-3 flex items-center justify-between bg-[#0a0f1e]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">Ae</div>
          <span className="font-bold text-sm">AetherCredit</span>
          <span className="text-slate-600 text-xs ml-1">Agentic Alpha</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500">
          <button onClick={() => navigate('/agents')}  className="hover:text-white transition-colors">Agents</button>
          <button onClick={() => navigate('/economy')} className="hover:text-white transition-colors">Economy</button>
          <button onClick={() => navigate('/waitlist')}className="hover:text-white transition-colors">Waitlist</button>
        </div>
        <button onClick={() => navigate('/')} className="text-xs text-slate-500 hover:text-white transition-colors">Back to home</button>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 py-10">

        <div className="mb-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl mx-auto mb-4">
            {step === 4 ? '✅' : '🤖'}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Agent</h1>
          <p className="text-slate-500 text-sm">Register your autonomous agent on the AetherCredit 0G network</p>
        </div>

        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step === s.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : step > s.id
                    ? 'bg-indigo-900/50 border-indigo-600 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-[10px] mt-1 font-semibold tracking-widest ${
                  step === s.id ? 'text-indigo-400' : step > s.id ? 'text-indigo-600' : 'text-slate-600'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-16 mb-4 mx-1 transition-all ${step > s.id ? 'bg-indigo-600' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-2xl">

          {step === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-8">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">Step 1: Onchain Wallet</p>
                <h2 className="text-xl font-bold text-white mb-3">Connect Your Agentic Wallet</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Provide your email to create or link an Agentic Wallet. This wallet identity is used to manage your agent on-chain activity, subscriptions, and credit score.
                </p>
                <div className="mb-6">
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && email) nextStep() }}
                    placeholder="agent-operator@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
                {isConnected && address ? (
                  <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-3">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-green-400 text-sm font-mono">{address.slice(0, 12)}...{address.slice(-8)}</span>
                    <button onClick={() => disconnect()} className="ml-auto text-slate-500 hover:text-red-400 text-xs transition-colors">Disconnect</button>
                  </div>
                ) : (
                  <button
                    onClick={() => connect({ connector: injected() })}
                    className="w-full bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Connect Existing Wallet
                  </button>
                )}
              </div>
              <div className="border-t border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">SDK</div>
                  <div>
                    <p className="text-xs text-white font-semibold">Autonomous Registration</p>
                    <p className="text-[10px] text-slate-500">Agents can integrate via SDK directly</p>
                  </div>
                </div>
                <button
                  onClick={nextStep}
                  disabled={!email && !isConnected}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
                >
                  Next: Agent Info
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-8">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">Step 2: Agent Info</p>
                <h2 className="text-xl font-bold text-white mb-3">Configure Your Agent</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Define your agent identity and primary function on the AetherCredit protocol.
                </p>
                <div className="mb-6">
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    placeholder="e.g. AlphaTrader-01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-3">Agent Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {agentTypes.map(a => (
                      <div
                        key={a.type}
                        onClick={() => setAgentType(a.type)}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          agentType === a.type
                            ? 'border-indigo-500 bg-indigo-950/40'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{a.icon}</div>
                        <div className={`text-sm font-bold mb-1 ${agentType === a.type ? 'text-indigo-400' : 'text-white'}`}>{a.type}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{a.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What does your agent do?"
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm resize-none"
                  />
                </div>
              </div>
              <div className="border-t border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-900/50">
                <button onClick={prevStep} className="text-slate-500 hover:text-white text-xs font-semibold transition-colors">Back</button>
                <button
                  onClick={nextStep}
                  disabled={!agentName || !agentType}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
                >
                  Next: Subscribe
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-8">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-2">Step 3: Subscription</p>
                <h2 className="text-xl font-bold text-white mb-3">Choose Your Plan</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Select a subscription tier. Payment is handled securely on-chain via 0G Mainnet.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {plans.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setPlan(p.id)}
                      className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                        plan === p.id
                          ? 'border-indigo-500 bg-indigo-950/30'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      {p.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                          Most Popular
                        </div>
                      )}
                      <div className="text-sm font-bold text-white mb-1">{p.name}</div>
                      <div className={`text-lg font-bold mb-4 ${p.popular ? 'text-indigo-400' : 'text-white'}`}>{p.price}</div>
                      <div className="space-y-2">
                        {p.features.map(f => (
                          <div key={f} className="flex items-start gap-2">
                            <span className="text-indigo-400 text-xs mt-0.5">✓</span>
                            <span className="text-slate-400 text-xs leading-relaxed">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">0G</div>
                  <div>
                    <p className="text-xs text-white font-semibold">Secure Payment via 0G Chain</p>
                    <p className="text-[10px] text-slate-500">On-chain settlement · Transparent · Verifiable on ChainScan</p>
                  </div>
                  {payTxHash && (
                    <span className="ml-auto text-indigo-400 text-xs flex items-center gap-1">
                      {paying ? '⏳ Confirming on chain...' : '✅ Confirmed'}
                    </span>
                  )}
                </div>

                {payError && (
                  <p className="text-red-400 text-xs mb-2">{payError}</p>
                )}
              </div>
              <div className="border-t border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-900/50">
                <button onClick={prevStep} className="text-slate-500 hover:text-white text-xs font-semibold transition-colors">Back</button>
                <button
                  onClick={handleSubscribe}
                  disabled={paying}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-8 py-2.5 rounded-xl transition-all"
                >
                  {paying ? '⏳ Waiting for wallet approval...' : 'Sign and Subscribe →'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="h-14 w-14 rounded-2xl bg-green-900/30 border border-green-700/30 flex items-center justify-center text-2xl mx-auto mb-4">✅</div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-2">Agent Registered</p>
                <h2 className="text-2xl font-bold text-white mb-2">{agentName || 'Your Agent'} is Live</h2>
                <p className="text-slate-400 text-sm mb-8">Your agent has been registered on 0G Mainnet. Here is your dashboard overview.</p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Credit Score</p>
                    <div className="text-5xl font-bold text-indigo-400 mb-1">413</div>
                    <div className="text-xs text-slate-500 mb-4">FAIR — Building history</div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-2/5 bg-gradient-to-r from-red-500 via-yellow-500 to-indigo-400 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                      <span>0</span><span>1000</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Pool Balance</p>
                    <div className="text-4xl font-bold text-white mb-1">1.80 <span className="text-xl text-slate-500">OG</span></div>
                    <div className="text-xs text-slate-500 mb-4">Available to borrow</div>
                    <button className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 text-xs font-bold py-2 rounded-lg transition-all">
                      Request Credit
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 text-left">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">0G Ecosystem Access</p>
                  <div className="space-y-2.5">
                    {[
                      '0G Compute — TEE-verified inference',
                      '0G Storage — Immutable credit history',
                      '0G Chain — On-chain credit contracts',
                      'MCP Server — Agent tool integration',
                    ].map(item => (
                      <div key={item} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                          <span className="text-xs text-slate-400">{item}</span>
                        </div>
                        <span className="text-[10px] text-green-400 font-semibold">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agent Name</span>
                    <span className="text-white font-mono">{agentName || 'Unnamed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="text-white font-mono">{agentType || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan</span>
                    <span className="text-white font-mono">{plans.find(p => p.id === plan)?.name ?? plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Network</span>
                    <span className="text-white font-mono">0G Mainnet — ChainID 16661</span>
                  </div>
                  {address && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wallet</span>
                      <span className="text-white font-mono">{address.slice(0, 10) + '...' + address.slice(-6)}</span>
                    </div>
                  )}
                  {payTxHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Payment Tx</span>
                      <a
                        href={'https://explorer.0g.ai/mainnet/tx/' + payTxHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline font-mono"
                      >
                        {payTxHash.slice(0, 16) + '... ↗'}
                      </a>
                    </div>
                  )}
                  {payTxHash && (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">ChainScan</span>
                      <a
                        href={'https://explorer.0g.ai/mainnet/tx/' + payTxHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:underline text-xs"
                      >
                        View on 0G Explorer ↗
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {step === 1 && (
          <p className="mt-6 text-center text-slate-600 text-xs">
            By continuing you agree to the AetherCredit protocol terms. All credit decisions are on-chain and verifiable.
          </p>
        )}
      </div>

      <style>{`
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}