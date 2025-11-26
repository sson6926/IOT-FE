import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard/Dashboard'
import History from './pages/History/History'
import VoiceHistory from './pages/VoiceHistory/VoiceHistory'

const tabs = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
  { id: 'history', path: '/history', label: 'Lịch sử thiết bị' },
  { id: 'voice-history', path: '/voice-history', label: 'Lịch sử giọng nói' },
]

function App() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <span className="top-nav__brand">Nha thong minh</span>
        <div className="top-nav__tabs">
          {tabs.map(({ id, path, label }) => (
            <Link
              key={id}
              to={path}
              className={`top-nav__button ${location.pathname === path ? 'top-nav__button--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/voice-history" element={<VoiceHistory />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
