import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 79,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    desc: 'Perfect for solo operators and small teams.',
    features: ['Up to 250 contacts', 'Activity logging', 'Email support', 'Mobile access'],
  },
  {
    name: 'Professional',
    price: 149,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    desc: 'For growing businesses that need more power.',
    features: ['Up to 1,000 contacts', 'Everything in Starter', 'AI-powered insights', 'Advanced reporting', 'API access', 'Custom fields'],
    popular: true,
  },
  {
    name: 'Premium',
    price: 249,
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
    desc: 'Unlimited scale with white-glove support.',
    features: ['Unlimited contacts', 'Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'White-label options', '24/7 phone support'],
  },
]

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!plan.priceId) {
      setError('Stripe is not configured. Add VITE_STRIPE_*_PRICE_ID env vars.')
      return
    }
    setLoading(plan.name)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/pricing?success=1`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout.')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const success = new URLSearchParams(window.location.search).get('success')

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Pricing</h1>
      </div>

      <div className="page-content fade-in">
        {success && (
          <div style={{
            background: 'var(--success-light)', border: '1px solid var(--success)',
            borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
            color: 'var(--success)', fontWeight: 500,
          }}>
            🎉 Subscription started! Your 14-day trial is active.
          </div>
        )}

        {error && (
          <div style={{
            background: 'var(--danger-light)', border: '1px solid var(--danger)',
            borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
            color: 'var(--danger)',
          }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Simple, transparent pricing</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            14-day free trial on all plans. No credit card required.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card${plan.popular ? ' popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">${plan.price}<span>/mo</span></div>
              <div className="pricing-desc">{plan.desc}</div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}><Check size={14} />{f}</li>
                ))}
              </ul>
              <button
                className={`btn w-full${plan.popular ? ' btn-primary' : ' btn-secondary'}`}
                onClick={() => handleSubscribe(plan)}
                disabled={loading !== null}
                data-testid={`plan-${plan.name.toLowerCase()}`}
              >
                {loading === plan.name
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</>
                  : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 24 }}>
          Need a custom plan?{' '}
          <a href="mailto:support@nichecrm.com" style={{ color: 'var(--primary)' }}>Contact us</a>
        </p>
      </div>
    </>
  )
}
