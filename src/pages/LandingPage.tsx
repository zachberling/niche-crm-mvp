import { useNavigate } from 'react-router-dom'
import { CheckCircle, Zap, Users, BarChart3, Phone, Star, ArrowRight, Shield, Clock } from 'lucide-react'

const FEATURES = [
  { icon: <Users size={22} />, title: 'Contact Management', desc: 'Track every HVAC lead, customer, and prospect in one place. Never lose a follow-up again.' },
  { icon: <Phone size={22} />, title: 'Call & Job Tracking', desc: 'Log service calls, maintenance visits, and installs directly to customer records.' },
  { icon: <BarChart3 size={22} />, title: 'Pipeline Analytics', desc: 'See your lead-to-close rate, revenue pipeline, and team performance at a glance.' },
  { icon: <Zap size={22} />, title: 'Automated Follow-ups', desc: 'Set reminders for seasonal tune-ups, warranty renewals, and service agreements.' },
  { icon: <Shield size={22} />, title: 'Service Agreements', desc: 'Manage maintenance contracts and get notified before they expire.' },
  { icon: <Clock size={22} />, title: 'Job Scheduling', desc: 'Coordinate technician schedules and dispatch jobs from the same dashboard.' },
]

const TESTIMONIALS = [
  { name: 'Mike R.', company: 'Arctic Air HVAC', text: 'Went from losing leads in spreadsheets to closing 40% more jobs in 3 months.', stars: 5 },
  { name: 'Sarah T.', company: 'Comfort Pro Services', text: 'The follow-up reminders alone paid for the subscription in the first week.', stars: 5 },
  { name: 'Dave K.', company: 'K&D Heating & Cooling', text: 'Finally a CRM built for HVAC. Not some generic tool we had to hack together.', stars: 5 },
]

const PLANS = [
  { name: 'Starter', price: 49, desc: 'Perfect for solo technicians', features: ['Up to 250 contacts', 'Call & job logging', 'Basic pipeline view', 'Email support'] },
  { name: 'Pro', price: 99, desc: 'For growing HVAC businesses', features: ['Unlimited contacts', 'Automated follow-ups', 'Service agreement tracking', 'Analytics dashboard', 'Priority support'], popular: true },
  { name: 'Team', price: 199, desc: 'Multi-tech operations', features: ['Everything in Pro', 'Up to 10 technicians', 'Job scheduling & dispatch', 'Custom reporting', 'Dedicated onboarding'] },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', height: 64, borderBottom: '1px solid #2a2d3e', position: 'sticky', top: 0, background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(8px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#6366f1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>❄️</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>NicheCRM</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/auth?mode=login')} style={ghostBtn}>Sign In</button>
          <button onClick={() => navigate('/auth?mode=signup')} style={primaryBtn}>Start Free Trial</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 5% 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#6366f1', marginBottom: 24 }}>
          <Zap size={14} /> Built exclusively for HVAC businesses
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em' }}>
          Stop losing HVAC leads.<br />
          <span style={{ color: '#6366f1' }}>Start closing more jobs.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#8b92a9', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          The only CRM designed for HVAC contractors. Track leads, manage service agreements, automate follow-ups, and grow your revenue — all in one place.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/auth?mode=signup')} style={{ ...primaryBtn, padding: '14px 32px', fontSize: 16 }}>
            Start Free 14-Day Trial <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/auth?mode=login')} style={{ ...ghostBtn, padding: '14px 28px', fontSize: 16 }}>
            See a Demo
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#4a5068', marginTop: 16 }}>No credit card required · Cancel anytime · Setup in 5 minutes</p>
      </section>

      {/* Social proof bar */}
      <div style={{ background: '#1a1d27', borderTop: '1px solid #2a2d3e', borderBottom: '1px solid #2a2d3e', padding: '20px 5%', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
        {[['500+', 'HVAC Companies'], ['94%', 'Customer Retention'], ['40%', 'More Closed Jobs'], ['4.9★', 'Average Rating']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1' }}>{val}</div>
            <div style={{ fontSize: 13, color: '#8b92a9' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Everything your HVAC business needs</h2>
        <p style={{ textAlign: 'center', color: '#8b92a9', marginBottom: 56, fontSize: 16 }}>Purpose-built features for heating, cooling, and refrigeration contractors</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 12, padding: 24 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: '#8b92a9', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '60px 5%', background: '#1a1d27', borderTop: '1px solid #2a2d3e', borderBottom: '1px solid #2a2d3e' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 48 }}>Trusted by HVAC pros across the country</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
              <div style={{ color: '#8b92a9', fontSize: 12 }}>{t.company}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 5%', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Simple, transparent pricing</h2>
        <p style={{ textAlign: 'center', color: '#8b92a9', marginBottom: 48, fontSize: 16 }}>Start free for 14 days. No credit card required.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{ background: '#1a1d27', border: `1px solid ${p.popular ? '#6366f1' : '#2a2d3e'}`, borderRadius: 16, padding: 28, position: 'relative', boxShadow: p.popular ? '0 0 0 1px #6366f1' : 'none' }}>
              {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', fontSize: 12, fontWeight: 600, padding: '3px 14px', borderRadius: 20 }}>Most Popular</div>}
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>${p.price}<span style={{ fontSize: 14, fontWeight: 400, color: '#8b92a9' }}>/mo</span></div>
              <div style={{ color: '#8b92a9', fontSize: 13, margin: '10px 0 20px' }}>{p.desc}</div>
              <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '5px 0', color: '#8b92a9' }}>
                    <CheckCircle size={14} color="#22c55e" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/auth?mode=signup')} style={{ ...( p.popular ? primaryBtn : ghostBtn), width: '100%', justifyContent: 'center', padding: '10px 0' }}>
                Get Started Free
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 5%', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)', borderTop: '1px solid #2a2d3e' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Ready to grow your HVAC business?</h2>
        <p style={{ color: '#8b92a9', fontSize: 16, marginBottom: 32 }}>Join 500+ HVAC contractors already using NicheCRM</p>
        <button onClick={() => navigate('/auth?mode=signup')} style={{ ...primaryBtn, padding: '14px 40px', fontSize: 16 }}>
          Start Your Free Trial <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 5%', borderTop: '1px solid #2a2d3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#6366f1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>❄️</div>
          <span style={{ fontWeight: 600 }}>NicheCRM</span>
        </div>
        <div style={{ color: '#4a5068', fontSize: 13 }}>© 2026 NicheCRM. Built for HVAC professionals.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Support'].map(l => <a key={l} href="#" style={{ color: '#8b92a9', fontSize: 13, textDecoration: 'none' }}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: '#6366f1', color: 'white', border: 'none',
  borderRadius: 8, padding: '10px 20px', fontSize: 14,
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}

const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'transparent', color: '#f1f5f9',
  border: '1px solid #2a2d3e', borderRadius: 8,
  padding: '10px 20px', fontSize: 14,
  fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
}
