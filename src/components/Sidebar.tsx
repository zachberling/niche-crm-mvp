import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Activity, CreditCard, Settings, Zap,
} from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/pricing', icon: CreditCard, label: 'Pricing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const contacts = useCRMStore((s) => s.contacts)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" />
        </div>
        <span className="sidebar-logo-text">NicheCRM</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
            {label === 'Contacts' && contacts.length > 0 && (
              <span className="nav-item-badge">{contacts.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" style={{ cursor: 'default' }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 12,
            }}
          >
            ZB
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Zach Berling</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
