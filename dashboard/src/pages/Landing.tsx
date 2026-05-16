import { useNavigate }                    from 'react-router-dom'
import { useTheme }                       from '../lib/theme'
import { ChainScanLink }                  from '../components/shared/ChainScanLink'
import { MOCK_PROTOCOL_STATS }            from '../data/mock'

export function Landing() {
  const { isDark, toggleTheme } = useTheme()
  const navigate                = useNavigate()
  const s                       = MOCK_PROTOCOL_STATS

  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const card  = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0f1e] text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        isDark ? 'bg-[#0a0f1e]/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">Æ</div>
            <span className="font-bold text-base">AetherCredit</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {[
              { label: 'Agents',   to: '/agents'   },
              { label: 'Economy',  to: '/economy'  },
              { label: 'Waitlist', to: '/waitlist' },
            ].map((link) => (
              <button key={link.to} onClick={() => navigate(link.to)} className={`text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors ${isDark ? 'bg-slate-800 border border-slate-700 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-500'}`}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/onboard')}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-sm text-white font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-8 ${isDark ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-indigo-200 bg-indigo-50 text-indigo-600'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Live on 0G Mainnet
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Autonomous Credit
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">for AI Agents</span>
          </h1>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto mb-4 leading-relaxed ${muted}`}>
            AetherCredit is autonomous credit infrastructure for AI agents on the full 0G stack.
            It reads any agent's verified compute history, scores it on-chain from TEE-attested
            job receipts, closed-form, no oracle and disburses working capital from a shared
            credit pool, repaid automatically from earnings with zero human intervention.
          </p>
          <p className={`text-sm font-semibold mb-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Credit for Agents. Built on Proof.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/onboard')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105"
            >
              Get Started →
            </button>
            <button
              onClick={() => navigate('/waitlist')}
              className={`rounded-xl border px-8 py-3.5 text-base font-semibold transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:border-slate-500' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}
            >
              Request Early Access
            </button>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className={`border-y py-10 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Total Disbursed', value: `${s.totalDisbursedOG} OG`, color: 'text-indigo-400' },
              { label: 'Repayment Rate',  value: `${s.repaymentRatePct}%`,   color: 'text-green-400'  },
              { label: 'Active Agents',   value: s.totalAgents,              color: 'text-cyan-400'   },
              { label: 'Verified Jobs',   value: s.totalJobs,                color: 'text-purple-400' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                <div className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>The Problem</div>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI agents are economic actors without credit</h2>
          <p className={`text-base leading-relaxed ${muted}`}>
            Agents can't work without funds. And right now, there's no system to give them credit.
            Every 0G Compute agent must pre-fund its provider account before running a single job.
            Zero balance means zero work. Developers top up wallets manually. That breaks at any meaningful scale.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '⛔', title: 'Upfront Capital Required', desc: 'Agents must pre-fund provider accounts before running any job. No credit, no work.' },
            { icon: '👤', title: 'Manual Human Intervention', desc: 'Developers manually top up balances. Impossible at scale across thousands of agents.' },
            { icon: '📉', title: 'No Credit History', desc: 'Agents have no on-chain financial identity. No way to prove trustworthiness to protocols.' },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl border p-6 ${card}`}>
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
              <p className={`text-sm leading-relaxed ${muted}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={`border-y py-24 ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>The Solution</div>
            <h2 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>How AetherCredit works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Verify Compute Activity', desc: 'TEE-attested job receipts from 0G Compute. Every job verified via broker.inference.processResponse().', color: 'from-indigo-500 to-indigo-600' },
              { step: '02', title: 'On-Chain Scoring',        desc: 'Closed-form scoring from on-chain history. jobScore + spendScore + ageScore. No oracle.',               color: 'from-purple-500 to-purple-600' },
              { step: '03', title: 'Credit Decision',         desc: 'Transparent and verifiable credit assessment on-chain. Decision archived to 0G Storage Log.',           color: 'from-violet-500 to-violet-600' },
              { step: '04', title: 'Disburse Capital',        desc: 'Funds from a shared credit pool to power agents. OG transferred atomically after decision.',            color: 'from-cyan-500 to-cyan-600'   },
              { step: '05', title: 'Auto Repayment',          desc: 'Repaid automatically from agent earnings with zero human intervention. 5% protocol fee.',               color: 'from-green-500 to-green-600'  },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className={`rounded-2xl border p-5 h-full ${card}`}>
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white font-bold text-xs mb-4`}>{item.step}</div>
                  <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`text-xs leading-relaxed ${muted}`}>{item.desc}</p>
                </div>
                {i < 4 && <div className={`hidden sm:block absolute top-10 -right-2 z-10 text-lg ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 0G Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Built on the full 0G Stack</div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Every component is load-bearing</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { name: '0G Compute', desc: 'Verifiable AI inference with TEE attestation. Job receipts are the credit collateral.',                             icon: '⚡', color: 'indigo' },
            { name: '0G Storage', desc: 'Immutable logs and history. Credit decisions archived to Log layer. Work history indexed to KV layer.',             icon: '◈', color: 'purple' },
            { name: '0G Chain',   desc: 'Settlement, finality and credit records. Three contracts handle the full loan lifecycle.',                          icon: '⬡', color: 'cyan'   },
            { name: '0G Network', desc: 'Decentralized infrastructure. No central authority. Everything provable on-chain.',                                 icon: '◆', color: 'green'  },
          ].map((item) => {
            const colors: Record<string, string> = {
              indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
              purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
              cyan:   'bg-cyan-500/10   border-cyan-500/20   text-cyan-400',
              green:  'bg-green-500/10  border-green-500/20  text-green-400',
            }
            return (
              <div key={item.name} className={`rounded-2xl border p-6 ${card}`}>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-lg mb-4 ${colors[item.color]}`}>{item.icon}</div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                <p className={`text-xs leading-relaxed ${muted}`}>{item.desc}</p>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🛡', title: 'Verifiable', desc: 'Every score and decision is backed by on-chain, TEE-verified evidence.'          },
            { icon: '⚡', title: 'Autonomous', desc: 'Agents access capital and repay automatically from earnings.'                     },
            { icon: '🧩', title: 'Composable', desc: 'Open interfaces for agents, protocols and developers.'                           },
            { icon: '🔒', title: 'Trustless',  desc: 'No central authority. Everything is provable, transparent and on-chain.'         },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl border p-5 text-center ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-indigo-300/60' : 'text-indigo-700/60'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Developers */}
      <section className={`border-y py-24 ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>For Developers and Protocols</div>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>No AetherCredit server in the trust path</h2>
            <p className={`text-base max-w-2xl mx-auto ${muted}`}>
              Read credit scores, verify work history, and check loan status directly from 0G Chain and 0G Storage, without touching our API.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl border p-6 ${card}`}>
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl mb-4 text-sm ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-200 text-indigo-600'}`}>⬡</div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>On-Chain Credit Reads</h3>
              <p className={`text-xs mb-4 leading-relaxed ${muted}`}>Any protocol can call CreditScorer directly on 0G Mainnet. No API key. No AetherCredit server. Pure on-chain.</p>
              <code className={`text-xs font-mono block p-3 rounded-lg leading-relaxed ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-white text-cyan-700 border border-slate-200'}`}>
                {`const [score, limitWei] =\n  await creditScorer\n  .calculateScore(\n    agentAddress\n  )`}
              </code>
            </div>
            <div className={`rounded-2xl border p-6 ${card}`}>
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl mb-4 text-sm ${isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-600'}`}>◆</div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>MCP Server</h3>
              <p className={`text-xs mb-4 leading-relaxed ${muted}`}>Claude, Cursor and any AI orchestrator can call AetherCredit tools over stdio. Five tools, no API in the trust path for reads.</p>
              <code className={`text-xs font-mono block p-3 rounded-lg leading-relaxed ${isDark ? 'bg-slate-800 text-purple-400' : 'bg-white text-purple-700 border border-slate-200'}`}>
                {`agentcredit_get_score\nagentcredit_submit_work\nagentcredit_request_credit\nagentcredit_get_loan\nagentcredit_get_history`}
              </code>
            </div>
            <div className={`rounded-2xl border p-6 ${card}`}>
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl mb-4 text-sm ${isDark ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border border-cyan-200 text-cyan-600'}`}>⚡</div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Agent SDK</h3>
              <p className={`text-xs mb-4 leading-relaxed ${muted}`}>Three lines to integrate. Agents submit verified 0G Compute jobs, build credit history, and request working capital autonomously.</p>
              <code className={`text-xs font-mono block p-3 rounded-lg leading-relaxed ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-white text-cyan-700 border border-slate-200'}`}>
                {`await ac.submitWork({\n  provider, chatID,\n  responseHash,\n  computeCostWei\n})\nawait ac.requestCredit(\n  parseEther('0.3')\n)`}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Contracts */}
      <section className={`border-t py-16 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deployed Contracts — 0G Mainnet</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { name: 'WorkRegistry', addr: '0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC', desc: 'TEE-verified job receipts'  },
              { name: 'CreditScorer', addr: '0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602', desc: 'On-chain credit scoring'   },
              { name: 'CreditVault',  addr: '0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D', desc: 'Loan lifecycle management' },
            ].map((c) => (
              <div key={c.name} className={`rounded-xl border p-4 text-center ${card}`}>
                <div className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.name}</div>
                <div className={`text-xs mb-2 ${muted}`}>{c.desc}</div>
                <ChainScanLink type="address" value={c.addr} label={`${c.addr.slice(0, 10)}...`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className={`rounded-3xl border p-12 text-center ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'}`}>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to integrate?</h2>
          <p className={`text-base max-w-xl mx-auto mb-8 ${muted}`}>
            AetherCredit is live on 0G Mainnet. Connect your wallet to view your credit profile or join the waitlist to integrate into your protocol.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/onboard')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105"
            >
              Subscribe →            </button>
            <button
              onClick={() => navigate('/waitlist')}
              className={`rounded-xl border px-8 py-3.5 text-base font-semibold transition-all ${isDark ? 'border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60' : 'border-indigo-200 text-indigo-600 hover:border-indigo-300'}`}
            >
              Request Early Access
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">Æ</div>
            <span className={`text-sm font-medium ${muted}`}>AetherCredit · Credit for Agents. Built on Proof.</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-xs ${muted}`}>0G Mainnet · ChainID 16661</span>
            </div>
            <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className={`text-xs transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
              0G Labs ↗
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}