import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Job, Equipment, AutomationRule, Integration } from '@/types/hvac'

interface HVACState {
  jobs: Job[]
  equipment: Equipment[]
  automations: AutomationRule[]
  integrations: Integration[]

  // Jobs
  addJob: (data: Omit<Job, 'id' | 'createdAt'>) => Job
  updateJob: (id: string, data: Partial<Job>) => void
  deleteJob: (id: string) => void
  getContactJobs: (contactId: string) => Job[]

  // Equipment
  addEquipment: (data: Omit<Equipment, 'id' | 'createdAt'>) => Equipment
  updateEquipment: (id: string, data: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void
  getContactEquipment: (contactId: string) => Equipment[]

  // Automations
  addAutomation: (data: Omit<AutomationRule, 'id' | 'createdAt' | 'runCount'>) => AutomationRule
  updateAutomation: (id: string, data: Partial<AutomationRule>) => void
  deleteAutomation: (id: string) => void
  toggleAutomation: (id: string) => void

  // Integrations
  connectIntegration: (id: string, config: Record<string, string>) => void
  disconnectIntegration: (id: string) => void
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: 'twilio', name: 'Twilio SMS', connected: false },
  { id: 'sendgrid', name: 'SendGrid Email', connected: false },
  { id: 'slack', name: 'Slack', connected: false },
  { id: 'google_calendar', name: 'Google Calendar', connected: false },
  { id: 'quickbooks', name: 'QuickBooks', connected: false },
  { id: 'zapier', name: 'Zapier', connected: false },
  { id: 'servicetitan', name: 'ServiceTitan', connected: false },
  { id: 'housecall_pro', name: 'Housecall Pro', connected: false },
]

export const useHVACStore = create<HVACState>()(
  persist(
    (set, get) => ({
      jobs: [],
      equipment: [],
      automations: [],
      integrations: DEFAULT_INTEGRATIONS,

      addJob: (data) => {
        const job: Job = { ...data, id: uuidv4(), createdAt: new Date() }
        set((s) => ({ jobs: [job, ...s.jobs] }))
        return job
      },
      updateJob: (id, data) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...data } : j)) })),
      deleteJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
      getContactJobs: (contactId) => get().jobs.filter((j) => j.contactId === contactId),

      addEquipment: (data) => {
        const eq: Equipment = { ...data, id: uuidv4(), createdAt: new Date() }
        set((s) => ({ equipment: [eq, ...s.equipment] }))
        return eq
      },
      updateEquipment: (id, data) =>
        set((s) => ({ equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
      deleteEquipment: (id) => set((s) => ({ equipment: s.equipment.filter((e) => e.id !== id) })),
      getContactEquipment: (contactId) => get().equipment.filter((e) => e.contactId === contactId),

      addAutomation: (data) => {
        const rule: AutomationRule = { ...data, id: uuidv4(), runCount: 0, createdAt: new Date() }
        set((s) => ({ automations: [rule, ...s.automations] }))
        return rule
      },
      updateAutomation: (id, data) =>
        set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, ...data } : a)) })),
      deleteAutomation: (id) =>
        set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),
      toggleAutomation: (id) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),

      connectIntegration: (id, config) =>
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id ? { ...i, connected: true, config, lastSyncAt: new Date() } : i
          ),
        })),
      disconnectIntegration: (id) =>
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id ? { ...i, connected: false, config: undefined } : i
          ),
        })),
    }),
    { name: 'hvac-store' }
  )
)
