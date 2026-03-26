import {
  Lead,
  CreateLead,
  LeadSchema,
  LeadStage,
  LeadStageChange,
  LeadStageChangeSchema,
  PipelineMetrics,
  LeadQualification,
} from '@/types/lead'
import { v4 as uuidv4 } from 'uuid'
import { differenceInDays } from 'date-fns'

/**
 * In-memory lead storage for MVP
 * In production, this would be replaced with a database layer
 */
class LeadService {
  private leads: Map<string, Lead> = new Map()
  private stageChanges: Map<string, LeadStageChange> = new Map()

  /**
   * Create a new lead
   */
  async create(data: CreateLead): Promise<Lead> {
    const now = new Date()
    const lead: Lead = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      lastStageChange: now,
    }

    // Validate with Zod schema
    const validated = LeadSchema.parse(lead)

    this.leads.set(validated.id, validated)

    // Log initial stage
    await this.logStageChange(validated.id, data.stage, data.stage)

    return validated
  }

  /**
   * Get a lead by ID
   */
  async getById(id: string): Promise<Lead | null> {
    const lead = this.leads.get(id)
    return lead || null
  }

  /**
   * Get lead by contact ID
   */
  async getByContactId(contactId: string): Promise<Lead | null> {
    const lead = Array.from(this.leads.values()).find(
      (l) => l.contactId === contactId
    )
    return lead || null
  }

  /**
   * Get all leads
   */
  async getAll(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )
  }

  /**
   * Get active leads (not won or lost)
   */
  async getActive(): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter((lead) => lead.stage !== 'won' && lead.stage !== 'lost')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  /**
   * Get leads by stage
   */
  async getByStage(stage: LeadStage): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter((lead) => lead.stage === stage)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  /**
   * Update a lead
   */
  async update(
    id: string,
    data: Partial<CreateLead>
  ): Promise<Lead | null> {
    const existing = this.leads.get(id)
    if (!existing) {
      return null
    }

    const now = new Date()
    const updated: Lead = {
      ...existing,
      ...data,
      id: existing.id, // Prevent ID change
      contactId: data.contactId ?? existing.contactId,
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: now,
      lastStageChange:
        data.stage && data.stage !== existing.stage
          ? now
          : existing.lastStageChange,
    }

    // Log stage change if stage changed
    if (data.stage && data.stage !== existing.stage) {
      await this.logStageChange(id, existing.stage, data.stage)
    }

    // Validate updated lead
    const validated = LeadSchema.parse(updated)

    this.leads.set(id, validated)
    return validated
  }

  /**
   * Update lead stage
   */
  async updateStage(
    id: string,
    newStage: LeadStage,
    notes?: string
  ): Promise<Lead | null> {
    const existing = this.leads.get(id)
    if (!existing) {
      return null
    }

    if (existing.stage === newStage) {
      return existing // No change
    }

    const now = new Date()
    const updated: Lead = {
      ...existing,
      stage: newStage,
      updatedAt: now,
      lastStageChange: now,
    }

    // Clear lost reason if moving out of lost stage
    if (existing.stage === 'lost' && newStage !== 'lost') {
      updated.lostReason = undefined
    }

    const validated = LeadSchema.parse(updated)
    this.leads.set(id, validated)

    // Log stage change
    await this.logStageChange(id, existing.stage, newStage, notes)

    return validated
  }

  /**
   * Update lead qualification
   */
  async updateQualification(
    id: string,
    qualification: Partial<LeadQualification>
  ): Promise<Lead | null> {
    const existing = this.leads.get(id)
    if (!existing) {
      return null
    }

    const updatedQualification = {
      ...existing.qualification,
      ...qualification,
    }

    // Auto-calculate score based on criteria (25 points each)
    const criteriaCount = [
      updatedQualification.hasUrgency,
      updatedQualification.hasBudget,
      updatedQualification.isDecisionMaker,
      updatedQualification.hasTimeline,
    ].filter(Boolean).length

    updatedQualification.score = criteriaCount * 25

    return this.update(id, { qualification: updatedQualification })
  }

  /**
   * Mark lead as won (convert to customer)
   */
  async markWon(id: string, notes?: string): Promise<Lead | null> {
    return this.updateStage(id, 'won', notes)
  }

  /**
   * Mark lead as lost
   */
  async markLost(
    id: string,
    reason: string,
    notes?: string
  ): Promise<Lead | null> {
    const lead = await this.update(id, { lostReason: reason })
    if (!lead) return null
    return this.updateStage(id, 'lost', notes)
  }

  /**
   * Delete a lead
   */
  async delete(id: string): Promise<boolean> {
    // Also delete stage change history
    Array.from(this.stageChanges.values())
      .filter((change) => change.leadId === id)
      .forEach((change) => this.stageChanges.delete(change.id))

    return this.leads.delete(id)
  }

  /**
   * Get stage change history for a lead
   */
  async getStageHistory(leadId: string): Promise<LeadStageChange[]> {
    return Array.from(this.stageChanges.values())
      .filter((change) => change.leadId === leadId)
      .sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime())
  }

  /**
   * Get pipeline metrics
   */
  async getMetrics(): Promise<PipelineMetrics> {
    const allLeads = Array.from(this.leads.values())

    const wonLeads = allLeads.filter((l) => l.stage === 'won')
    const lostLeads = allLeads.filter((l) => l.stage === 'lost')
    const activeLeads = allLeads.filter(
      (l) => l.stage !== 'won' && l.stage !== 'lost'
    )

    const totalValue = this.calculateTotalValue(allLeads)
    const conversionRate = this.calculateConversionRate(wonLeads, lostLeads)
    const averageDaysToClose = this.calculateAverageDaysToClose(wonLeads)
    const leadsByStage = this.countLeadsByStage(allLeads)
    const qualificationScore = this.calculateAverageQualificationScore(activeLeads)

    return {
      totalLeads: allLeads.length,
      activeLeads: activeLeads.length,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length,
      totalValue,
      averageValue: allLeads.length > 0 ? totalValue / allLeads.length : 0,
      conversionRate,
      averageDaysToClose,
      leadsByStage,
      qualificationScore,
    }
  }

  /**
   * Calculate total estimated value of leads
   */
  private calculateTotalValue(leads: Lead[]): number {
    return leads.reduce((sum, lead) => sum + (lead.estimatedValue ?? 0), 0)
  }

  /**
   * Calculate conversion rate from closed leads
   */
  private calculateConversionRate(wonLeads: Lead[], lostLeads: Lead[]): number {
    const closedLeads = [...wonLeads, ...lostLeads]
    return closedLeads.length > 0 ? wonLeads.length / closedLeads.length : 0
  }

  /**
   * Calculate average days to close for won leads
   */
  private calculateAverageDaysToClose(wonLeads: Lead[]): number {
    const daysToClose = wonLeads
      .map((lead) => differenceInDays(lead.lastStageChange, lead.createdAt))
      .filter((days) => days >= 0)

    return daysToClose.length > 0
      ? daysToClose.reduce((sum, days) => sum + days, 0) / daysToClose.length
      : 0
  }

  /**
   * Count leads by stage
   */
  private countLeadsByStage(leads: Lead[]): Record<LeadStage, number> {
    const leadsByStage: Record<LeadStage, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    }

    leads.forEach((lead) => {
      leadsByStage[lead.stage]++
    })

    return leadsByStage
  }

  /**
   * Calculate average qualification score for active leads
   */
  private calculateAverageQualificationScore(activeLeads: Lead[]): number {
    const qualificationScores = activeLeads
      .map((lead) => lead.qualification.score)
      .filter((score) => score > 0)

    return qualificationScores.length > 0
      ? qualificationScores.reduce((sum, score) => sum + score, 0) / qualificationScores.length
      : 0
  }

  /**
   * Get qualified leads (score >= 50)
   */
  async getQualified(): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter(
        (lead) =>
          lead.qualification.score >= 50 &&
          lead.stage !== 'won' &&
          lead.stage !== 'lost'
      )
      .sort((a, b) => b.qualification.score - a.qualification.score)
  }

  /**
   * Get leads expiring soon (expected close date within 7 days)
   */
  async getExpiringSoon(): Promise<Lead[]> {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return Array.from(this.leads.values())
      .filter(
        (lead) =>
          lead.expectedCloseDate &&
          lead.stage !== 'won' &&
          lead.stage !== 'lost' &&
          lead.expectedCloseDate <= sevenDaysFromNow &&
          lead.expectedCloseDate >= now
      )
      .sort(
        (a, b) =>
          (a.expectedCloseDate?.getTime() ?? 0) -
          (b.expectedCloseDate?.getTime() ?? 0)
      )
  }

  /**
   * Clear all leads and history (useful for testing)
   */
  async clear(): Promise<void> {
    this.leads.clear()
    this.stageChanges.clear()
  }

  /**
   * Log a stage change
   */
  private async logStageChange(
    leadId: string,
    fromStage: LeadStage,
    toStage: LeadStage,
    notes?: string
  ): Promise<void> {
    const change: LeadStageChange = {
      id: uuidv4(),
      leadId,
      fromStage,
      toStage,
      changedAt: new Date(),
      notes,
    }

    const validated = LeadStageChangeSchema.parse(change)
    this.stageChanges.set(validated.id, validated)
  }
}

// Export singleton instance
export const leadService = new LeadService()
