import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Job, Equipment, AutomationRule, Integration } from '@/types/hvac'
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '@/lib/db'

function rowToJob(r: Record<string, unknown>): Job {
  return {
    id: r.id as string,
    contactId: r.contact_id as string,
    type: r.type as Job['type'],
    status: r.status as Job['status'],
    priority: r.priority as Job['priority'],
    title: r.title as string,
    description: (r.description as string) ?? '',
    scheduledAt: new Date(r.scheduled_at as string),
    completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
    technicianName: (r.technician_name as string) ?? '',
    address: (r.address as string) ?? '',
    estimatedDuration: (r.estimated_duration as number) ?? undefined,
    invoiceAmount: (r.invoice_amount as number) ?? undefined,
    notes: (r.notes as string) ?? '',
    createdAt: new Date(r.created_at as string),
  }
}

function jobToRow(j: Partial<Job>) {
  return {
    contact_id: j.contactId,
    type: j.type,
    status: j.status ?? 'scheduled',
    priority: j.priority ?? 'normal',
    title: j.title,
    description: j.description ?? null,
    scheduled_at: j.scheduledAt instanceof Date ? j.scheduledAt.toISOString() : j.scheduledAt,
    completed_at: j.completedAt instanceof Date ? j.completedAt.toISOString() : null,
    technician_name: j.technicianName ?? null,
    address: j.address ?? null,
    estimated_duration: j.estimatedDuration ?? null,
    invoice_amount: j.invoiceAmount ?? null,
    notes: j.notes ?? null,
  }
}

function rowToEquipment(r: Record<string, unknown>): Equipment {
  return {
    id: r.id as string,
    contactId: r.contact_id as string,
    type: r.type as Equipment['type'],
    brand: (r.brand as string) ?? '',
    model: (r.model as string) ?? '',
    serialNumber: (r.serial_number as string) ?? '',
    installDate: r.install_date ? new Date(r.install_date as string) : undefined,
    lastServiceDate: r.last_service_date ? new Date(r.last_service_date as string) : undefined,
    nextServiceDate: r.next_service_date ? new Date(r.next_service_date as string) : undefined,
    warrantyExpiry: r.warranty_expiry ? new Date(r.warranty_expiry as string) : undefined,
    notes: (r.notes as string) ?? '',
    createdAt: new Date(r.created_at as string),
  }
}

function equipmentToRow(e: Partial<Equipment>) {
  const toDate = (d: Date | undefined) => d instanceof Date ? d.toISOString().split('T')[0] : null
  return {
    contact_id: e.contactId,
    type: e.type,
    brand: e.brand ?? null,
    model: e.model ?? null,
    serial_number: e.serialNumber ?? null,
    install_date: toDate(e.installDate),
    last_service_date: toDate(e.lastServiceDate),
    next_service_date: toDate(e.nextServiceDate),
    warranty_expiry: toDate(e.warrantyExpiry),
    notes: e.notes ?? null,
  }
}

function rowToAutomation(r: Record<string, unknown>): AutomationRule {
  return {
    id: r.id as string,
    name: r.name as string,
    enabled: r.enabled as boolean,
    trigger: r.trigger as AutomationRule['trigger'],
    action: r.action as AutomationRule['action'],
    config: (r.config as Record<string, unknown>) ?? {},
    runCount: (r.run_count as number) ?? 0,
    lastRunAt: r.last_run_at ? new Date(r.last_run_at as string) : undefined,
    createdAt: new Date(r.created_at as string),
  }
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

interface HVACState {
  jobs: Job[]
  equipment: Equipment[]
  automations: AutomationRule[]
  integrations: Integration[]
  loaded: boolean
  load: () => Promise<void>
  addJob: (data: Omit<Job, 'id' | 'createdAt'>) => Promise<Job>
  updateJob: (id: string, data: Partial<Job>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  getContactJobs: (contactId: string) => Job[]
  addEquipment: (data: Omit<Equipment, 'id' | 'createdAt'>) => Promise<Equipment>
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>
  deleteEquipment: (id: string) => Promise<void>
  getContactEquipment: (contactId: string) => Equipment[]
  addAutomation: (data: Omit<AutomationRule, 'id' | 'createdAt' | 'runCount'>) => Promise<AutomationRule>
  updateAutomation: (id: string, data: Partial<AutomationRule>) => void
  deleteAutomation: (id: string) => Promise<void>
  toggleAutomation: (id: string) => Promise<void>
  connectIntegration: (id: string, config: Record<string, string>) => void
  disconnectIntegration: (id: string) => void
}

export const useHVACStore = create<HVACState>((set, get) => ({
  jobs: [],
  equipment: [],
  automations: [],
  integrations: DEFAULT_INTEGRATIONS,
  loaded: false,

  load: async () => {
    if (get().loaded) return
    const [jobs, equipment, automations] = await Promise.all([
      dbSelect<Record<string, unknown>>('jobs'),
      dbSelect<Record<string, unknown>>('equipment'),
      dbSelect<Record<string, unknown>>('automations'),
    ])
    set({
      jobs: jobs.map(rowToJob),
      equipment: equipment.map(rowToEquipment),
      automations: automations.map(rowToAutomation),
      loaded: true,
    })
  },

  addJob: async (data) => {
    const row = await dbInsert<Record<string, unknown>>('jobs', jobToRow(data))
    const job = row ? rowToJob(row) : { ...data, id: uuidv4(), createdAt: new Date() }
    set((s) => ({ jobs: [job, ...s.jobs] }))
    return job
  },
  updateJob: async (id, data) => {
    await dbUpdate('jobs', id, jobToRow(data))
    set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? { ...j, ...data } : j) }))
  },
  deleteJob: async (id) => {
    await dbDelete('jobs', id)
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }))
  },
  getContactJobs: (contactId) => get().jobs.filter((j) => j.contactId === contactId),

  addEquipment: async (data) => {
    const row = await dbInsert<Record<string, unknown>>('equipment', equipmentToRow(data))
    const eq = row ? rowToEquipment(row) : { ...data, id: uuidv4(), createdAt: new Date() }
    set((s) => ({ equipment: [eq, ...s.equipment] }))
    return eq
  },
  updateEquipment: async (id, data) => {
    await dbUpdate('equipment', id, equipmentToRow(data))
    set((s) => ({ equipment: s.equipment.map((e) => e.id === id ? { ...e, ...data } : e) }))
  },
  deleteEquipment: async (id) => {
    await dbDelete('equipment', id)
    set((s) => ({ equipment: s.equipment.filter((e) => e.id !== id) }))
  },
  getContactEquipment: (contactId) => get().equipment.filter((e) => e.contactId === contactId),

  addAutomation: async (data) => {
    const row = await dbInsert<Record<string, unknown>>('automations', {
      name: data.name, enabled: data.enabled, trigger: data.trigger,
      action: data.action, config: data.config,
    })
    const rule = row ? rowToAutomation(row) : { ...data, id: uuidv4(), runCount: 0, createdAt: new Date() }
    set((s) => ({ automations: [rule, ...s.automations] }))
    return rule
  },
  updateAutomation: (id, data) =>
    set((s) => ({ automations: s.automations.map((a) => a.id === id ? { ...a, ...data } : a) })),
  deleteAutomation: async (id) => {
    await dbDelete('automations', id)
    set((s) => ({ automations: s.automations.filter((a) => a.id !== id) }))
  },
  toggleAutomation: async (id) => {
    const rule = get().automations.find((a) => a.id === id)
    if (!rule) return
    await dbUpdate('automations', id, { enabled: !rule.enabled })
    set((s) => ({
      automations: s.automations.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a),
    }))
  },

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
}))
