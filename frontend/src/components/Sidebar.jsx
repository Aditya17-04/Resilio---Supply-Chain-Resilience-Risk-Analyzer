import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { alerts } from '../data/dummyData'
import { useAuth } from '../context/AuthContext'

const activeAlerts = alerts.filter(a => a.status === 'active').length

const navItems = [
  { path: '/', icon: '▦', label: 'Dashboard', exact: true },
  { path: '/map', icon: '🌐', label: 'Supply Chain Map' },
  { path: '/graph', icon: '⬡', label: 'Supplier Graph' },
  { path: '/risk-scoring', icon: '◎', label: 'Risk Scoring' },
  { path: '/prediction', icon: '◈', label: 'Disruption Prediction' },
  { path: '/spof', icon: '⚠', label: 'Single Point Failure' },
  { path: '/alternatives', icon: '⟲', label: 'Alt. Suppliers' },
  { path: '/industries', icon: '⊞', label: 'Industry Monitor' },
  { path: '/alerts', icon: '🔔', label: 'Alerts', badge: activeAlerts },
  { path: '/simulation', icon: '⚙', label: 'Simulation' },
  { path: '/heatmap', icon: '⬛', label: 'Risk Heatmap' },
  { path: '/copilot', icon: '✦', label: 'AI Copilot' },
]

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/signin', { replace: true })
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-slate-900 border-r border-slate-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
            R
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Resilio</div>
            <div className="text-slate-500 text-xs leading-tight">Supply Chain AI</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 pb-2 pt-1">
          Analytics
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            <span className="flex-1 text-xs">{item.label}</span>
            {item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none font-semibold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — Auth Links */}
      <div className="p-3 border-t border-slate-700/50 space-y-1.5">
        {isAuthenticated ? (
          /* Logged-in user info + Sign Out */
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {(user?.name?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-300 truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email || ''}</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <span className="text-base w-5 text-center">⎋</span>
              Sign Out
            </button>
          </div>
        ) : (
          /* Guest — Sign In / Create Account */
          <>
            <Link
              to="/signin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-200"
            >
              <span className="text-base w-5 text-center">🔑</span>
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-300 hover:text-white bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
            >
              <span className="text-base w-5 text-center">✦</span>
              Create Account
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}

