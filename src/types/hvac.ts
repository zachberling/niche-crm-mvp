import { z } from 'zod'

export const JobStatusSchema = z.enum(['scheduled', 'en_route', 'in_progress', 'completed', 'cancelled', 'no_show'])
export const JobTypeSchema = z.enum(['maintenance', 'repair', 'installation', 'inspection', 'emergency', 'estimate'])
export const PrioritySchema = z.enum(['low', 'normal', 'high', 'emergency'])

export const JobSchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid(),
  type: JobTypeSchema,
  status: JobStatusSchema,
  priority: PrioritySchema,
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.date(),
  completedAt: z.date().optional(),
  technicianName: z.string().optional(),
  address: z.string().optional(),
  estimatedDuration: z.number().optional(), // minutes
  actualDuration: z.number().optional(),
  invoiceAmount: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
})

export type Job = z.infer<typeof JobSchema>
export type JobStatus = z.infer<typeof JobStatusSchema>
export type JobType = z.infer<typeof JobTypeSchema>
export type Priority = z.infer<typeof PrioritySchema>

export const EquipmentSchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid(),
  type: z.enum(['ac_unit', 'furnace', 'heat_pump', 'boiler', 'ductwork', 'thermostat', 'other']),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installDate: z.date().optional(),
  lastServiceDate: z.date().optional(),
  nextServiceDate: z.date().optional(),
  warrantyExpiry: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
})

export type Equipment = z.infer<typeof EquipmentSchema>

export const AutomationTriggerSchema = z.enum([
  'job_completed',
  'job_scheduled',
  'equipment_service_due',
  'contact_created',
  'no_contact_30_days',
  'invoice_overdue',
])

export const AutomationActionSchema = z.enum([
  'send_sms',
  'send_email',
  'create_job',
  'add_tag',
  'notify_slack',
  'webhook',
])

export const AutomationRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  enabled: z.boolean(),
  trigger: AutomationTriggerSchema,
  action: AutomationActionSchema,
  config: z.record(z.string(), z.any()),
  runCount: z.number().default(0),
  lastRunAt: z.date().optional(),
  createdAt: z.date(),
})

export type AutomationRule = z.infer<typeof AutomationRuleSchema>
export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>
export type AutomationAction = z.infer<typeof AutomationActionSchema>

export const IntegrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  connected: z.boolean(),
  config: z.record(z.string(), z.string()).optional(),
  lastSyncAt: z.date().optional(),
})

export type Integration = z.infer<typeof IntegrationSchema>
