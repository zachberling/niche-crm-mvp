import { useState } from 'react'
import { FileJson, FileText, Loader2, Check, Database } from 'lucide-react'
import { useCRMStore } from '@/store/crmStore'
import { useHVACStore } from '@/store/hvacStore'

const EXPORT_TABLES = [
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'jobs', label: 'Jobs', icon: '🔧' },
  { id: 'equipment', label: 'Equipment', icon: '⚙️' },
  { id: 'activities', label: 'Activities', icon: '📋' },
  { id: 'automations', label: 'Automations', icon: '⚡' },
]

export function ExportPage() {
  const contacts = useCRMStore((s) => s.contacts)
  const activities = useCRMStore((s) => s.activities)
  const { jobs, equipment, automations } = useHVACStore()
  const [selected, setSelected] = useState<string[]>(['contacts', 'jobs', 'equipment', 'activities'])
  const [loading] = useState<'csv' | 'json' | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const counts: Record<string, number> = {
    contacts: contacts.length, jobs: jobs.length,
    equipment: equipment.length, activities: activities.length, automations: automations.length,
  }

  const toggle = (id: string) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])


  // Client-side export (no server needed for current in-memory data)
  const handleClientExport = (format: 'csv' | 'json') => {
    const exportData: Record<string, unknown[]> = {}
    if (selected.includes('contacts')) exportData.contacts = contacts
    if (selected.includes('jobs')) exportData.jobs = jobs
    if (selected.includes('equipment')) exportData.equipment = equipment
    if (selected.includes('activities')) exportData.activities = activities
    if (selected.includes('automations')) exportData.automations = automations

    if (format === 'json') {
      downloadBlob(JSON.stringify(exportData, null, 2), `discsentia-export-${today()}.json`, 'application/json')
    } else {
      for (const [table, rows] of Object.entries(exportData)) {
        if (rows.length) downloadBlob(toCSV(rows), `discsentia-${table}-${today()}.csv`, 'text/csv')
      }
    }
    setDone(`Downloaded ${selected.length} ${format.toUpperCase()} file${selected.length > 1 && format === 'csv' ? 's' : ''}`)
  }

  const totalRecords = selected.reduce((n, id) => n + (counts[id] ?? 0), 0)

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Export Data</h1>
      </div>

      <div className="page-content fade-in" style={{ maxWidth: 640 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Select Data to Export</span>
            <span className="text-muted text-sm">{totalRecords} total records</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXPORT_TABLES.map(({ id, label, icon }) => (
              <label key={id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: selected.includes(id) ? 'var(--primary-light)' : 'var(--bg)',
                border: `1px solid ${selected.includes(id) ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  onChange={() => toggle(id)}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                  data-testid={`export-check-${id}`}
                />
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
                <span className="badge badge-inactive" style={{ fontSize: 11 }}>
                  {counts[id]} records
                </span>
              </label>
            ))}
          </div>
        </div>

        {done && (
          <div style={{
            background: 'var(--success-light)', border: '1px solid var(--success)',
            borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 20,
            color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          }}>
            <Check size={14} /> {done}
          </div>
        )}

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Export Format</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ExportButton
              icon={<FileText size={20} />}
              label="CSV Files"
              desc="One file per table. Opens in Excel, Google Sheets."
              onClick={() => handleClientExport('csv')}
              loading={loading === 'csv'}
              disabled={selected.length === 0}
              testId="export-csv"
            />
            <ExportButton
              icon={<FileJson size={20} />}
              label="JSON"
              desc="All tables in one file. For developers & imports."
              onClick={() => handleClientExport('json')}
              loading={loading === 'json'}
              disabled={selected.length === 0}
              testId="export-json"
            />
          </div>

          <div className="divider" />

          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <Database size={12} style={{ display: 'inline', marginRight: 4 }} />
            Export includes all data from your Discsentia account.
            Data is downloaded directly to your device.
          </div>
        </div>
      </div>
    </>
  )
}

function ExportButton({ icon, label, desc, onClick, loading, disabled, testId }: {
  icon: React.ReactNode; label: string; desc: string
  onClick: () => void; loading: boolean; disabled: boolean; testId: string
}) {
  return (
    <button
      className="btn btn-secondary"
      style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px', height: 'auto', gap: 8, textAlign: 'left' }}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
        {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
        <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>{desc}</span>
    </button>
  )
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function toCSV(rows: unknown[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0] as object)
  return [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const v = (row as Record<string, unknown>)[h]
        if (v === null || v === undefined) return ''
        const s = v instanceof Date ? v.toISOString() : String(v)
        return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(',')
    ),
  ].join('\n')
}

function today() {
  return new Date().toISOString().split('T')[0]
}
