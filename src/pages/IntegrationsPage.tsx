import { useState } from 'react'
import { ExternalLink, Check, X, Settings, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useHVACStore } from '@/store/hvacStore'
import { Integration } from '@/types/hvac'

const INTEGRATION_META: Record<string, {
  icon: string; desc: string; category: string; docsUrl: string
  fields: { key: string; label: string; type?: string }[]
  validatable: boolean; oauthNote?: string
}> = {
  twilio: {
    icon: '📱', category: 'Communication', docsUrl: 'https://twilio.com',
    desc: 'Send automated SMS reminders, confirmations, and follow-ups.',
    fields: [{ key: 'accountSid', label: 'Account SID' }, { key: 'authToken', label: 'Auth Token', type: 'password' }, { key: 'fromNumber', label: 'From Number (+1...)' }],
    validatable: true,
  },
  sendgrid: {
    icon: '✉️', category: 'Communication', docsUrl: 'https://sendgrid.com',
    desc: 'Send transactional emails and marketing campaigns.',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }, { key: 'fromEmail', label: 'From Email' }],
    validatable: true,
  },
  slack: {
    icon: '💬', category: 'Communication', docsUrl: 'https://api.slack.com/messaging/webhooks',
    desc: 'Get real-time job alerts and notifications in Slack.',
    fields: [{ key: 'webhookUrl', label: 'Incoming Webhook URL' }, { key: 'channel', label: 'Channel (e.g. #dispatch)' }],
    validatable: true,
  },
  google_calendar: {
    icon: '📅', category: 'Scheduling', docsUrl: 'https://calendar.google.com',
    desc: 'Sync jobs and appointments with Google Calendar.',
    fields: [{ key: 'calendarId', label: 'Calendar ID' }, { key: 'apiKey', label: 'OAuth Access Token', type: 'password' }],
    validatable: true,
    oauthNote: 'Requires Google OAuth — get token from Google Cloud Console',
  },
  quickbooks: {
    icon: '💰', category: 'Finance', docsUrl: 'https://developer.intuit.com',
    desc: 'Sync invoices and customer data with QuickBooks.',
    fields: [{ key: 'clientId', label: 'Client ID' }, { key: 'clientSecret', label: 'Client Secret', type: 'password' }],
    validatable: false,
    oauthNote: 'Requires QuickBooks OAuth 2.0 authorization flow',
  },
  zapier: {
    icon: '⚡', category: 'Automation', docsUrl: 'https://zapier.com/apps/webhook',
    desc: 'Connect to 5,000+ apps via Zapier webhooks.',
    fields: [{ key: 'webhookUrl', label: 'Zapier Catch Hook URL' }],
    validatable: true,
  },
  servicetitan: {
    icon: '🔧', category: 'Field Service', docsUrl: 'https://developer.servicetitan.io',
    desc: 'Sync jobs, customers, and invoices with ServiceTitan.',
    fields: [{ key: 'tenantId', label: 'Tenant ID' }, { key: 'apiKey', label: 'API Key', type: 'password' }],
    validatable: false,
    oauthNote: 'Requires ServiceTitan enterprise API access',
  },
  housecall_pro: {
    icon: '🏠', category: 'Field Service', docsUrl: 'https://docs.housecallpro.com',
    desc: 'Import customers and jobs from Housecall Pro.',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
    validatable: true,
  },
}

const CATEGORIES = ['All', 'Communication', 'Scheduling', 'Finance', 'Automation', 'Field Service']

