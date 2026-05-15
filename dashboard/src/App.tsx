import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout }  from './layouts/AppLayout'
import { Landing }    from './pages/Landing'
import { Dashboard }  from './pages/Dashboard'
import { Agents }     from './pages/Agents'
import { Economy }    from './pages/Economy'
import { Waitlist }   from './pages/Waitlist'
import { Onboard }    from './pages/Onboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing — full screen, no AppLayout */}
        <Route path="/" element={<Landing />} />

        {/* Onboard — full screen wizard, no AppLayout */}
        <Route path="/onboard" element={<Onboard />} />

        {/* App pages — wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents"    element={<Agents />}    />
          <Route path="/economy"   element={<Economy />}   />
          <Route path="/waitlist"  element={<Waitlist />}  />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}