import { Outlet, Navigate } from 'react-router-dom'
import { Navbar }           from '../components/layout/Navbar'
import { Footer }           from '../components/layout/Footer'
import { useTheme }         from '../lib/theme'

function hasOnboarded(): boolean {
  return localStorage.getItem('ac_onboarded') === 'true'
}

export function AppLayout() {
  const { isDark } = useTheme()

  if (!hasOnboarded()) {
    return <Navigate to="/onboard" replace />
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}