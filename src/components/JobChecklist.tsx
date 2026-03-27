import { useState } from 'react'
import { Check, Plus, X, Mic, MicOff } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Job } from '@/types/hvac'

type ChecklistItem = { id: string; label: string; checked: boolean }

const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  maintenance: [
    'Inspect air filter — replace if needed',
    'Check refrigerant levels',
    'Clean evaporator & condenser coils',
    'Inspect electrical connections',
    'Lubricate moving parts',
    'Check thermostat calibration',
    'Test system operation',
    'Record before/after readings',
  ],
  repair: [
    'Diagnose fault code / symptom',
    'Inspect relevant components',
    'Document parts needed',
    'Complete repair',
    'Test system post-repair',
    'Confirm issue resolved with customer',
  ],
  installation: [
    'Verify equipment matches order',
    'Inspect installation site',
    'Install unit per manufacturer specs',
    'Connect electrical & refrigerant lines',
    'Pressure test system',
    'Commission and test run',
    'Walk customer through operation',
    'Leave documentation with customer',
  ],
  inspection: [
    'Inspect heat exchanger',
    'Check flue and venting',
    'Test carbon monoxide levels',
    'Inspect electrical panel',
    'Check ductwork for leaks',
    'Document findings',
  ],
}

interface Props {
  job: Job
  onUpdate: (data: Partial<Job>) => void
}

export function JobChecklist({ job, onUpdate }: Props) {
  const items: ChecklistItem[] = job.checklistItems ?? []
  const [newItem, setNewItem] = useState('')
  const [listening, setListening] = useState(false)

  const completed = items.filter((i) => i.checked).length

  function setItems(next: ChecklistItem[]) {
    onUpdate({ checklistItems: next })
  }

  function toggle(id: string) {
    setItems(items.map((i) => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  function addItem(label: string) {
    if (!label.trim()) return
    setItems([...items, { id: uuidv4(), label: label.trim(), checked: false }])
    setNewItem('')
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  function loadTemplate() {
    const template = CHECKLIST_TEMPLATES[job.type] ?? CHECKLIST_TEMPLATES.maintenance
    setItems(template.map((label) => ({ id: uuidv4(), label, checked: false })))
  }

  function startVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      addItem(transcript)
    }
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="detail-section-title" style={{ margin: 0 }}>
          Checklist {items.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({completed}/{items.length})</span>}
        </div>
        {items.length === 0 && (
          <button className="btn btn-ghost btn-sm" onClick={loadTemplate} style={{ fontSize: 11 }}>
            Load template
          </button>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: completed === items.length ? 'var(--success)' : 'var(--primary)',
            width: `${(completed / items.length) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      <ul style={{ listStyle: 'none', marginBottom: 10 }}>
        {items.map((item) => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => toggle(item.id)}
              aria-label={item.checked ? 'Uncheck item' : 'Check item'}
              aria-pressed={item.checked}
              style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                background: item.checked ? 'var(--success)' : 'transparent',
                border: `2px solid ${item.checked ? 'var(--success)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {item.checked && <Check size={12} color="white" />}
            </button>
            <span style={{
              flex: 1, fontSize: 13,
              textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? 'var(--text-muted)' : 'var(--text)',
            }}>
              {item.label}
            </span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(item.id)} aria-label="Remove item" style={{ opacity: 0.4 }}>
              <X size={11} />
            </button>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem(newItem)}
          placeholder="Add checklist item…"
          style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
          aria-label="New checklist item"
        />
        <button className="btn btn-secondary btn-sm" onClick={() => addItem(newItem)} aria-label="Add item">
          <Plus size={13} />
        </button>
        <button
          className={`btn btn-sm ${listening ? 'btn-primary' : 'btn-secondary'}`}
          onClick={startVoice}
          aria-label={listening ? 'Listening…' : 'Add by voice'}
          title="Voice input"
        >
          {listening ? <MicOff size={13} /> : <Mic size={13} />}
        </button>
      </div>
    </div>
  )
}
