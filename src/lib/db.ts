import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) throw new Error('Missing Supabase env vars')

export const supabase = createClient(url, key)

// ── typed helpers ──────────────────────────────────────────────────────────

export async function dbSelect<T>(table: string, filter?: Record<string, string>): Promise<T[]> {
  let q = supabase.from(table).select('*').order('created_at', { ascending: false })
  if (filter) Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v) })
  const { data, error } = await q
  if (error) { console.error(`db select ${table}:`, error.message); return [] }
  return (data ?? []) as T[]
}

export async function dbInsert<T>(table: string, row: Omit<T, 'id' | 'created_at'>): Promise<T | null> {
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) { console.error(`db insert ${table}:`, error.message); return null }
  return data as T
}

export async function dbUpdate(table: string, id: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (error) console.error(`db update ${table}:`, error.message)
}

export async function dbDelete(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.error(`db delete ${table}:`, error.message)
}
