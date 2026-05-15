import { Navbar }   from './Navbar'
import { useTheme } from '../../lib/theme'

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className={`border-t mt-16 py-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className={`max-w-6xl mx-auto px-4 flex items-center justify-between text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>AetherCredit — Autonomous Credit Infrastructure on 0G</span>
          <div className="flex items-center gap-4">
            <a href="https://chainscan.0g.ai/address/0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">CreditVault ↗</a>
            <a href="https://chainscan.0g.ai/address/0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">WorkRegistry ↗</a>
          </div>
        </div>
      </footer>
    </div>
  )
}