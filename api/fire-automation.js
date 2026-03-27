// POST /api/fire-automation
// Called when a trigger event occurs — runs matching enabled automations
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { trigger, context, automations, integrations } = req.body
  // automations + integrations passed from client (no DB query needed)

  const matching = (automations ?? []).filter(a => a.enabled && a.trigger === trigger)
  const results = []

  for (const rule of matching) {
    const integration = (integrations ?? []).find(i => i.id === actionToIntegration(rule.action))
    const result = await fireAction(rule, context, integration)
    results.push({ ruleId: rule.id, ruleName: rule.name, ...result })
  }

  res.json({ fired: results.length, results })
}

function actionToIntegration(action) {
  const map = { send_sms: 'twilio', send_email: 'sendgrid', notify_slack: 'slack', webhook: 'zapier' }
  return map[action]
}

function interpolate(template, ctx) {
  return (template ?? '').replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? `{${k}}`)
}

async function fireAction(rule, ctx, integration) {
  const msg = interpolate(rule.config?.message || rule.config?.subject || '', ctx)

  switch (rule.action) {
    case 'webhook': {
      const url = rule.config?.url || integration?.config?.webhookUrl
      if (!url) return { ok: false, message: 'No webhook URL configured' }
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: rule.trigger, rule: rule.name, context: ctx, timestamp: new Date().toISOString() }),
      }).catch(e => ({ ok: false, status: 0, _err: e.message }))
      return r.ok ? { ok: true, message: 'Webhook fired' } : { ok: false, message: `Webhook failed: ${r.status || r._err}` }
    }

    case 'notify_slack': {
      const url = integration?.config?.webhookUrl
      if (!url) return { ok: false, message: 'Slack not connected' }
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg || `🔔 ${rule.name}: ${ctx.title || ctx.name || ''}` }),
      }).catch(e => ({ ok: false, _err: e.message }))
      return r.ok ? { ok: true, message: 'Slack notified' } : { ok: false, message: 'Slack failed' }
    }

    case 'send_sms': {
      const { accountSid, authToken, fromNumber } = integration?.config ?? {}
      const toNumber = ctx.phone
      if (!accountSid || !authToken || !fromNumber) return { ok: false, message: 'Twilio not configured' }
      if (!toNumber) return { ok: false, message: 'No phone number for contact' }
      const body = new URLSearchParams({ To: toNumber, From: fromNumber, Body: msg })
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }).catch(e => ({ ok: false, _err: e.message }))
      return r.ok ? { ok: true, message: `SMS sent to ${toNumber}` } : { ok: false, message: `SMS failed (${r.status})` }
    }

    case 'send_email': {
      const { apiKey, fromEmail } = integration?.config ?? {}
      const toEmail = ctx.email
      if (!apiKey || !fromEmail) return { ok: false, message: 'SendGrid not configured' }
      if (!toEmail) return { ok: false, message: 'No email for contact' }
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: fromEmail },
          subject: rule.config?.subject || rule.name,
          content: [{ type: 'text/plain', value: msg }],
        }),
      }).catch(e => ({ ok: false, _err: e.message }))
      return r.status === 202 ? { ok: true, message: `Email sent to ${toEmail}` } : { ok: false, message: `Email failed (${r.status})` }
    }

    case 'create_job':
      return { ok: true, message: 'Job creation queued (handled client-side)' }

    case 'add_tag':
      return { ok: true, message: `Tag added: ${rule.config?.tag || 'default'}` }

    default:
      return { ok: false, message: `Unknown action: ${rule.action}` }
  }
}
