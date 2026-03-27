import { useState } from 'react'
import { Plus, Send, CheckCircle, XCircle, Copy, X } from 'lucide-react'
import { useHVACStore } from '@/store/hvacStore'
import { useCRMStore } from '@/store/crmStore'
import { Job } from '@/types/hvac'
import { v4 as uuidv4 } from 'uuid'

const COMMON_ITEMS = [
  { description: 'AC Tune-Up / Maintenance', unitPrice: 89 },
  { description: 'Furnace Inspection & Clean', unitPrice: 99 },
  { description: 'Refrigerant Recharge (per lb)', unitPrice: 75 },
  { description: 'Filter Replacement', unitPrice: 25 },
  { description: 'Thermostat Installation', unitPrice: 150 },
  { description: 'Duct Sealing (per zone)', unitPrice: 200 },
  { description: 'Emergency Service Call', unitPrice: 175 },
  { description: 'Labor (per hour)', unitPrice: 95 },
]

type EstimateLine = { id: string; description: string; qty: number; unitPrice: number }

export function EstimatesPage() {
  const { jobs, updateJob } = useHVACStore()
  const contacts = useCRMStore((s) => s.contacts)
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id ?? '')
  const [copiedToken, setCopiedToken] = useState(false)

  const job = jobs.find((j) => j.id === selectedJobId)
  const contact = job ? contacts.find((c) => c.id === job.contactId) : null

  const lines: EstimateLine[] = job?.estimateLines ?? []
  const total = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)

  function setLines(next: EstimateLine[]) {
    if (!job) return
    updateJob(job.id, { estimateLines: next, invoiceAmount: next.reduce((s, l) => s + l.qty * l.unitPrice, 0) })
  }

  function addLine(preset?: Partial<EstimateLine>) {
    setLines([...lines, { id: uuidv4(), description: preset?.description ?? '', qty: 1, unitPrice: preset?.unitPrice ?? 0 }])
  }

  function updateLine(id: string, field: keyof EstimateLine, value: string | number) {
    setLines(lines.map((l) => l.id === id ? { ...l, [field]: value } : l))
  }

  function removeLine(id: string) {
    setLines(lines.filter((l) => l.id !== id))
  }

  function setStatus(status: Job['estimateStatus']) {
    if (!job) return
    updateJob(job.id, { estimateStatus: status })
  }

  function generateClientLink() {
    if (!job) return
    const token = job.clientToken ?? uuidv4()
    if (!job.clientToken) updateJob(job.id, { clientToken: token })
    const url = `${window.location.origin}/client/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const statusColors: Record<string, string> = {
    draft: 'badge-inactive', sent: 'badge-lead', approved: 'badge-active', declined: 'badge-inactive',
  }

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">Estimates</h1>
      </header>

      <main className="page-content fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Job selector */}
          <aside>
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Jobs
              </div>
              {jobs.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <p>No jobs yet</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none' }}>
                  {jobs.map((j) => {
                    const c = contacts.find((x) => x.id === j.contactId)
                    return (
                      <li key={j.id}>
                        <button
                          onClick={() => setSelectedJobId(j.id)}
                          style={{
                            width: '100%', textAlign: 'left', padding: '12px 16px',
                            background: j.id === selectedJobId ? 'var(--primary-light)' : 'none',
                            border: 'none', borderBottom: '1px solid var(--border)',
                            color: j.id === selectedJobId ? 'var(--primary)' : 'var(--text)',
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{j.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {c?.firstName} {c?.lastName}
                          </div>
                          {j.estimateStatus && (
                            <span className={`badge ${statusColors[j.estimateStatus]}`} style={{ fontSize: 10, marginTop: 4 }}>
                              {j.estimateStatus}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Estimate editor */}
          {job ? (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600 }}>{job.title}</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {contact?.firstName} {contact?.lastName} {contact?.company ? `· ${contact.company}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {job.estimateStatus && (
                      <span className={`badge ${statusColors[job.estimateStatus]}`}>{job.estimateStatus}</span>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={generateClientLink} title="Copy shareable client link">
                      {copiedToken ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Client Link</>}
                    </button>
                  </div>
                </div>

                {/* Quick-add common items */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Quick add:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {COMMON_ITEMS.map((item) => (
                      <button
                        key={item.description}
                        className="filter-chip"
                        onClick={() => addLine(item)}
                        style={{ fontSize: 12 }}
                      >
                        + {item.description}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line items */}
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>Description</th>
                        <th style={{ width: '10%' }}>Qty</th>
                        <th style={{ width: '18%' }}>Unit Price</th>
                        <th style={{ width: '18%' }}>Total</th>
                        <th style={{ width: '4%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr key={line.id} onClick={(e) => e.stopPropagation()}>
                          <td>
                            <input
                              value={line.description}
                              onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                              placeholder="Service description…"
                              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 13, width: '100%', color: 'var(--text)' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number" min={1} value={line.qty}
                              onChange={(e) => updateLine(line.id, 'qty', parseFloat(e.target.value) || 1)}
                              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 13, width: 48, color: 'var(--text)' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number" min={0} step={0.01} value={line.unitPrice}
                              onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 13, width: 80, color: 'var(--text)' }}
                            />
                          </td>
                          <td style={{ fontWeight: 500 }}>${(line.qty * line.unitPrice).toFixed(2)}</td>
                          <td>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeLine(line.id)} aria-label="Remove line">
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => addLine()}>
                    <Plus size={13} /> Add Line
                  </button>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>
                    Total: ${total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setStatus('sent')} disabled={lines.length === 0}>
                  <Send size={14} /> Send to Client
                </button>
                <button className="btn btn-secondary" onClick={() => setStatus('approved')}>
                  <CheckCircle size={14} /> Mark Approved
                </button>
                <button className="btn btn-danger" onClick={() => setStatus('declined')}>
                  <XCircle size={14} /> Mark Declined
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setStatus('draft')}>
                  Reset to Draft
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <p>Select a job to build an estimate</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
