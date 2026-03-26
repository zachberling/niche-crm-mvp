module.exports = async function handler(req, res) {
  try {
    const r = await fetch('https://api.stripe.com/v1/prices/price_1TF27aIJvLu6ZmsGiPoSXQDD', {
      headers: { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY }
    })
    const data = await r.json()
    res.json({ status: r.status, id: data.id, error: data.error })
  } catch (e) {
    res.status(500).json({ error: e.message, type: e.constructor.name })
  }
}
