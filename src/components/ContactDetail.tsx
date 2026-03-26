import { useState } from 'react'
import { X, Edit2, Trash2, Phone, Mail, Building, Plus } from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { Contact } from '@/types/contact'
import { ActivityType } from '@/types/activity'
import { formatRelative } from '@/lib/utils'

interface Props {
  contact: Contact
  onClose: () => void
  onEdit: () => void
}

const activityTypes: { type: ActivityType; label: string; emoji: string }[] = [
  { type: 'call', label: 'Call', emoji: '📞' },
  { type: 'email', label: 'Email', emoji: '✉️' },
  { type: 'meeting', label: 'Meeting', emoji: '🤝' },
  { type: 'note', label: 'Note', emoji: '📝' },
  { type: 'task', label: 'Task', emoji: '✅' },
]

export function ContactDetail({ contact, onClose, onEdit }: Props) {
  const { deleteContact, addActivity, getContactActivities } = useCRMStore()
  const activities = getContactActivities(contact.id)
  const [logType, setLogType] = useState<ActivityType>('note')
  const [logTitle, setLogTitle] = useState('')

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logTitle.trim()) return
    addActivity({ contactId: contact.id, type: logType, title: logTitle.trim() })
    setLogTitle('')
  }

  const handleDelete = () => {
    deleteContact(contact.id)
    onClose()
  }

  return (
    <div className="detail-panel slide-in" data-testid="contact-detail">
      <div className="detail-header">
        <div className="detail-avatar">{contact.firstName[0]}{contact.lastName[0]}</div>
        <div style={{ flex: 1 }}>
          <div className="detail-name">{contact.firstName} {contact.lastName}</div>
          {contact.company && <div className="detail-company">{contact.company}</div>}
          <span className={`badge badge-${contact.status}`} style={{ marginTop: 6 }}>{contact.status}</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit} title="Edit"><Edit2 size={15} /></button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={handleDelete} title="Delete"><Trash2 size={15} /></button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-section">
          <div className="detail-section-title">Contact Info</div>
          {contact.email && (
            <div className="detail-field">
              <div className="detail-field-label flex items-center gap-2"><Mail size={12} /> Email</div>
              <div className="detail-field-value">{contact.email}</div>
            </div>
          )}
          {contact.phone && (
            <div className="detail-field">
              <div className="detail-field-label flex items-center gap-2"><Phone size={12} /> Phone</div>
              <div className="detail-field-value">{contact.phone}</div>
            </div>
          )}
          {contact.company && (
            <div className="detail-field">
              <div className="detail-field-label flex items-center gap-2"><Building size={12} /> Company</div>
              <div className="detail-field-value">{contact.company}</div>
            </div>
          )}
          {contact.notes && (
            <div className="detail-field">
              <div className="detail-field-label">Notes</div>
              <div className="detail-field-value" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{contact.notes}</div>
            </div>
          )}
        </div>

        <div className="detail-section">
          <div className="detail-section-title">Log Activity</div>
          <form onSubmit={handleLog}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {activityTypes.map(({ type, label, emoji }) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip${logType === type ? ' active' : ''}`}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => setLogType(type)}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
                placeholder={`Add ${logType} note…`}
                style={{ flex: 1 }}
                data-testid="activity-input"
              />
              <button type="submit" className="btn btn-primary btn-sm" data-testid="log-activity-btn">
                <Plus size={14} />
              </button>
            </div>
          </form>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">Activity ({activities.length})</div>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No activity logged yet.</p>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="activity-item">
                <div className={`activity-icon activity-icon-${a.type}`}>
                  {activityTypes.find((t) => t.type === a.type)?.emoji ?? '•'}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{a.title}</div>
                  <div className="activity-time">{formatRelative(a.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
