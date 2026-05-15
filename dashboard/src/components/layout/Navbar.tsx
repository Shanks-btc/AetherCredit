import { NavLink, useLocation }                  from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected }                              from 'wagmi/connectors'
import { useTheme }                              from '../../lib/theme'
import { WalletBadge }                           from '../shared/WalletBadge'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/agents',    label: 'Agents'    },
  { to: '/economy',   label: 'Economy'   },
  { to: '/waitlist',  label: 'Waitlist'  },
]

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect }              = useConnect()
  const { disconnect }           = useDisconnect()
  const { isDark, toggleTheme }  = useTheme()
  const location                 = useLocation()
  const isLanding                = location.pathname === '/'

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${
      isDark
        ? 'bg-slate-950/90 border-slate-800'
        : 'bg-white/90 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              Æ
            </div>
            <div className="hidden sm:block">
              <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AetherCredit
              </span>
            </div>
          </NavLink>

          {/* Nav links — hidden on mobile */}
          {!isLanding && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? isDark
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200'
              }`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Wallet */}
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <WalletBadge address={address} size="sm" />
                <button
                  onClick={() => disconnect()}
                  className={`text-xs transition-colors ${
                    isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'
                  }`}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-sm text-white font-medium transition-colors"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {!isLanding && (
          <div className="flex md:hidden gap-1 pb-2 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}