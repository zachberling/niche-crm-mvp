/**
 * Example API routes for Stripe integration
 * 
 * Use these as templates for your own backend API
 * Works with Express.js, Next.js API routes, or any Node.js framework
 */

import Stripe from 'stripe'

// Initialize Stripe (server-side only!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

/**
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(req, res) {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail, metadata } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata,
      },
      metadata,
    })

    res.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * POST /api/stripe/create-portal-session
 * 
 * Creates a Stripe Customer Portal session
 */
export async function createPortalSession(req, res) {
  try {
    const { customerId, returnUrl } = req.body

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events
 * IMPORTANT: Verify webhook signature!
 */
export async function stripeWebhook(req, res) {
  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      
      // TODO: Save subscription to YOUR database
      console.log('New subscription:', {
        subscriptionId: session.subscription,
        customerId: session.customer,
        customerEmail: session.customer_email,
        priceId: session.metadata?.priceId,
      })

      // Example database insert:
      // await db.subscriptions.create({
      //   stripe_subscription_id: session.subscription,
      //   stripe_customer_id: session.customer,
      //   user_email: session.customer_email,
      //   status: 'trialing',
      //   price_id: session.metadata?.priceId,
      // })

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      
      // TODO: Update subscription in YOUR database
      console.log('Subscription updated:', {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      })

      // Example database update:
      // await db.subscriptions.update({
      //   where: { stripe_subscription_id: subscription.id },
      //   data: {
      //     status: subscription.status,
      //     current_period_end: new Date(subscription.current_period_end * 1000),
      //   },
      // })

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      
      // TODO: Mark subscription as canceled in YOUR database
      console.log('Subscription canceled:', subscription.id)

      // Example database update:
      // await db.subscriptions.update({
      //   where: { stripe_subscription_id: subscription.id },
      //   data: { status: 'canceled' },
      // })

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      
      // TODO: Handle payment failure
      // - Send email to customer
      // - Update subscription status
      // - Maybe disable access after grace period
      console.log('Payment failed for customer:', invoice.customer)

      break
    }

    default:
      console.log('Unhandled event type:', event.type)
  }

  res.json({ received: true })
}

/**
 * GET /api/stripe/subscription-status?userId=xxx
 * 
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(req, res) {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // TODO: Get from YOUR database
    // const subscription = await db.subscriptions.findOne({ user_id: userId })

    // Example response:
    const subscription = {
      status: 'active',
      plan: 'professional',
      currentPeriodEnd: new Date('2026-04-25'),
      cancelAtPeriodEnd: false,
    }

    res.json(subscription)
  } catch (error) {
    console.error('Error getting subscription status:', error)
    res.status(500).json({ error: error.message })
  }
}

// ============================================
// EXPRESS.JS EXAMPLE
// ============================================

/*
import express from 'express'
import bodyParser from 'body-parser'

const app = express()

// IMPORTANT: Use raw body for webhook signature verification
app.post('/api/stripe/webhook',
  bodyParser.raw({ type: 'application/json' }),
  stripeWebhook
)

// JSON body parser for other routes
app.use(bodyParser.json())

app.post('/api/stripe/create-checkout-session', createCheckoutSession)
app.post('/api/stripe/create-portal-session', createPortalSession)
app.get('/api/stripe/subscription-status', getSubscriptionStatus)

app.listen(3000, () => {
  console.log('API server running on port 3000')
})
*/

// ============================================
// NEXT.JS API ROUTE EXAMPLE
// ============================================

/*
// pages/api/stripe/create-checkout-session.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  return createCheckoutSession(req, res)
}

// pages/api/stripe/create-portal-session.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  return createPortalSession(req, res)
}

// pages/api/stripe/webhook.js
export const config = {
  api: {
    bodyParser: false, // Must use raw body for webhook verification
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  return stripeWebhook(req, res)
}

// pages/api/stripe/subscription-status.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  return getSubscriptionStatus(req, res)
}
*/
