import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, TrendingUp, Activity, Calendar, Zap, AlertTriangle, ArrowRight } from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { useHVACStore } from '@/store/hvacStore'
import { formatRelative } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

export function Dashboard() {
  const contacts = useCRMStore((s) => s.contacts)
  const activities = useCRMStore((s) => s.activities)
  const { jobs, equipment, automations } = useHVACStore()
  const navigate = useNavigate()

  const stats = useMemo(() => ({
    contacts: contacts.length,
    active: contacts.filter((c) => c.status === 'active').length,
    leads: contacts.filter((c) => c.status === 'lead').length,
    jobsToday: jobs.filter((j) => {
      const d = new Date(j.scheduledAt)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    }).length,
    activeJobs: jobs.filter((j) => ['scheduled', 'en_route', 'in_progress'].includes(j.status)).length,
    completedJobs: jobs.filter((j) => j.status === 'completed').length,
    revenue: jobs.filter((j) => j.status === 'completed' && j.invoiceAmount)
      .reduce((sum, j) => sum + (j.invoiceAmount ?? 0), 0),
    serviceDue: equipment.filter((e) => {
      if (!e.nextServiceDate) return false
      return differenceInDays(new Date(e.nextServiceDate), new Date()) <= 30
    }).length,
    activeAutomations: automations.filter((a) => a.enabled).length,
  }), [contacts, jobs, equipment, automations])

  const recentJobs = jobs.slice(0, 5)
  const recentActivities = activities.slice(0, 6)

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Dashboard</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')}>
          <Calendar size={14} /> Schedule Job
        </button>
      </div>

      <div className="page-content fade-in">
        {/* Alerts */}
        {stats.serviceDue > 0 && (
          <div style={{
            background: 'var(--warning-light)', border: '1px solid var(--warning)',
            borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }} onClick={() => navigate('/equipment')}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 500 }}>
              {stats.serviceDue} equipment unit{stats.serviceDue > 1 ? 's' : ''} due for service
            </span>
            <ArrowRight size={14} color="var(--warning)" style={{ marginLeft: 'auto' }} />
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          <StatCard label="Total Contacts" value={stats.contacts} icon={<Users size={16} />} onClick={() => navigate('/contacts')} />
          <StatCard label="Active Jobs" value={stats.activeJobs} icon={<Calendar size={16} />} color="primary" onClick={() => navigate('/jobs')} />
          <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<TrendingUp size={16} />} color="success" />
          <StatCard label="Automations" value={stats.activeAutomations} icon={<Zap size={16} />} color="warning" onClick={() => navigate('/automations')} />
        </div>

        <div className="dashboard-grid">
          {/* Recent Jobs */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Jobs</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            {recentJobs.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <Calendar size={24} style={{ opacity: 0.3 }} />
                <p>No jobs scheduled</p>
              </div>
            ) : (
              recentJobs.map((job) => {
                const contact = contacts.find((c) => c.id === job.contactId)
                return (
                  <div key={job.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }} onClick={() => navigate('/jobs')}>
                    <span style={{ fontSize: 18 }}>
                      {job.type === 'emergency' ? '🚨' : job.type === 'maintenance' ? '🔧' : job.type === 'repair' ? '🛠️' : '📋'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {contact?.firstName} {contact?.lastName}
                      </div>
                    </div>
                    <span className={`badge badge-${job.status === 'completed' ? 'active' : job.status === 'cancelled' ? 'inactive' : 'lead'}`} style={{ fontSize: 11 }}>
                      {job.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/activity')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <Activity size={24} style={{ opacity: 0.3 }} />
                <p>No activity yet</p>
              </div>
            ) : (
              recentActivities.map((a) => (
                <div key={a.id} className="activity-item">
                  <div className={`activity-icon activity-icon-${a.type}`}>
                    {a.type === 'call' ? '📞' : a.type === 'email' ? '✉️' : a.type === 'meeting' ? '🤝' : '📝'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-time">{formatRelative(new Date(a.createdAt))}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: '📅 Schedule Job', to: '/jobs' },
              { label: '👤 Add Contact', to: '/contacts' },
              { label: '⚙️ Track Equipment', to: '/equipment' },
              { label: '⚡ New Automation', to: '/automations' },
              { label: '🔗 Connect App', to: '/integrations' },
            ].map(({ label, to }) => (
              <button key={to} className="btn btn-secondary btn-sm" onClick={() => navigate(to)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, icon, color = 'default', onClick }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string; onClick?: () => void
}) {
  const colorMap: Record<string, string> = {
    default: 'var(--text)', success: 'var(--success)', warning: 'var(--warning)', primary: 'var(--primary)',
  }
  return (
    <div className="stat-card" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="stat-label">{label}</span>
        <span style={{ color: colorMap[color], opacity: 0.7 }}>{icon}</span>
      </div>
      <div className="stat-value" style={{ color: colorMap[color] }}>{value}</div>
    </div>
  )
}
