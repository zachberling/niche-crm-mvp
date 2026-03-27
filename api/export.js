// POST /api/export
// Exports all user data as CSV or JSON
const { createClient } = require('@supabase/supabase-js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { format = 'csv', tables = ['contacts', 'jobs', 'equipment', 'activities', 'automations'] } = req.body

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const data = {}
  for (const table of tables) {
    const { data: rows, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (!error) data[table] = rows ?? []
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="discsentia-export-${date()}.json"`)
    return res.json(data)
  }

  // CSV: one file per table, zip them together as multipart or return as JSON with csv strings
  const csvData = {}
  for (const [table, rows] of Object.entries(data)) {
    csvData[table] = toCSV(rows)
  }

  res.setHeader('Content-Type', 'application/json')
  res.json({ format: 'csv', files: csvData, exportedAt: new Date().toISOString() })
}

function toCSV(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const v = row[h]
        if (v === null || v === undefined) return ''
        const s = String(v).replace(/"/g, '""')
        return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s
      }).join(',')
    )
  ]
  return lines.join('\n')
}

function date() {
  return new Date().toISOString().split('T')[0]
}
