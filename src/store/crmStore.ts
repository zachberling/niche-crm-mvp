import { create } from 'zustand'
import { Contact, CreateContact } from '@/types/contact'
import { Activity, CreateActivity } from '@/types/activity'
import { v4 as uuidv4 } from 'uuid'

interface CRMState {
  contacts: Contact[]
  activities: Activity[]
  addContact: (data: CreateContact) => Contact
  updateContact: (id: string, data: Partial<CreateContact>) => void
  deleteContact: (id: string) => void
  addActivity: (data: CreateActivity) => Activity
  getContactActivities: (contactId: string) => Activity[]
}

export const useCRMStore = create<CRMState>((set, get) => ({
  contacts: [],
  activities: [],

  addContact: (data) => {
    const contact: Contact = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((s) => ({ contacts: [contact, ...s.contacts] }))
    return contact
  },

  updateContact: (id, data) => {
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
      ),
    }))
  },

  deleteContact: (id) => {
    set((s) => ({
      contacts: s.contacts.filter((c) => c.id !== id),
      activities: s.activities.filter((a) => a.contactId !== id),
    }))
  },

  addActivity: (data) => {
    const activity: Activity = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    }
    set((s) => ({ activities: [activity, ...s.activities] }))
    return activity
  },

  getContactActivities: (contactId) => {
    return get().activities.filter((a) => a.contactId === contactId)
  },
}))
