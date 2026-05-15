import { useState }    from 'react'
import { PageHeader }  from '../components/shared/PageHeader'
import { useTheme }    from '../lib/theme'

export function Waitlist() {
  const { isDark } = useTheme()
  const [email,     setEmail]     = useState('')
  const [role,      setRole]      = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  function handleSubmit() {
    if (!email || !email.includes('@')) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  const card = isDark
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-200 shadow-sm'

  const input = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'

  const muted = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Early Access"
        description="AetherCredit is live on 0G Mainnet. Join the waitlist to integrate credit infrastructure into your protocol or agent."
      />

      {submitted ? (
        <div className={`rounded-2xl border p-10 text-center ${card}`}>
          <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            You are on the list
          </h2>
          <p className={`text-sm ${muted}`}>
            We will reach out with integration details and API access.
          </p>
        </div>
      ) : (
        <div className={`rounded-2xl border p-8 ${card}`}>

          {/* What you get */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '⚡', title: 'SDK Access', desc: 'TypeScript SDK for agent credit integration' },
              { icon: '🔗', title: 'MCP Server', desc: 'Call AetherCredit tools from any AI agent' },
              { icon: '📊', title: 'Protocol API', desc: 'Read credit scores before hiring agents' },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl border p-4 ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xl mb-2">{item.icon}</div>
                <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.title}
                </div>
                <div className={`text-xs ${muted}`}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@protocol.xyz"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${input}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                I am a...
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${input}`}
              >
                <option value="">Select your role</option>
                <option value="agent-developer">AI Agent Developer</option>
                <option value="protocol">Protocol / DAO</option>
                <option value="infrastructure">Infrastructure Builder</option>
                <option value="researcher">Researcher</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-3 text-sm text-white font-semibold transition-colors"
            >
              {loading ? 'Submitting...' : 'Request Early Access'}
            </button>

            <p className={`text-xs text-center ${muted}`}>
              No spam. Integration details only. Unsubscribe anytime.
            </p>
          </div>
        </div>
      )}

      {/* Protocol integration note */}
      <div className={`mt-6 rounded-xl border p-5 ${
        isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
      }`}>
        <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
          Already building? Read the contracts directly.
        </h3>
        <p className={`text-xs mb-3 ${isDark ? 'text-indigo-400/70' : 'text-indigo-600/70'}`}>
          CreditScorer.calculateScore(agentAddress) is callable by any protocol on 0G Mainnet.
          No API key required for on-chain reads.
        </p>
        <code className={`text-xs font-mono block p-3 rounded-lg ${
          isDark ? 'bg-slate-900 text-cyan-400' : 'bg-white text-cyan-700 border border-slate-200'
        }`}>
          {`const [score, limit] = await creditScorer\n  .calculateScore(agentAddress)`}
        </code>
      </div>
    </div>
  )
}