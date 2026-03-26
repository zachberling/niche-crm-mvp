import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

interface OnboardingData {
  businessName: string
  role: string
  teamSize: string
  primaryGoal: string
  currentTool: string
  monthlyLeads: string
  topChallenge: string
}

const STEPS = [
  {
    id: 'business',
    title: "Let's set up your account",
    subtitle: 'Tell us about your business',
    fields: [
      { key: 'businessName', label: 'Business Name', placeholder: 'e.g. Arctic Air HVAC', type: 'text' },
      { key: 'role', label: 'Your Role', type: 'select', options: ['Owner / Operator', 'Sales Manager', 'Office Manager', 'Technician', 'Other'] },
    ],
  },
  {
    id: 'team',
    title: 'About your team',
    subtitle: 'Help us tailor your experience',
    fields: [
      { key: 'teamSize', label: 'How many people are on your team?', type: 'select', options: ['Just me', '2–5', '6–15', '16–50', '50+'] },
      { key: 'monthlyLeads', label: 'How many new leads do you get per month?', type: 'select', options: ['Less than 10', '10–30', '30–100', '100+'] },
    ],
  },
  {
    id: 'goals',
    title: 'What are you trying to achieve?',
    subtitle: "We'll customize your dashboard around your goals",
    fields: [
      {
        key: 'primaryGoal', label: 'Primary Goal', type: 'select',
        options: ['Close more leads', 'Manage service agreements', 'Improve follow-ups', 'Track technician performance', 'Grow recurring revenue'],
      },
      {
        key: 'topChallenge', label: 'Biggest challenge right now?', type: 'select',
        options: ['Leads falling through the cracks', 'No visibility into pipeline', 'Manual follow-up process', 'Disorganized customer data', 'Scaling the team'],
      },
    ],
  },
  {
    id: 'migration',
    title: 'Coming from somewhere else?',
    subtitle: "We'll help you get set up fast",
    fields: [
      {
        key: 'currentTool', label: 'What are you using today?', type: 'select',
        options: ['Spreadsheets / Excel', 'ServiceTitan', 'Jobber', 'HubSpot', 'Nothing yet', 'Other'],
      },
    ],
  },
]

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    businessName: '', role: '', teamSize: '', primaryGoal: '',
    currentTool: '', monthlyLeads: '', topChallenge: '',
  })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const current = STEPS[step]

  function update(key: string, value: string) {
    setData(d => ({ ...d, [key]: value }))
  }

  function canAdvance() {
    return current.fields.every(f => data[f.key as keyof OnboardingData]?.trim())
  }

  async function finish() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.auth.updateUser({ data: { onboarding: data, onboarded: true } })
    }
    setSaving(false)
    navigate('/dashboard')
  }

  const isLast = step === STEPS.length - 1

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#6366f1' : '#2a2d3e', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 16, padding: 36 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{current.title}</h2>
            <p style={{ color: '#8b92a9', fontSize: 14 }}>{current.subtitle}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {current.fields.map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#8b92a9', marginBottom: 6 }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={data[f.key as keyof OnboardingData]}
                    onChange={e => update(f.key, e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select an option...</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={data[f.key as keyof OnboardingData]}
                    onChange={e => update(f.key, e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #2a2d3e', color: step === 0 ? '#4a5068' : '#f1f5f9', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <button
              onClick={isLast ? finish : () => setStep(s => s + 1)}
              disabled={!canAdvance() || saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: canAdvance() ? '#6366f1' : '#2a2d3e', color: canAdvance() ? 'white' : '#4a5068', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: canAdvance() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
            >
              {saving ? 'Setting up...' : isLast ? <><CheckCircle size={15} /> Launch Dashboard</> : <>Next <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#4a5068', fontSize: 13, marginTop: 16 }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f1117', border: '1px solid #2a2d3e',
  borderRadius: 8, color: '#f1f5f9', fontFamily: 'inherit',
  fontSize: 14, padding: '10px 12px', outline: 'none',
}
