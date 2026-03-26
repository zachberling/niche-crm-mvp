import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, TrendingUp, Activity, UserCheck, ArrowRight } from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { formatRelative } from '@/lib/utils'

export function Dashboard() {
  const contacts = useCRMStore((s) => s.contacts)
  const activities = useCRMStore((s) => s.activities)
  const navigate = useNavigate()

  const stats = useMemo(() => ({
    total: contacts.length,
    leads: contacts.filter((c) => c.status === 'lead').length,
    active: contacts.filter((c) => c.status === 'active').length,
    inactive: contacts.filter((c) => c.status === 'inactive').length,
  }), [contacts])

  const recentContacts = contacts.slice(0, 5)
  const recentActivities = activities.slice(0, 8)

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Dashboard</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/contacts')}>
          <Users size={14} /> Manage Contacts
        </button>
      </div>

      <div className="page-content fade-in">
        <div className="stats-grid">
          <StatCard label="Total Contacts" value={stats.total} icon={<Users size={18} />} />
          <StatCard label="Active Clients" value={stats.active} icon={<UserCheck size={18} />} color="success" />
          <StatCard label="Leads" value={stats.leads} icon={<TrendingUp size={18} />} color="warning" />
          <StatCard label="Activities" value={activities.length} icon={<Activity size={18} />} color="primary" />
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Contacts</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/contacts')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            {recentContacts.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <Users size={28} style={{ opacity: 0.3 }} />
                <p>No contacts yet</p>
              </div>
            ) : (
              <div>
                {recentContacts.map((c) => (
                  <div
                    key={c.id}
                    className="contact-name-cell"
                    style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => navigate('/contacts')}
                  >
                    <div className="contact-avatar">{c.firstName[0]}{c.lastName[0]}</div>
                    <div>
                      <div className="contact-name">{c.firstName} {c.lastName}</div>
                      <div className="contact-email">{c.company || c.email || '—'}</div>
                    </div>
                    <span className={`badge badge-${c.status} ml-auto`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/activity')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <Activity size={28} style={{ opacity: 0.3 }} />
                <p>No activity yet</p>
              </div>
            ) : (
              <div>
                {recentActivities.map((a) => (
                  <div key={a.id} className="activity-item">
                    <div className={`activity-icon activity-icon-${a.type}`}>
                      {activityEmoji(a.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{a.title}</div>
                      <div className="activity-time">{formatRelative(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, icon, color = 'default' }: {
  label: string; value: number; icon: React.ReactNode; color?: string
}) {
  const colorMap: Record<string, string> = {
    default: 'var(--text)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    primary: 'var(--primary)',
  }
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="stat-label">{label}</span>
        <span style={{ color: colorMap[color], opacity: 0.7 }}>{icon}</span>
      </div>
      <div className="stat-value" style={{ color: colorMap[color] }}>{value}</div>
    </div>
  )
}

function activityEmoji(type: string) {
  const map: Record<string, string> = {
    call: '📞', email: '✉️', meeting: '🤝', note: '📝', task: '✅', status_change: '🔄',
  }
  return map[type] || '•'
}
