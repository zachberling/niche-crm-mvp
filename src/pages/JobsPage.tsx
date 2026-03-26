import { useState, useMemo } from 'react'
import { Plus, Calendar, Clock, User, MapPin, Zap, X, ChevronDown } from 'lucide-react'
import { useHVACStore } from '@/store/hvacStore'
import { useCRMStore } from '@/store/crmStore'
import { Job, JobStatus, JobType, Priority } from '@/types/hvac'
import { format } from 'date-fns'

const STATUS_COLORS: Record<JobStatus, string> = {
  scheduled: 'badge-lead',
  en_route: 'badge-active',
  in_progress: 'badge-active',
  completed: 'badge-active',
  cancelled: 'badge-inactive',
  no_show: 'badge-inactive',
}

const STATUS_LABELS: Record<JobStatus, string> = {
  scheduled: '📅 Scheduled', en_route: '🚗 En Route', in_progress: '🔧 In Progress',
  completed: '✅ Completed', cancelled: '❌ Cancelled', no_show: '👻 No Show',
}

const TYPE_ICONS: Record<JobType, string> = {
  maintenance: '🔧', repair: '🛠️', installation: '📦', inspection: '🔍', emergency: '🚨', estimate: '📋',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'var(--text-muted)', normal: 'var(--text)', high: 'var(--warning)', emergency: 'var(--danger)',
}

