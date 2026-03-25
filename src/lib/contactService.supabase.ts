import { supabase } from './supabase'
import type { Contact, CreateContact } from '@/types/contact'

export const contactService = {
  async getAll(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || '',
      phone: row.phone || '',
      company: row.company || '',
      status: row.status as 'lead' | 'active' | 'inactive',
      source: row.source || '',
      notes: row.notes || '',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  },

  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      status: data.status as 'lead' | 'active' | 'inactive',
      source: data.source || '',
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async create(contact: CreateContact): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email || null,
        phone: contact.phone || null,
        company: contact.company || null,
        status: contact.status,
        source: contact.source || null,
        notes: contact.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      status: data.status as 'lead' | 'active' | 'inactive',
      source: data.source || '',
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async update(id: string, updates: Partial<CreateContact>): Promise<Contact> {
    const dbUpdates: Record<string, unknown> = {}
    
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
    if (updates.email !== undefined) dbUpdates.email = updates.email || null
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null
    if (updates.company !== undefined) dbUpdates.company = updates.company || null
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.source !== undefined) dbUpdates.source = updates.source || null
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null

    const { data, error } = await supabase
      .from('contacts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      status: data.status as 'lead' | 'active' | 'inactive',
      source: data.source || '',
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async search(query: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || '',
      phone: row.phone || '',
      company: row.company || '',
      status: row.status as 'lead' | 'active' | 'inactive',
      source: row.source || '',
      notes: row.notes || '',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  },

  async filterByStatus(status: 'lead' | 'active' | 'inactive'): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || '',
      phone: row.phone || '',
      company: row.company || '',
      status: row.status as 'lead' | 'active' | 'inactive',
      source: row.source || '',
      notes: row.notes || '',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  },
}
