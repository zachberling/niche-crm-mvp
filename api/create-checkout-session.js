module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { priceId, successUrl, cancelUrl } = req.body
  const key = process.env.STRIPE_SECRET_KEY

  try {
    // Create checkout session via Stripe REST API directly
    const body = new URLSearchParams({
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: successUrl,
      cancel_url: cancelUrl,
      'subscription_data[trial_period_days]': '14',
    })

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message })
    res.json({ url: data.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
