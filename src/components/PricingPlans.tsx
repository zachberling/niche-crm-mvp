import { useState } from 'react'
import { PRICING_TIERS, getStripe, createCheckoutSession, type PricingTier } from '@/lib/stripe'

export const PricingPlans = () => {
  const [loading, setLoading] = useState<PricingTier | null>(null)

  const handleSubscribe = async (tier: PricingTier) => {
    const priceId = PRICING_TIERS[tier].priceId

    if (!priceId) {
      alert('Stripe is not configured. Please add Stripe keys to your environment variables.')
      return
    }

    setLoading(tier)

    try {
      // Create Checkout Session
      const sessionId = await createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      })

      // Redirect to Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe Checkout error:', error)
        alert('Failed to redirect to checkout. Please try again.')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="pricing-plans">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Start your 14-day free trial. No credit card required.</p>
      </div>

      <div className="pricing-grid">
        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
          <div
            key={key}
            className={`pricing-card ${tier.popular ? 'popular' : ''}`}
          >
            {tier.popular && <div className="popular-badge">Most Popular</div>}

            <div className="pricing-card-header">
              <h3>{tier.name}</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{tier.price}</span>
                <span className="period">/month</span>
              </div>
            </div>

            <ul className="features-list">
              {tier.features.map((feature, i) => (
                <li key={i}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M16.667 5L7.5 14.167 3.333 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`subscribe-btn ${tier.popular ? 'primary' : 'secondary'}`}
              onClick={() => handleSubscribe(key as PricingTier)}
              disabled={loading !== null}
            >
              {loading === key ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>
          All plans include a 14-day free trial. Cancel anytime.
          <br />
          Need a custom plan? <a href="mailto:support@yourcrm.com">Contact us</a>
        </p>
      </div>
    </div>
  )
}
