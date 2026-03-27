import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Activity, CreditCard, Settings,
  Zap, Wrench, Link2, Calendar, Download, Menu, X, FileText,
} from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { useHVACStore } from '@/store/hvacStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/jobs', icon: Calendar, label: 'Jobs' },
  { to: '/estimates', icon: FileText, label: 'Estimates' },
  { to: '/equipment', icon: Wrench, label: 'Equipment' },
  { to: '/automations', icon: Zap, label: 'Automations' },
  { to: '/integrations', icon: Link2, label: 'Integrations' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/export', icon: Download, label: 'Export' },
  { to: '/pricing', icon: CreditCard, label: 'Pricing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

// Bottom nav shows only the most important items on mobile/iPad
const bottomNavItems = navItems.slice(0, 5)

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const contacts = useCRMStore((s) => s.contacts)
  const { jobs, automations, integrations } = useHVACStore()

  const badges: Record<string, number | undefined> = {
    '/contacts': contacts.length || undefined,
    '/jobs': jobs.filter((j) => j.status === 'scheduled' || j.status === 'in_progress').length || undefined,
    '/automations': automations.filter((a) => a.enabled).length || undefined,
    '/integrations': integrations.filter((i) => i.connected).length || undefined,
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <Zap size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">Discsentia</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label" aria-hidden="true">HVAC CRM</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              aria-current={undefined}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
              {badges[to] !== undefined && (
                <span className="nav-item-badge" aria-label={`${badges[to]} items`}>{badges[to]}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" style={{ cursor: 'default' }} aria-label="Logged in as Zach Berling, Admin">
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 12, flexShrink: 0,
            }} aria-hidden="true">ZB</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Zach Berling</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── iPad/Mobile: hamburger topbar button (injected via portal-like approach) ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <Menu size={22} />
      </button>

      {/* ── Mobile/iPad slide-over drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="sidebar-logo-icon" aria-hidden="true"><Zap size={16} color="white" /></div>
                <span className="sidebar-logo-text">Discsentia</span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }}>
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                  {badges[to] !== undefined && (
                    <span className="nav-item-badge">{badges[to]}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* ── iPad/Mobile bottom tab bar ── */}
      <nav className="bottom-nav" aria-label="Quick navigation">
        {bottomNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
            {badges[to] !== undefined && (
              <span className="bottom-nav-badge" aria-label={`${badges[to]} items`}>{badges[to]}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
