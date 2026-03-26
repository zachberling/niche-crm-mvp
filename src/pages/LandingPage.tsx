import { useNavigate } from 'react-router-dom'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Niche CRM</h1>
      <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '500px', marginBottom: '2rem' }}>
        The CRM built for HVAC businesses. Manage contacts, track activities, and grow your pipeline.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => navigate('/auth?mode=signup')} style={{ padding: '0.75rem 2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
          Get Started Free
        </button>
        <button onClick={() => navigate('/auth?mode=login')} style={{ padding: '0.75rem 2rem', background: 'transparent', color: '#2563eb', border: '2px solid #2563eb', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
          Sign In
        </button>
      </div>
    </div>
  )
}
