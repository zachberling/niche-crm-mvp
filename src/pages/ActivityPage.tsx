import { useCRMStore } from '@/store/crmStore'
import { formatRelative } from '@/lib/utils'
import { Activity } from 'lucide-react'

const typeEmoji: Record<string, string> = {
  call: '📞', email: '✉️', meeting: '🤝', note: '📝', task: '✅', status_change: '🔄',
}

export function ActivityPage() {
  const activities = useCRMStore((s) => s.activities)
  const contacts = useCRMStore((s) => s.contacts)

  const getContactName = (id: string) => {
    const c = contacts.find((c) => c.id === id)
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown'
  }

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Activity Feed</h1>
        <span className="text-muted text-sm">{activities.length} total events</span>
      </div>

      <div className="page-content fade-in">
        <div className="card" style={{ padding: 0 }}>
          {activities.length === 0 ? (
            <div className="empty-state">
              <Activity size={36} style={{ opacity: 0.3 }} />
              <h3>No activity yet</h3>
              <p>Log calls, emails, and meetings from a contact's detail panel.</p>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {activities.map((a) => (
                <div key={a.id} className="activity-item" style={{ padding: '14px 20px' }}>
                  <div className={`activity-icon activity-icon-${a.type}`}>
                    {typeEmoji[a.type] ?? '•'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-desc">
                      {a.type.charAt(0).toUpperCase() + a.type.slice(1)} · {getContactName(a.contactId)}
                    </div>
                    <div className="activity-time">{formatRelative(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