export function JobsPage() {
  const { jobs, updateJob, deleteJob } = useHVACStore()
  const contacts = useCRMStore((s) => s.contacts)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<JobStatus | 'all'>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const filtered = useMemo(() =>
    filter === 'all' ? jobs : jobs.filter((j) => j.status === filter),
    [jobs, filter]
  )

  const counts = useMemo(() => ({
    all: jobs.length,
    scheduled: jobs.filter((j) => j.status === 'scheduled').length,
    in_progress: jobs.filter((j) => j.status === 'in_progress').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
  }), [jobs])

  const getContact = (id: string) => contacts.find((c) => c.id === id)

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Jobs & Dispatch</h1>
        <div className="flex gap-2 items-center">
          <span className="text-muted text-sm">{counts.scheduled} scheduled · {counts.in_progress} active</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Job
          </button>
        </div>
      </div>

      <div className="page-content fade-in">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          {(['all', 'scheduled', 'in_progress', 'completed'] as const).map((s) => (
            <div
              key={s}
              className="stat-card"
              style={{ cursor: 'pointer', borderColor: filter === s ? 'var(--primary)' : undefined }}
              onClick={() => setFilter(s)}
            >
              <div className="stat-label">{s === 'all' ? 'Total Jobs' : STATUS_LABELS[s as JobStatus]}</div>
              <div className="stat-value">{counts[s]}</div>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          {(['all', 'scheduled', 'en_route', 'in_progress', 'completed', 'cancelled'] as const).map((s) => (
            <button key={s} className={`filter-chip${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : STATUS_LABELS[s as JobStatus]}
            </button>
          ))}
        </div>

        {/* Jobs table */}
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <h3>No jobs yet</h3>
              <p>Schedule your first job to get started</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                <Plus size={14} /> New Job
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Job</th><th>Customer</th><th>Scheduled</th>
                    <th>Technician</th><th>Priority</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => {
                    const contact = getContact(job.contactId)
                    return (
                      <tr key={job.id} onClick={() => setSelectedJob(job)} data-testid="job-row">
                        <td>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 18 }}>{TYPE_ICONS[job.type]}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{job.title}</div>
                              <div className="text-muted text-sm">{job.type}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {contact ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{contact.firstName} {contact.lastName}</div>
                              {job.address && <div className="text-muted text-sm">{job.address}</div>}
                            </div>
                          ) : <span className="text-muted">—</span>}
                        </td>
                        <td className="text-sm">
                          <div>{format(new Date(job.scheduledAt), 'MMM d, yyyy')}</div>
                          <div className="text-muted">{format(new Date(job.scheduledAt), 'h:mm a')}</div>
                        </td>
                        <td className="text-muted text-sm">{job.technicianName || '—'}</td>
                        <td>
                          <span style={{ color: PRIORITY_COLORS[job.priority], fontWeight: 500, fontSize: 12 }}>
                            {job.priority === 'emergency' ? '🚨 ' : ''}{job.priority}
                          </span>
                        </td>
                        <td>
                          <StatusDropdown
                            value={job.status}
                            onChange={(s) => updateJob(job.id, { status: s })}
                          />
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteJob(job.id)}>
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && <JobForm onClose={() => setShowForm(false)} contacts={contacts} />}
      {selectedJob && !showForm && (
        <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)}
          contact={getContact(selectedJob.contactId)}
          onUpdate={(d) => updateJob(selectedJob.id, d)} />
      )}
    </>
  )
}

function StatusDropdown({ value, onChange }: { value: JobStatus; onChange: (s: JobStatus) => void }) {
  const [open, setOpen] = useState(false)
  const statuses: JobStatus[] = ['scheduled', 'en_route', 'in_progress', 'completed', 'cancelled', 'no_show']
  return (
    <div style={{ position: 'relative' }}>
      <button
        className={`badge ${STATUS_COLORS[value]}`}
        style={{ cursor: 'pointer', border: 'none', gap: 4 }}
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
      >
        {STATUS_LABELS[value]} <ChevronDown size={10} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', minWidth: 140, boxShadow: 'var(--shadow)',
        }}>
          {statuses.map((s) => (
            <button key={s} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', background: 'none', border: 'none',
              color: 'var(--text)', cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--font)',
            }}
              onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false) }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function JobForm({ onClose, contacts }: { onClose: () => void; contacts: ReturnType<typeof useCRMStore.getState>['contacts'] }) {
  const { addJob } = useHVACStore()
  const [form, setForm] = useState({
    contactId: contacts[0]?.id ?? '',
    type: 'maintenance' as JobType,
    priority: 'normal' as Priority,
    title: '',
    description: '',
    scheduledAt: new Date().toISOString().slice(0, 16),
    technicianName: '',
    address: '',
    estimatedDuration: 60,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.contactId) return
    addJob({
      ...form,
      status: 'scheduled',
      scheduledAt: new Date(form.scheduledAt),
      estimatedDuration: Number(form.estimatedDuration),
    })
    onClose()
  }

  const s = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Schedule Job</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer *</label>
              <select value={form.contactId} onChange={(e) => s('contactId', e.target.value)} required>
                <option value="">Select customer…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.company ? `— ${c.company}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Job Title *</label>
              <input value={form.title} onChange={(e) => s('title', e.target.value)} placeholder="AC tune-up, furnace repair…" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => s('type', e.target.value)}>
                  {(['maintenance','repair','installation','inspection','emergency','estimate'] as JobType[]).map((t) => (
                    <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => s('priority', e.target.value)}>
                  {(['low','normal','high','emergency'] as Priority[]).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Scheduled Date & Time</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => s('scheduledAt', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Est. Duration (min)</label>
                <input type="number" value={form.estimatedDuration} onChange={(e) => s('estimatedDuration', e.target.value)} min={15} step={15} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Technician</label>
                <input value={form.technicianName} onChange={(e) => s('technicianName', e.target.value)} placeholder="Assign technician…" />
              </div>
              <div className="form-group">
                <label>Service Address</label>
                <input value={form.address} onChange={(e) => s('address', e.target.value)} placeholder="123 Main St…" />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.description} onChange={(e) => s('description', e.target.value)} placeholder="Job details…" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Schedule Job</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function JobDetail({ job, contact, onClose, onUpdate }: {
  job: Job; contact: any; onClose: () => void; onUpdate: (d: Partial<Job>) => void
}) {
  return (
    <div className="detail-panel slide-in">
      <div className="detail-header">
        <div style={{ fontSize: 32 }}>{TYPE_ICONS[job.type]}</div>
        <div style={{ flex: 1 }}>
          <div className="detail-name">{job.title}</div>
          <div className="detail-company">{contact?.firstName} {contact?.lastName}</div>
          <StatusDropdown value={job.status} onChange={(s) => onUpdate({ status: s })} />
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="detail-body">
        <div className="detail-section">
          <div className="detail-section-title">Details</div>
          <InfoRow icon={<Calendar size={13} />} label="Scheduled" value={format(new Date(job.scheduledAt), 'MMM d, yyyy h:mm a')} />
          {job.estimatedDuration && <InfoRow icon={<Clock size={13} />} label="Duration" value={`${job.estimatedDuration} min`} />}
          {job.technicianName && <InfoRow icon={<User size={13} />} label="Technician" value={job.technicianName} />}
          {job.address && <InfoRow icon={<MapPin size={13} />} label="Address" value={job.address} />}
          <InfoRow icon={<Zap size={13} />} label="Priority" value={job.priority} />
        </div>
        {job.description && (
          <div className="detail-section">
            <div className="detail-section-title">Notes</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.description}</p>
          </div>
        )}
        {job.invoiceAmount && (
          <div className="detail-section">
            <div className="detail-section-title">Invoice</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
              ${job.invoiceAmount.toFixed(2)}
            </div>
          </div>
        )}
        <div className="form-group" style={{ marginTop: 8 }}>
          <label>Invoice Amount ($)</label>
          <input type="number" placeholder="0.00" step="0.01"
            defaultValue={job.invoiceAmount}
            onBlur={(e) => onUpdate({ invoiceAmount: parseFloat(e.target.value) || undefined })}
          />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="detail-field">
      <div className="detail-field-label flex items-center gap-2">{icon} {label}</div>
      <div className="detail-field-value">{value}</div>
    </div>
  )
}
