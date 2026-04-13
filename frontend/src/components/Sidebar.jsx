import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Brain, BarChart3, Info } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/predict', icon: Brain, label: 'Predict' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/about', icon: Info, label: 'About' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Brain size={20} />
        </div>
        <div>
          <h1>EduAI</h1>
          <span>Performance Analyzer</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 EduAI System</p>
        <p>Built with AI & ML</p>
      </div>
    </aside>
  )
}
