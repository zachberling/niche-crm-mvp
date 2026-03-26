import { useState } from 'react'
import { Plus, X, Zap, ChevronRight } from 'lucide-react'
import { useHVACStore } from '@/store/hvacStore'
import { AutomationRule, AutomationTrigger, AutomationAction } from '@/types/hvac'
import { formatRelative } from '@/lib/utils'

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  job_completed: '✅ Job Completed',
  job_scheduled: '📅 Job Scheduled',
  equipment_service_due: '🔔 Service Due',
  contact_created: '👤 New Contact',
  no_contact_30_days: '😴 No Contact 30 Days',
  invoice_overdue: '💸 Invoice Overdue',
}

const ACTION_LABELS: Record<AutomationAction, string> = {
  send_sms: '📱 Send SMS',
  send_email: '✉️ Send Email',
  create_job: '🔧 Create Job',
  add_tag: '🏷️ Add Tag',
  notify_slack: '💬 Notify Slack',
  webhook: '🔗 Webhook',
}

const TEMPLATES = [
  {
    name: 'Post-Job Review Request',
    trigger: 'job_completed' as AutomationTrigger,
    action: 'send_sms' as AutomationAction,
    config: { message: 'Hi {name}, thanks for choosing us! Please leave us a review: {review_link}' },
  },
  {
    name: 'Annual Service Reminder',
    trigger: 'equipment_service_due' as AutomationTrigger,
    action: 'send_email' as AutomationAction,
    config: { subject: 'Time for your annual HVAC service!', template: 'service_reminder' },
  },
  {
    name: 'New Lead Welcome',
    trigger: 'contact_created' as AutomationTrigger,
    action: 'send_sms' as AutomationAction,
    config: { message: 'Hi {name}! Thanks for reaching out. We\'ll call you within 2 hours.' },
  },
  {
    name: 'Win-Back Campaign',
    trigger: 'no_contact_30_days' as AutomationTrigger,
    action: 'send_email' as AutomationAction,
    config: { subject: 'We miss you! Special offer inside', template: 'winback' },
  },
  {
    name: 'Job Confirmation SMS',
    trigger: 'job_scheduled' as AutomationTrigger,
    action: 'send_sms' as AutomationAction,
    config: { message: 'Your HVAC appointment is confirmed for {date} at {time}. Reply STOP to cancel.' },
  },
  {
    name: 'Slack Job Alert',
    trigger: 'job_scheduled' as AutomationTrigger,
    action: 'notify_slack' as AutomationAction,
    config: { channel: '#dispatch', message: 'New job scheduled: {title} for {customer}' },
  },
]

export function AutomationsPage() {
  const { automations, addAutomation, deleteAutomation, toggleAutomation } = useHVACStore()
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const addFromTemplate = (t: typeof TEMPLATES[0]) => {
    addAutomation({ name: t.name, trigger: t.trigger, action: t.action, config: t.config, enabled: true })
    setShowTemplates(false)
  }

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Automations</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplates(true)}>
            <Zap size={14} /> Templates
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Rule
          </button>
        </div>
      </div>

      <div className="page-content fade-in">
        <div style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>⚡ Automation Engine</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {automations.filter((a) => a.enabled).length} active rules · {automations.reduce((n, a) => n + a.runCount, 0)} total runs
          </div>
        </div>

        {automations.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">⚡</div>
              <h3>No automations yet</h3>
              <p>Automate follow-ups, reminders, and notifications</p>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplates(true)}>
                  <Zap size={14} /> Use Template
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                  <Plus size={14} /> Build Custom
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {automations.map((rule) => (
              <AutomationCard key={rule.id} rule={rule}
                onToggle={() => toggleAutomation(rule.id)}
                onDelete={() => deleteAutomation(rule.id)} />
            ))}
          </div>
        )}
      </div>

      {showForm && <AutomationForm onClose={() => setShowForm(false)} />}

      {showTemplates && (
        <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
          <div className="modal fade-in" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚡ Automation Templates</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowTemplates(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                One-click automation templates for HVAC businesses
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TEMPLATES.map((t) => (
                  <div key={t.name} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', background: 'var(--bg)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span>{TRIGGER_LABELS[t.trigger]}</span>
                        <ChevronRight size={12} />
                        <span>{ACTION_LABELS[t.action]}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => addFromTemplate(t)}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AutomationCard({ rule, onToggle, onDelete }: {
  rule: AutomationRule; onToggle: () => void; onDelete: () => void
}) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className={`toggle${rule.enabled ? ' on' : ''}`}
          onClick={onToggle}
          aria-label={rule.enabled ? 'Disable' : 'Enable'}
          data-testid="automation-toggle"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{rule.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{TRIGGER_LABELS[rule.trigger]}</span>
            <ChevronRight size={12} />
            <span>{ACTION_LABELS[rule.action]}</span>
            {rule.runCount > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--primary)' }}>
                {rule.runCount} runs
              </span>
            )}
            {rule.lastRunAt && (
              <span>· Last: {formatRelative(new Date(rule.lastRunAt))}</span>
            )}
          </div>
        </div>
        <span className={`badge ${rule.enabled ? 'badge-active' : 'badge-inactive'}`}>
          {rule.enabled ? 'Active' : 'Paused'}
        </span>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onDelete}><X size={14} /></button>
      </div>
    </div>
  )
}

function AutomationForm({ onClose }: { onClose: () => void }) {
  const { addAutomation } = useHVACStore()
  const [form, setForm] = useState({
    name: '',
    trigger: 'job_completed' as AutomationTrigger,
    action: 'send_sms' as AutomationAction,
    message: '',
    webhookUrl: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    addAutomation({
      name: form.name,
      trigger: form.trigger,
      action: form.action,
      enabled: true,
      config: form.action === 'webhook'
        ? { url: form.webhookUrl }
        : { message: form.message },
    })
    onClose()
  }

  const s = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Automation Rule</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Rule Name *</label>
              <input value={form.name} onChange={(e) => s('name', e.target.value)} placeholder="e.g. Post-job follow-up" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>When (Trigger)</label>
                <select value={form.trigger} onChange={(e) => s('trigger', e.target.value)}>
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Then (Action)</label>
                <select value={form.action} onChange={(e) => s('action', e.target.value)}>
                  {Object.entries(ACTION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            {form.action === 'webhook' ? (
              <div className="form-group">
                <label>Webhook URL</label>
                <input value={form.webhookUrl} onChange={(e) => s('webhookUrl', e.target.value)} placeholder="https://hooks.zapier.com/…" />
              </div>
            ) : (
              <div className="form-group">
                <label>Message / Template</label>
                <textarea value={form.message} onChange={(e) => s('message', e.target.value)}
                  placeholder="Use {name}, {date}, {time} as variables…" />
                <span className="text-muted text-sm" style={{ marginTop: 4, display: 'block' }}>
                  Variables: {'{name}'} {'{date}'} {'{time}'} {'{company}'}
                </span>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Rule</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
