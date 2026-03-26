import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 79,
    desc: 'Perfect for solo operators and small teams.',
    features: ['Up to 250 contacts', 'Activity logging', 'Email support', 'Mobile access'],
  },
  {
    name: 'Professional',
    price: 149,
    desc: 'For growing businesses that need more power.',
    features: ['Up to 1,000 contacts', 'Everything in Starter', 'AI-powered insights', 'Advanced reporting', 'API access', 'Custom fields'],
    popular: true,
  },
  {
    name: 'Premium',
    price: 249,
    desc: 'Unlimited scale with white-glove support.',
    features: ['Unlimited contacts', 'Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'White-label options', '24/7 phone support'],
  },
]

export function Pricing() {
  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Pricing</h1>
      </div>

      <div className="page-content fade-in">
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
              <div className="pricing-price">
                ${plan.price}<span>/mo</span>
              </div>
              <div className="pricing-desc">{plan.desc}</div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={14} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`btn w-full${plan.popular ? ' btn-primary' : ' btn-secondary'}`}
                data-testid={`plan-${plan.name.toLowerCase()}`}
              >
                Start Free Trial
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
