// POST /api/validate-integration
// Tests a connected integration with real API calls
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, config } = req.body

  try {
    const result = await validate(id, config)
    res.json(result)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

async function validate(id, config) {
  switch (id) {
    case 'slack': {
      if (!config?.webhookUrl) return { ok: false, message: 'Webhook URL required' }
      const r = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '✅ Discsentia connected successfully!' }),
      })
      return r.ok
        ? { ok: true, message: 'Slack message sent successfully' }
        : { ok: false, message: `Slack returned ${r.status}` }
    }

    case 'zapier': {
      if (!config?.webhookUrl) return { ok: false, message: 'Webhook URL required' }
      const r = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'discsentia', event: 'connection_test', timestamp: new Date().toISOString() }),
      })
      return r.ok || r.status === 200
        ? { ok: true, message: 'Zapier webhook triggered successfully' }
        : { ok: false, message: `Zapier returned ${r.status}` }
    }

    case 'twilio': {
      const { accountSid, authToken } = config ?? {}
      if (!accountSid || !authToken) return { ok: false, message: 'Account SID and Auth Token required' }
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64') },
      })
      if (r.ok) {
        const d = await r.json()
        return { ok: true, message: `Twilio account verified: ${d.friendly_name}` }
      }
      return { ok: false, message: `Twilio auth failed (${r.status})` }
    }

    case 'sendgrid': {
      if (!config?.apiKey) return { ok: false, message: 'API Key required' }
      const r = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      })
      if (r.ok) {
        const d = await r.json()
        return { ok: true, message: `SendGrid verified: ${d.email || d.username || 'account active'}` }
      }
      return { ok: false, message: `SendGrid auth failed (${r.status})` }
    }

    case 'google_calendar': {
      if (!config?.apiKey) return { ok: false, message: 'API Key required' }
      const r = await fetch(
        `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${config.apiKey}`,
        { headers: { Authorization: `Bearer ${config.apiKey}` } }
      )
      return r.ok
        ? { ok: true, message: 'Google Calendar connected' }
        : { ok: false, message: `Google Calendar auth failed — OAuth token required` }
    }

    case 'quickbooks':
      return { ok: false, message: 'QuickBooks requires OAuth — click "Connect with QuickBooks" to authorize', requiresOAuth: true }

    case 'servicetitan': {
      if (!config?.apiKey || !config?.tenantId) return { ok: false, message: 'API Key and Tenant ID required' }
      return { ok: false, message: 'ServiceTitan requires enterprise API access — contact ServiceTitan support for API credentials', requiresEnterprise: true }
    }

    case 'housecall_pro': {
      if (!config?.apiKey) return { ok: false, message: 'API Key required' }
      const r = await fetch('https://api.housecallpro.com/company', {
        headers: { Authorization: `Token ${config.apiKey}` },
      })
      return r.ok
        ? { ok: true, message: 'Housecall Pro connected' }
        : { ok: false, message: `Housecall Pro auth failed (${r.status})` }
    }

    default:
      return { ok: false, message: `Unknown integration: ${id}` }
  }
}
