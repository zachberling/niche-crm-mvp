import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (generated from Supabase schema)
export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company: string | null
          status: 'lead' | 'active' | 'inactive'
          source: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          status?: 'lead' | 'active' | 'inactive'
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          status?: 'lead' | 'active' | 'inactive'
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          contact_id: string
          type: 'note' | 'email' | 'call' | 'meeting' | 'task'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          type: 'note' | 'email' | 'call' | 'meeting' | 'task'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          type?: 'note' | 'email' | 'call' | 'meeting' | 'task'
          description?: string
          created_at?: string
        }
      }
    }
  }
}
