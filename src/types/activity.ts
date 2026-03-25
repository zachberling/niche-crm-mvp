import { z } from 'zod'

/**
 * Activity types represent different kinds of interactions with contacts
 */
export const ActivityTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'note',
  'task',
  'status_change',
])

export type ActivityType = z.infer<typeof ActivityTypeSchema>

/**
 * Activity schema - represents any interaction with a contact
 */
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid(),
  type: ActivityTypeSchema,
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(), // Flexible metadata for different activity types
  createdAt: z.date(),
  createdBy: z.string().optional(), // User ID (for future multi-user support)
})

export type Activity = z.infer<typeof ActivitySchema>

/**
 * Schema for creating a new activity
 */
export const CreateActivitySchema = ActivitySchema.omit({
  id: true,
  createdAt: true,
})

export type CreateActivity = z.infer<typeof CreateActivitySchema>

/**
 * Helper schemas for specific activity metadata
 */
export const CallMetadataSchema = z.object({
  duration: z.number().optional(), // Duration in seconds
  outcome: z.enum(['answered', 'no_answer', 'voicemail', 'busy']).optional(),
  phoneNumber: z.string().optional(),
})

export const EmailMetadataSchema = z.object({
  subject: z.string().optional(),
  recipient: z.string().email().optional(),
  status: z.enum(['sent', 'delivered', 'opened', 'bounced']).optional(),
})

export const MeetingMetadataSchema = z.object({
  location: z.string().optional(),
  duration: z.number().optional(), // Duration in minutes
  attendees: z.array(z.string()).optional(),
})

export const TaskMetadataSchema = z.object({
  dueDate: z.date().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

export const StatusChangeMetadataSchema = z.object({
  oldStatus: z.string(),
  newStatus: z.string(),
})

export type CallMetadata = z.infer<typeof CallMetadataSchema>
export type EmailMetadata = z.infer<typeof EmailMetadataSchema>
export type MeetingMetadata = z.infer<typeof MeetingMetadataSchema>
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>
export type StatusChangeMetadata = z.infer<typeof StatusChangeMetadataSchema>
