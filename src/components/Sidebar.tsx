import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Activity, CreditCard, Settings,
  Zap, Wrench, Link2, Calendar,
} from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { useHVACStore } from '@/store/hvacStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/jobs', icon: Calendar, label: 'Jobs' },
  { to: '/equipment', icon: Wrench, label: 'Equipment' },
  { to: '/automations', icon: Zap, label: 'Automations' },
  { to: '/integrations', icon: Link2, label: 'Integrations' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/pricing', icon: CreditCard, label: 'Pricing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const contacts = useCRMStore((s) => s.contacts)
  const { jobs, automations, integrations } = useHVACStore()

  const badges: Record<string, number | undefined> = {
    '/contacts': contacts.length || undefined,
    '/jobs': jobs.filter((j) => j.status === 'scheduled' || j.status === 'in_progress').length || undefined,
    '/automations': automations.filter((a) => a.enabled).length || undefined,
    '/integrations': integrations.filter((i) => i.connected).length || undefined,
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" />
        </div>
        <span className="sidebar-logo-text">Discsentia</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">HVAC CRM</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
            {badges[to] !== undefined && (
              <span className="nav-item-badge">{badges[to]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" style={{ cursor: 'default' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 12,
          }}>
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
