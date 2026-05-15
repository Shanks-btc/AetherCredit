import { useTheme }      from '../../lib/theme'
import { ChainScanLink } from '../shared/ChainScanLink'

export function Footer() {
  const { isDark } = useTheme()

  return (
    <footer className={`border-t mt-auto ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">Æ</div>
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>AetherCredit</span>
            </div>
            <p className={`text-sm leading-relaxed max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Autonomous credit infrastructure for AI agents on 0G. Verifiable compute history. On-chain scoring. Zero human intervention.
            </p>
            <p className={`text-xs mt-3 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Credit for Agents. Built on Proof.
            </p>
          </div>

          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contracts</h4>
            <div className="space-y-2">
              <div>
                <div className={`text-xs mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>WorkRegistry</div>
                <ChainScanLink type="address" value="0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC" label="0x2B1F...6DC" />
              </div>
              <div>
                <div className={`text-xs mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CreditScorer</div>
                <ChainScanLink type="address" value="0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602" label="0x6902...602" />
              </div>
              <div>
                <div className={`text-xs mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CreditVault</div>
                <ChainScanLink type="address" value="0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D" label="0xa4bF...49D" />
              </div>
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Network</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>0G Mainnet</span>
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ChainID: 16661</div>
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>RPC: evmrpc.0g.ai</div>
              <ChainScanLink type="address" value="0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D" label="ChainScan Explorer" />
            </div>
          </div>
        </div>

        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>2026 AetherCredit. Built on 0G Labs.</span>
          <div className="flex items-center gap-4">
            <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className={`text-xs transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>0G Labs</a>
            <a href="https://chainscan.0g.ai" target="_blank" rel="noopener noreferrer" className={`text-xs transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>Explorer</a>
          </div>
        </div>
      </div>
    </footer>
  )
}