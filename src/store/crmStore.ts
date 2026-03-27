import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Contact, CreateContact } from '@/types/contact'
import { Activity, CreateActivity } from '@/types/activity'
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '@/lib/db'

// snake_case → camelCase for contacts
function rowToContact(r: Record<string, unknown>): Contact {
  return {
    id: r.id as string,
    firstName: r.first_name as string,
    lastName: r.last_name as string,
    email: (r.email as string) ?? '',
    phone: (r.phone as string) ?? '',
    company: (r.company as string) ?? '',
    status: r.status as Contact['status'],
    source: (r.source as string) ?? '',
    notes: (r.notes as string) ?? '',
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  }
}

function contactToRow(c: Partial<CreateContact>) {
  return {
    first_name: c.firstName,
    last_name: c.lastName,
    email: c.email ?? null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    status: c.status ?? 'lead',
    source: c.source ?? null,
    notes: c.notes ?? null,
  }
}

function rowToActivity(r: Record<string, unknown>): Activity {
  return {
    id: r.id as string,
    contactId: r.contact_id as string,
    type: r.type as Activity['type'],
    title: r.title as string,
    description: (r.description as string) ?? '',
    createdAt: new Date(r.created_at as string),
  }
}

interface CRMState {
  contacts: Contact[]
  activities: Activity[]
  loaded: boolean
  load: () => Promise<void>
  addContact: (data: CreateContact) => Promise<Contact>
  updateContact: (id: string, data: Partial<CreateContact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  addActivity: (data: CreateActivity) => Promise<Activity>
  getContactActivities: (contactId: string) => Activity[]
}

export const useCRMStore = create<CRMState>((set, get) => ({
  contacts: [],
  activities: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    const [contacts, activities] = await Promise.all([
      dbSelect<Record<string, unknown>>('contacts'),
      dbSelect<Record<string, unknown>>('activities'),
    ])
    set({
      contacts: contacts.map(rowToContact),
      activities: activities.map(rowToActivity),
      loaded: true,
    })
  },

  addContact: async (data) => {
    const row = await dbInsert<Record<string, unknown>>('contacts', contactToRow(data))
    const contact = row ? rowToContact(row) : {
      ...data, id: uuidv4(), createdAt: new Date(), updatedAt: new Date(),
    }
    set((s) => ({ contacts: [contact, ...s.contacts] }))
    return contact
  },

  updateContact: async (id, data) => {
    await dbUpdate('contacts', id, contactToRow(data))
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
      ),
    }))
  },

  deleteContact: async (id) => {
    await dbDelete('contacts', id)
    set((s) => ({
      contacts: s.contacts.filter((c) => c.id !== id),
      activities: s.activities.filter((a) => a.contactId !== id),
    }))
  },

  addActivity: async (data) => {
    const row = await dbInsert<Record<string, unknown>>('activities', {
      contact_id: data.contactId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
    })
    const activity = row ? rowToActivity(row) : {
      ...data, id: uuidv4(), createdAt: new Date(),
    }
    set((s) => ({ activities: [activity, ...s.activities] }))
    return activity
  },

  getContactActivities: (contactId) =>
    get().activities.filter((a) => a.contactId === contactId),
}))