export function IntegrationsPage() {
  const { integrations, connectIntegration, disconnectIntegration } = useHVACStore()
  const [category, setCategory] = useState('All')
  const [configuring, setConfiguring] = useState<Integration | null>(null)

  const filtered = integrations.filter((i) =>
    category === 'All' || INTEGRATION_META[i.id]?.category === category
  )
  const connected = integrations.filter((i) => i.connected).length

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Integrations</h1>
        <span className="text-muted text-sm">{connected} of {integrations.length} connected</span>
      </div>

      <div className="page-content fade-in">
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          {CATEGORIES.map((c) => (
            <button key={c} className={`filter-chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((integration) => {
            const meta = INTEGRATION_META[integration.id]
            if (!meta) return null
            return (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                meta={meta}
                onConfigure={() => setConfiguring(integration)}
                onDisconnect={() => disconnectIntegration(integration.id)}
              />
            )
          })}
        </div>
      </div>

      {configuring && (
        <ConfigModal
          integration={configuring}
          meta={INTEGRATION_META[configuring.id]}
          onSave={(config) => { connectIntegration(configuring.id, config); setConfiguring(null) }}
          onClose={() => setConfiguring(null)}
        />
      )}
    </>
  )
}

function IntegrationCard({ integration, meta, onConfigure, onDisconnect }: {
  integration: Integration; meta: typeof INTEGRATION_META[string]
  onConfigure: () => void; onDisconnect: () => void
}) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleTest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setTesting(true)
    setTestResult(null)
    try {
      const r = await fetch('/api/validate-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: integration.id, config: integration.config }),
      })
      const data = await r.json()
      setTestResult(data)
    } catch {
      setTestResult({ ok: false, message: 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-sm)',
          background: 'var(--bg)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{integration.name}</span>
            {integration.connected && <span className="badge badge-active" style={{ fontSize: 11 }}><Check size={10} /> Connected</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{meta.category}</div>
        </div>
        <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm">
          <ExternalLink size={13} />
        </a>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{meta.desc}</p>

      {testResult && (
        <div style={{
          padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12,
          background: testResult.ok ? 'var(--success-light)' : 'var(--danger-light)',
          color: testResult.ok ? 'var(--success)' : 'var(--danger)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {testResult.ok ? <Check size={12} /> : <AlertCircle size={12} />}
          {testResult.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        {integration.connected ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={onConfigure} style={{ flex: 1 }}>
              <Settings size={13} /> Configure
            </button>
            {meta.validatable && (
              <button className="btn btn-secondary btn-sm" onClick={handleTest} disabled={testing} data-testid={`test-${integration.id}`}>
                {testing ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
                Test
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={onDisconnect}>
              <X size={13} />
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onConfigure} style={{ flex: 1 }} data-testid={`connect-${integration.id}`}>
            Connect
          </button>
        )}
      </div>

      {integration.lastSyncAt && (
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <RefreshCw size={10} /> Connected {new Date(integration.lastSyncAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}

function ConfigModal({ integration, meta, onSave, onClose }: {
  integration: Integration; meta: typeof INTEGRATION_META[string]
  onSave: (config: Record<string, string>) => void; onClose: () => void
}) {
  const [fields, setFields] = useState<Record<string, string>>(integration.config ?? {})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const r = await fetch('/api/validate-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: integration.id, config: fields }),
      })
      setTestResult(await r.json())
    } catch {
      setTestResult({ ok: false, message: 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{meta.icon} {integration.name}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{meta.desc}</p>

          {meta.oauthNote && (
            <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 16, fontSize: 12, color: 'var(--warning)' }}>
              ⚠️ {meta.oauthNote}
            </div>
          )}

          {meta.fields.map((f) => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input
                type={f.type ?? 'text'}
                value={fields[f.key] ?? ''}
                onChange={(e) => setFields((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.type === 'password' ? '••••••••' : f.label}
                data-testid={`field-${f.key}`}
              />
            </div>
          ))}

          {testResult && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, marginBottom: 16,
              background: testResult.ok ? 'var(--success-light)' : 'var(--danger-light)',
              color: testResult.ok ? 'var(--success)' : 'var(--danger)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {testResult.ok ? <Check size={14} /> : <AlertCircle size={14} />}
              {testResult.message}
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            🔒 Credentials stored locally only.{' '}
            <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
              View docs <ExternalLink size={10} style={{ display: 'inline' }} />
            </a>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {meta.validatable && (
              <button className="btn btn-secondary" onClick={handleTest} disabled={testing} data-testid="test-connection">
                {testing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                Test Connection
              </button>
            )}
            <button className="btn btn-primary" onClick={() => onSave(fields)} data-testid="save-integration">
              <Check size={14} /> Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
