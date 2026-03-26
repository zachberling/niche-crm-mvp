import { describe, it, expect, beforeEach } from 'vitest'
import { leadService } from './leadService'
import { CreateLead, LeadStage } from '@/types/lead'

describe('LeadService', () => {
  beforeEach(async () => {
    await leadService.clear()
  })

  describe('create', () => {
    it('creates a new lead with full data', async () => {
      const newLead: CreateLead = {
        contactId: '123e4567-e89b-12d3-a456-426614174000',
        stage: 'new',
        qualification: {
          hasUrgency: true,
          hasBudget: true,
          isDecisionMaker: true,
          hasTimeline: false,
          score: 75,
        },
        estimatedValue: 5000,
        expectedCloseDate: new Date('2024-12-31'),
        source: 'website',
        notes: 'AC replacement needed urgently',
      }

      const lead = await leadService.create(newLead)

      expect(lead.id).toBeDefined()
      expect(lead.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
      expect(lead.contactId).toBe(newLead.contactId)
      expect(lead.stage).toBe('new')
      expect(lead.qualification.hasUrgency).toBe(true)
      expect(lead.estimatedValue).toBe(5000)
      expect(lead.createdAt).toBeInstanceOf(Date)
      expect(lead.updatedAt).toBeInstanceOf(Date)
      expect(lead.lastStageChange).toBeInstanceOf(Date)
    })

    it('creates minimal lead with defaults', async () => {
      const minimalLead: CreateLead = {
        contactId: '123e4567-e89b-12d3-a456-426614174001',
        stage: 'new',
        qualification: {
          hasUrgency: false,
          hasBudget: false,
          isDecisionMaker: false,
          hasTimeline: false,
          score: 0,
        },
      }

      const lead = await leadService.create(minimalLead)

      expect(lead.id).toBeDefined()
      expect(lead.qualification.score).toBe(0)
      expect(lead.estimatedValue).toBeUndefined()
      expect(lead.lostReason).toBeUndefined()
    })

    it('logs initial stage change on creation', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174002',
        stage: 'contacted',
        qualification: {
          hasUrgency: false,
          hasBudget: false,
          isDecisionMaker: false,
          hasTimeline: false,
          score: 0,
        },
      })

      const history = await leadService.getStageHistory(lead.id)
      expect(history).toHaveLength(1)
      expect(history[0].fromStage).toBe('contacted')
      expect(history[0].toStage).toBe('contacted')
    })
  })

  describe('getById', () => {
    it('retrieves existing lead by ID', async () => {
      const created = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174003',
        stage: 'new',
        qualification: {
          hasUrgency: false,
          hasBudget: false,
          isDecisionMaker: false,
          hasTimeline: false,
          score: 0,
        },
      })

      const retrieved = await leadService.getById(created.id)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.id).toBe(created.id)
    })

    it('returns null for non-existent ID', async () => {
      const result = await leadService.getById('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('getByContactId', () => {
    it('retrieves lead by contact ID', async () => {
      const contactId = '123e4567-e89b-12d3-a456-426614174004'
      const created = await leadService.create({
        contactId,
        stage: 'new',
        qualification: {
          hasUrgency: false,
          hasBudget: false,
          isDecisionMaker: false,
          hasTimeline: false,
          score: 0,
        },
      })

      const retrieved = await leadService.getByContactId(contactId)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.contactId).toBe(contactId)
      expect(retrieved?.id).toBe(created.id)
    })

    it('returns null when no lead exists for contact', async () => {
      const result = await leadService.getByContactId('non-existent-contact')
      expect(result).toBeNull()
    })
  })

  describe('getAll', () => {
    it('returns empty array when no leads exist', async () => {
      const leads = await leadService.getAll()
      expect(leads).toEqual([])
    })

    it('returns all leads sorted by updated date', async () => {
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174005',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174006',
        stage: 'contacted',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const leads = await leadService.getAll()
      expect(leads).toHaveLength(2)
      // Most recently updated first
      expect(leads[0].stage).toBe('contacted')
    })
  })

  describe('getActive', () => {
    it('returns only active leads (not won or lost)', async () => {
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174007',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174008',
        stage: 'won',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174009',
        stage: 'lost',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const active = await leadService.getActive()
      expect(active).toHaveLength(1)
      expect(active[0].stage).toBe('new')
    })
  })

  describe('getByStage', () => {
    it('filters leads by specific stage', async () => {
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174010',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174011',
        stage: 'qualified',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174012',
        stage: 'qualified',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const qualified = await leadService.getByStage('qualified')
      expect(qualified).toHaveLength(2)
      expect(qualified.every((l) => l.stage === 'qualified')).toBe(true)
    })
  })

  describe('update', () => {
    it('updates lead fields', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174013',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        estimatedValue: 1000,
      })

      const updated = await leadService.update(lead.id, {
        estimatedValue: 2000,
        notes: 'Updated estimate after site visit',
      })

      expect(updated).not.toBeNull()
      expect(updated?.estimatedValue).toBe(2000)
      expect(updated?.notes).toBe('Updated estimate after site visit')
      expect(updated?.id).toBe(lead.id)
      expect(updated?.createdAt).toEqual(lead.createdAt)
    })

    it('returns null for non-existent lead', async () => {
      const result = await leadService.update('non-existent', {
        estimatedValue: 5000,
      })
      expect(result).toBeNull()
    })

    it('updates lastStageChange when stage changes', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174014',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const originalStageChange = lead.lastStageChange

      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = await leadService.update(lead.id, {
        stage: 'contacted',
      })

      expect(updated?.lastStageChange.getTime()).toBeGreaterThan(
        originalStageChange.getTime()
      )
    })
  })

  describe('updateStage', () => {
    it('changes lead stage and logs change', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174015',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const updated = await leadService.updateStage(
        lead.id,
        'contacted',
        'Made initial call'
      )

      expect(updated?.stage).toBe('contacted')

      const history = await leadService.getStageHistory(lead.id)
      expect(history).toHaveLength(2) // Initial + this change
      expect(history[1].fromStage).toBe('new')
      expect(history[1].toStage).toBe('contacted')
      expect(history[1].notes).toBe('Made initial call')
    })

    it('does not update if stage is the same', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174016',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const result = await leadService.updateStage(lead.id, 'new')
      expect(result?.id).toBe(lead.id)

      const history = await leadService.getStageHistory(lead.id)
      expect(history).toHaveLength(1) // Only initial
    })

    it('clears lost reason when moving out of lost stage', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174017',
        stage: 'lost',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        lostReason: 'Price too high',
      })

      const updated = await leadService.updateStage(lead.id, 'contacted')
      expect(updated?.lostReason).toBeUndefined()
    })
  })

  describe('updateQualification', () => {
    it('updates qualification criteria', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174018',
        stage: 'new',
        qualification: {
          hasUrgency: false,
          hasBudget: false,
          isDecisionMaker: false,
          hasTimeline: false,
          score: 0,
        },
      })

      const updated = await leadService.updateQualification(lead.id, {
        hasUrgency: true,
        hasBudget: true,
      })

      expect(updated?.qualification.hasUrgency).toBe(true)
      expect(updated?.qualification.hasBudget).toBe(true)
    })

    it('auto-calculates score based on criteria', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174019',
        stage: 'new',
        qualification: {
          hasUrgency: false,
          hasBudget: false,
          isDecisionMaker: false,
          hasTimeline: false,
          score: 0,
        },
      })

      // 2 criteria = 50 score
      let updated = await leadService.updateQualification(lead.id, {
        hasUrgency: true,
        hasBudget: true,
      })
      expect(updated?.qualification.score).toBe(50)

      // 4 criteria = 100 score
      updated = await leadService.updateQualification(lead.id, {
        isDecisionMaker: true,
        hasTimeline: true,
      })
      expect(updated?.qualification.score).toBe(100)
    })
  })

  describe('markWon', () => {
    it('marks lead as won', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174020',
        stage: 'negotiation',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const won = await leadService.markWon(lead.id, 'Deal closed!')
      expect(won?.stage).toBe('won')

      const history = await leadService.getStageHistory(lead.id)
      const lastChange = history[history.length - 1]
      expect(lastChange.toStage).toBe('won')
      expect(lastChange.notes).toBe('Deal closed!')
    })
  })

  describe('markLost', () => {
    it('marks lead as lost with reason', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174021',
        stage: 'proposal',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      const lost = await leadService.markLost(
        lead.id,
        'Price too high',
        'Lost to competitor'
      )

      expect(lost?.stage).toBe('lost')
      expect(lost?.lostReason).toBe('Price too high')

      const history = await leadService.getStageHistory(lead.id)
      const lastChange = history[history.length - 1]
      expect(lastChange.toStage).toBe('lost')
    })
  })

  describe('delete', () => {
    it('deletes lead and stage history', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174022',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      await leadService.updateStage(lead.id, 'contacted')

      const deleted = await leadService.delete(lead.id)
      expect(deleted).toBe(true)

      const retrieved = await leadService.getById(lead.id)
      expect(retrieved).toBeNull()

      const history = await leadService.getStageHistory(lead.id)
      expect(history).toHaveLength(0)
    })
  })

  describe('getMetrics', () => {
    it('calculates pipeline metrics correctly', async () => {
      // Create diverse leads
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174023',
        stage: 'new',
        qualification: { hasUrgency: true, hasBudget: true, isDecisionMaker: false, hasTimeline: false, score: 50 },
        estimatedValue: 1000,
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174024',
        stage: 'qualified',
        qualification: { hasUrgency: true, hasBudget: true, isDecisionMaker: true, hasTimeline: true, score: 100 },
        estimatedValue: 2000,
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174025',
        stage: 'won',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        estimatedValue: 3000,
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174026',
        stage: 'lost',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        lostReason: 'Price too high',
      })

      const metrics = await leadService.getMetrics()

      expect(metrics.totalLeads).toBe(4)
      expect(metrics.activeLeads).toBe(2)
      expect(metrics.wonLeads).toBe(1)
      expect(metrics.lostLeads).toBe(1)
      expect(metrics.totalValue).toBe(6000)
      expect(metrics.averageValue).toBe(1500)
      expect(metrics.conversionRate).toBe(0.5) // 1 won / 2 closed
      expect(metrics.leadsByStage.new).toBe(1)
      expect(metrics.leadsByStage.qualified).toBe(1)
      expect(metrics.leadsByStage.won).toBe(1)
      expect(metrics.leadsByStage.lost).toBe(1)
      expect(metrics.qualificationScore).toBe(75) // Average of 50 and 100
    })

    it('handles empty pipeline', async () => {
      const metrics = await leadService.getMetrics()

      expect(metrics.totalLeads).toBe(0)
      expect(metrics.activeLeads).toBe(0)
      expect(metrics.conversionRate).toBe(0)
      expect(metrics.averageDaysToClose).toBe(0)
      expect(metrics.qualificationScore).toBe(0)
    })
  })

  describe('getQualified', () => {
    it('returns leads with score >= 50', async () => {
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174027',
        stage: 'new',
        qualification: { hasUrgency: true, hasBudget: true, isDecisionMaker: false, hasTimeline: false, score: 50 },
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174028',
        stage: 'contacted',
        qualification: { hasUrgency: true, hasBudget: true, isDecisionMaker: true, hasTimeline: true, score: 100 },
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174029',
        stage: 'new',
        qualification: { hasUrgency: true, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 25 },
      })

      const qualified = await leadService.getQualified()
      expect(qualified).toHaveLength(2)
      expect(qualified.every((l) => l.qualification.score >= 50)).toBe(true)
      // Sorted by score descending
      expect(qualified[0].qualification.score).toBeGreaterThanOrEqual(
        qualified[1].qualification.score
      )
    })

    it('excludes won and lost leads', async () => {
      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174030',
        stage: 'won',
        qualification: { hasUrgency: true, hasBudget: true, isDecisionMaker: false, hasTimeline: false, score: 50 },
      })

      const qualified = await leadService.getQualified()
      expect(qualified).toHaveLength(0)
    })
  })

  describe('getExpiringSoon', () => {
    it('returns leads with close date within 7 days', async () => {
      const now = new Date()
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174031',
        stage: 'proposal',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        expectedCloseDate: threeDaysFromNow,
      })

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174032',
        stage: 'negotiation',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        expectedCloseDate: tenDaysFromNow,
      })

      const expiring = await leadService.getExpiringSoon()
      expect(expiring).toHaveLength(1)
      expect(expiring[0].expectedCloseDate).toEqual(threeDaysFromNow)
    })

    it('excludes won and lost leads', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174033',
        stage: 'won',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
        expectedCloseDate: tomorrow,
      })

      const expiring = await leadService.getExpiringSoon()
      expect(expiring).toHaveLength(0)
    })
  })

  describe('getStageHistory', () => {
    it('tracks all stage changes chronologically', async () => {
      const lead = await leadService.create({
        contactId: '123e4567-e89b-12d3-a456-426614174034',
        stage: 'new',
        qualification: { hasUrgency: false, hasBudget: false, isDecisionMaker: false, hasTimeline: false, score: 0 },
      })

      await leadService.updateStage(lead.id, 'contacted')
      await leadService.updateStage(lead.id, 'qualified')
      await leadService.updateStage(lead.id, 'proposal')

      const history = await leadService.getStageHistory(lead.id)
      expect(history).toHaveLength(4)

      expect(history[0].toStage).toBe('new')
      expect(history[1].fromStage).toBe('new')
      expect(history[1].toStage).toBe('contacted')
      expect(history[2].fromStage).toBe('contacted')
      expect(history[2].toStage).toBe('qualified')
      expect(history[3].fromStage).toBe('qualified')
      expect(history[3].toStage).toBe('proposal')
    })
  })
})
