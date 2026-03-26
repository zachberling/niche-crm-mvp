import { useState } from 'react'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { useHVACStore } from '@/store/hvacStore'
import { useCRMStore } from '@/store/crmStore'
import { Equipment } from '@/types/hvac'
import { format, differenceInDays, addMonths } from 'date-fns'

const EQUIPMENT_ICONS: Record<string, string> = {
  ac_unit: '❄️', furnace: '🔥', heat_pump: '♻️', boiler: '💧',
  ductwork: '🌀', thermostat: '🌡️', other: '⚙️',
}

export function EquipmentPage() {
  const { equipment, deleteEquipment } = useHVACStore()
  const contacts = useCRMStore((s) => s.contacts)
  const [showForm, setShowForm] = useState(false)
  

  const getContact = (id: string) => contacts.find((c) => c.id === id)

  const serviceDueSoon = equipment.filter((e) => {
    if (!e.nextServiceDate) return false
    return differenceInDays(new Date(e.nextServiceDate), new Date()) <= 30
  })

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Equipment Tracker</h1>
        <div className="flex gap-2 items-center">
          {serviceDueSoon.length > 0 && (
            <span style={{ color: 'var(--warning)', fontSize: 13, fontWeight: 500 }}>
              <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
              {serviceDueSoon.length} service due soon
            </span>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Equipment
          </button>
        </div>
      </div>

      <div className="page-content fade-in">
        {serviceDueSoon.length > 0 && (
          <div style={{
            background: 'var(--warning-light)', border: '1px solid var(--warning)',
            borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>
              ⚠️ Service Due Soon
            </div>
            {serviceDueSoon.map((e) => {
              const c = getContact(e.contactId)
              const days = differenceInDays(new Date(e.nextServiceDate!), new Date())
              return (
                <div key={e.id} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                  {EQUIPMENT_ICONS[e.type]} {e.brand} {e.model} — {c?.firstName} {c?.lastName}
                  <span style={{ color: 'var(--warning)', marginLeft: 8 }}>
                    {days <= 0 ? 'Overdue!' : `${days} days`}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="card" style={{ padding: 0 }}>
          {equipment.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚙️</div>
              <h3>No equipment tracked</h3>
              <p>Track HVAC units, furnaces, and more for each customer</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                <Plus size={14} /> Add Equipment
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Equipment</th><th>Customer</th><th>Install Date</th>
                    <th>Last Service</th><th>Next Service</th><th>Warranty</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((eq) => {
                    const contact = getContact(eq.contactId)
                    const nextService = eq.nextServiceDate ? new Date(eq.nextServiceDate) : null
                    const daysUntil = nextService ? differenceInDays(nextService, new Date()) : null
                    const isOverdue = daysUntil !== null && daysUntil < 0
                    const isDueSoon = daysUntil !== null && daysUntil <= 30 && daysUntil >= 0
                    return (
                      <tr key={eq.id}  data-testid="equipment-row">
                        <td>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 20 }}>{EQUIPMENT_ICONS[eq.type]}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{eq.brand} {eq.model || eq.type}</div>
                              {eq.serialNumber && <div className="text-muted text-sm">S/N: {eq.serialNumber}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {contact ? `${contact.firstName} ${contact.lastName}` : '—'}
                        </td>
                        <td className="text-muted text-sm">
                          {eq.installDate ? format(new Date(eq.installDate), 'MMM yyyy') : '—'}
                        </td>
                        <td className="text-muted text-sm">
                          {eq.lastServiceDate ? format(new Date(eq.lastServiceDate), 'MMM d, yyyy') : '—'}
                        </td>
                        <td>
                          {nextService ? (
                            <span style={{
                              color: isOverdue ? 'var(--danger)' : isDueSoon ? 'var(--warning)' : 'var(--text-muted)',
                              fontSize: 13, fontWeight: isDueSoon || isOverdue ? 600 : 400,
                            }}>
                              {isOverdue ? '⚠️ ' : isDueSoon ? '🔔 ' : ''}
                              {format(nextService, 'MMM d, yyyy')}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-muted text-sm">
                          {eq.warrantyExpiry ? (
                            <span style={{ color: differenceInDays(new Date(eq.warrantyExpiry), new Date()) < 0 ? 'var(--danger)' : 'inherit' }}>
                              {format(new Date(eq.warrantyExpiry), 'MMM yyyy')}
                            </span>
                          ) : '—'}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteEquipment(eq.id)}>
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

      {showForm && <EquipmentForm onClose={() => setShowForm(false)} contacts={contacts} />}
    </>
  )
}

function EquipmentForm({ onClose, contacts }: { onClose: () => void; contacts: any[] }) {
  const { addEquipment } = useHVACStore()
  const [form, setForm] = useState({
    contactId: contacts[0]?.id ?? '',
    type: 'ac_unit' as Equipment['type'],
    brand: '', model: '', serialNumber: '',
    installDate: '', lastServiceDate: '', warrantyExpiry: '', notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contactId) return
    const nextServiceDate = form.lastServiceDate
      ? addMonths(new Date(form.lastServiceDate), 12)
      : undefined
    addEquipment({
      ...form,
      installDate: form.installDate ? new Date(form.installDate) : undefined,
      lastServiceDate: form.lastServiceDate ? new Date(form.lastServiceDate) : undefined,
      nextServiceDate,
      warrantyExpiry: form.warrantyExpiry ? new Date(form.warrantyExpiry) : undefined,
    })
    onClose()
  }

  const s = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Equipment</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer *</label>
              <select value={form.contactId} onChange={(e) => s('contactId', e.target.value)} required>
                <option value="">Select customer…</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Equipment Type</label>
                <select value={form.type} onChange={(e) => s('type', e.target.value)}>
                  {Object.entries(EQUIPMENT_ICONS).map(([k, v]) => (
                    <option key={k} value={k}>{v} {k.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input value={form.brand} onChange={(e) => s('brand', e.target.value)} placeholder="Carrier, Trane, Lennox…" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Model</label>
                <input value={form.model} onChange={(e) => s('model', e.target.value)} placeholder="Model number…" />
              </div>
              <div className="form-group">
                <label>Serial Number</label>
                <input value={form.serialNumber} onChange={(e) => s('serialNumber', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Install Date</label>
                <input type="date" value={form.installDate} onChange={(e) => s('installDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Last Service Date</label>
                <input type="date" value={form.lastServiceDate} onChange={(e) => s('lastServiceDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Warranty Expiry</label>
              <input type="date" value={form.warrantyExpiry} onChange={(e) => s('warrantyExpiry', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => s('notes', e.target.value)} placeholder="Condition, issues…" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Equipment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
