import { loadStripe, Stripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.')
}

let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey)
  }
  return stripePromise
}

// Pricing tiers configuration
export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 79,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    features: [
      'Up to 250 contacts',
      'Email support',
      'Basic CRM features',
      'Mobile app access',
    ],
    limits: {
      contacts: 250,
    },
  },
  professional: {
    name: 'Professional',
    price: 149,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: [
      'Up to 1,000 contacts',
      'Priority email support',
      'AI-powered features',
      'Advanced reporting',
      'API access',
      'Custom fields',
    ],
    limits: {
      contacts: 1000,
    },
    popular: true,
  },
  premium: {
    name: 'Premium',
    price: 249,
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Unlimited contacts',
      '24/7 phone + email support',
      'All AI features',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
    ],
    limits: {
      contacts: Infinity,
    },
  },
} as const

export type PricingTier = keyof typeof PRICING_TIERS

// Stripe Checkout session creation
export interface CheckoutSessionParams {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}

export const createCheckoutSession = async (params: CheckoutSessionParams) => {
  // This will be a server-side function (Supabase Edge Function or API route)
  // For now, returning the structure you'll need
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error('Failed to create checkout session')
  }

  const { sessionId } = await response.json()
  return sessionId
}

// Customer Portal (for managing subscriptions)
export const createPortalSession = async (customerId: string, returnUrl: string) => {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId, returnUrl }),
  })

  if (!response.ok) {
    throw new Error('Failed to create portal session')
  }

  const { url } = await response.json()
  return url
}
