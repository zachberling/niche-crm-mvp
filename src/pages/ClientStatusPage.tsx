import { useParams } from 'react-router-dom'
import { useHVACStore } from '@/store/hvacStore'
import { useCRMStore } from '@/store/crmStore'
import { CheckCircle, Truck, Wrench, XCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_STEPS = ['scheduled', 'en_route', 'in_progress', 'completed']

const STATUS_INFO: Record<string, { icon: React.ReactNode; label: string; desc: string; color: string }> = {
  scheduled: { icon: <Calendar size={20} />, label: 'Scheduled', desc: 'Your appointment is confirmed.', color: '#f59e0b' },
  en_route: { icon: <Truck size={20} />, label: 'On the Way', desc: 'Your technician is heading to you now.', color: '#6366f1' },
  in_progress: { icon: <Wrench size={20} />, label: 'In Progress', desc: 'Work is currently underway.', color: '#6366f1' },
  completed: { icon: <CheckCircle size={20} />, label: 'Completed', desc: 'Your service has been completed.', color: '#22c55e' },
  cancelled: { icon: <XCircle size={20} />, label: 'Cancelled', desc: 'This appointment was cancelled.', color: '#ef4444' },
  no_show: { icon: <XCircle size={20} />, label: 'No Show', desc: 'We were unable to reach you.', color: '#ef4444' },
}

export function ClientStatusPage() {
  const { token } = useParams<{ token: string }>()
  const { jobs } = useHVACStore()
  const contacts = useCRMStore((s) => s.contacts)

  const job = jobs.find((j) => j.clientToken === token)
  const contact = job ? contacts.find((c) => c.id === job.contactId) : null
  const info = job ? STATUS_INFO[job.status] : null
  const stepIndex = job ? STATUS_STEPS.indexOf(job.status) : -1
  const lines = job?.estimateLines ?? []
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)

  if (!job) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Job not found</h1>
          <p style={{ color: '#8b92a9' }}>This link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', fontFamily: 'Inter, system-ui, sans-serif', color: '#f1f5f9', padding: '40px 20px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: '#6366f1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>❄️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Job Status</h1>
          <p style={{ color: '#8b92a9', fontSize: 14 }}>Hi {contact?.firstName}, here's your service update</p>
        </div>

        {/* Status card */}
        <div style={{ background: '#1a1d27', border: `1px solid ${info?.color ?? '#2a2d3e'}`, borderRadius: 16, padding: 24, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${info?.color}22`, color: info?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {info?.icon}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{info?.label}</div>
          <div style={{ color: '#8b92a9', fontSize: 14 }}>{info?.desc}</div>
        </div>

        {/* Progress stepper */}
        {stepIndex >= 0 && (
          <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i <= stepIndex ? '#6366f1' : '#2a2d3e',
                      color: i <= stepIndex ? 'white' : '#4a5068',
                      fontSize: 12, fontWeight: 600, flexShrink: 0,
                    }}>
                      {i < stepIndex ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 10, color: i <= stepIndex ? '#f1f5f9' : '#4a5068', whiteSpace: 'nowrap' }}>
                      {STATUS_INFO[step]?.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#6366f1' : '#2a2d3e', margin: '0 4px', marginBottom: 20 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job details */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Appointment Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Service" value={job.title} />
            <Row label="Date" value={format(new Date(job.scheduledAt), 'EEEE, MMMM d, yyyy')} />
            <Row label="Time" value={format(new Date(job.scheduledAt), 'h:mm a')} />
            {job.technicianName && <Row label="Technician" value={job.technicianName} />}
            {job.address && <Row label="Address" value={job.address} />}
          </div>
        </div>

        {/* Estimate */}
        {lines.length > 0 && (
          <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Estimate</h2>
              {job.estimateStatus && (
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: job.estimateStatus === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)',
                  color: job.estimateStatus === 'approved' ? '#22c55e' : '#6366f1',
                }}>
                  {job.estimateStatus}
                </span>
              )}
            </div>
            {lines.map((line) => (
              <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2a2d3e', fontSize: 13 }}>
                <span style={{ color: '#8b92a9' }}>{line.description} {line.qty > 1 ? `× ${line.qty}` : ''}</span>
                <span style={{ fontWeight: 500 }}>${(line.qty * line.unitPrice).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: '#22c55e' }}>${total.toFixed(2)}</span>
            </div>

            {job.estimateStatus === 'sent' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button style={{ flex: 1, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✓ Approve Estimate
                </button>
                <button style={{ flex: 1, padding: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Decline
                </button>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#4a5068', fontSize: 12 }}>
          Powered by Discsentia · Questions? Contact your technician directly.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: '#8b92a9' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
