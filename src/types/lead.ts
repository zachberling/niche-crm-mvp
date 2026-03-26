import { z } from 'zod'

/**
 * Lead Pipeline Stage
 * Tracks progression from initial contact to closed deal
 */
export const LeadStageSchema = z.enum([
  'new',          // Just added, not yet contacted
  'contacted',    // Initial contact made
  'qualified',    // Meets criteria, has budget/timeline
  'proposal',     // Estimate/proposal sent
  'negotiation',  // Discussing terms
  'won',          // Deal closed - convert to active customer
  'lost',         // Deal lost - track reason
])

export type LeadStage = z.infer<typeof LeadStageSchema>

/**
 * Lead qualification criteria for HVAC contractors
 */
export const LeadQualificationSchema = z.object({
  hasUrgency: z.boolean().default(false),      // Emergency repair or time-sensitive
  hasBudget: z.boolean().default(false),       // Can afford service
  isDecisionMaker: z.boolean().default(false), // Has authority to approve
  hasTimeline: z.boolean().default(false),     // Specific timeline for work
  score: z.number().min(0).max(100).default(0), // Overall qualification score (0-100)
})

export type LeadQualification = z.infer<typeof LeadQualificationSchema>

/**
 * Lead with pipeline tracking
 */
export const LeadSchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid(),
  stage: LeadStageSchema,
  qualification: LeadQualificationSchema,
  estimatedValue: z.number().optional(), // Estimated deal value in dollars
  expectedCloseDate: z.date().optional(), // When we expect to close
  lostReason: z.string().optional(),     // Why deal was lost (if stage = lost)
  source: z.string().optional(),         // How they found us
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastStageChange: z.date(),             // When stage last changed
})

export type Lead = z.infer<typeof LeadSchema>

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastStageChange: true,
})

export type CreateLead = z.infer<typeof CreateLeadSchema>

/**
 * Lead stage change event for tracking pipeline movement
 */
export const LeadStageChangeSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  fromStage: LeadStageSchema,
  toStage: LeadStageSchema,
  changedAt: z.date(),
  notes: z.string().optional(),
})

export type LeadStageChange = z.infer<typeof LeadStageChangeSchema>

/**
 * Pipeline analytics/metrics
 */
export interface PipelineMetrics {
  totalLeads: number
  activeLeads: number // Not won/lost
  wonLeads: number
  lostLeads: number
  totalValue: number // Sum of all estimated values
  averageValue: number
  conversionRate: number // Won / (Won + Lost)
  averageDaysToClose: number
  leadsByStage: Record<LeadStage, number>
  qualificationScore: number // Average qualification score
}

/**
 * Common lost reasons for HVAC
 */
export const LOST_REASONS = [
  'Price too high',
  'Chose competitor',
  'No longer needed',
  'Poor timing',
  'Unresponsive',
  'Not qualified',
  'Other',
] as const
