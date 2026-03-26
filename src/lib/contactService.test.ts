import { describe, it, expect, beforeEach } from 'vitest'
import { contactService } from './contactService'
import { CreateContact } from '@/types/contact'

describe('ContactService', () => {
  beforeEach(async () => {
    // Clear all contacts before each test
    await contactService.clear()
  })

  describe('create', () => {
    it('creates a new contact with valid data', async () => {
      const newContact: CreateContact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        company: 'HVAC Masters',
        status: 'lead',
        source: 'website',
        notes: 'Needs AC repair',
      }

      const contact = await contactService.create(newContact)

      expect(contact.id).toBeDefined()
      expect(contact.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      expect(contact.firstName).toBe('John')
      expect(contact.lastName).toBe('Doe')
      expect(contact.email).toBe('john@example.com')
      expect(contact.status).toBe('lead')
      expect(contact.createdAt).toBeInstanceOf(Date)
      expect(contact.updatedAt).toBeInstanceOf(Date)
    })

    it('creates minimal contact with only required fields', async () => {
      const minimalContact: CreateContact = {
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'active',
      }

      const contact = await contactService.create(minimalContact)

      expect(contact.id).toBeDefined()
      expect(contact.firstName).toBe('Jane')
      expect(contact.lastName).toBe('Smith')
      expect(contact.status).toBe('active')
      expect(contact.email).toBeUndefined()
      expect(contact.phone).toBeUndefined()
    })

    it('throws error for invalid email', async () => {
      const invalidContact: CreateContact = {
        firstName: 'Bad',
        lastName: 'Email',
        email: 'not-an-email',
        status: 'lead',
      }

      await expect(contactService.create(invalidContact)).rejects.toThrow()
    })

    it('throws error for empty first name', async () => {
      const invalidContact: CreateContact = {
        firstName: '',
        lastName: 'Doe',
        status: 'lead',
      }

      await expect(contactService.create(invalidContact)).rejects.toThrow()
    })
  })

  describe('getById', () => {
    it('retrieves an existing contact by ID', async () => {
      const created = await contactService.create({
        firstName: 'Test',
        lastName: 'User',
        status: 'lead',
      })

      const retrieved = await contactService.getById(created.id)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.firstName).toBe('Test')
    })

    it('returns null for non-existent ID', async () => {
      const result = await contactService.getById('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('getAll', () => {
    it('returns empty array when no contacts exist', async () => {
      const contacts = await contactService.getAll()
      expect(contacts).toEqual([])
    })

    it('returns all contacts sorted by creation date (newest first)', async () => {
      const contact1 = await contactService.create({
        firstName: 'First',
        lastName: 'Contact',
        status: 'lead',
      })

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))

      const contact2 = await contactService.create({
        firstName: 'Second',
        lastName: 'Contact',
        status: 'active',
      })

      const contacts = await contactService.getAll()

      expect(contacts).toHaveLength(2)
      expect(contacts[0].id).toBe(contact2.id) // Newest first
      expect(contacts[1].id).toBe(contact1.id)
    })
  })

  describe('update', () => {
    it('updates an existing contact', async () => {
      const created = await contactService.create({
        firstName: 'Original',
        lastName: 'Name',
        status: 'lead',
      })

      const updated = await contactService.update(created.id, {
        firstName: 'Updated',
        status: 'active',
      })

      expect(updated).not.toBeNull()
      expect(updated?.firstName).toBe('Updated')
      expect(updated?.lastName).toBe('Name') // Unchanged
      expect(updated?.status).toBe('active')
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime())
    })

    it('preserves ID and createdAt when updating', async () => {
      const created = await contactService.create({
        firstName: 'Test',
        lastName: 'User',
        status: 'lead',
      })

      const updated = await contactService.update(created.id, {
        firstName: 'NewName',
      })

      expect(updated?.id).toBe(created.id)
      expect(updated?.createdAt.getTime()).toBe(created.createdAt.getTime())
    })

    it('returns null for non-existent contact', async () => {
      const result = await contactService.update('non-existent', {
        firstName: 'Fail',
      })

      expect(result).toBeNull()
    })

    it('validates updated data', async () => {
      const created = await contactService.create({
        firstName: 'Test',
        lastName: 'User',
        status: 'lead',
      })

      await expect(
        contactService.update(created.id, {
          email: 'invalid-email',
        })
      ).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('deletes an existing contact', async () => {
      const created = await contactService.create({
        firstName: 'Delete',
        lastName: 'Me',
        status: 'lead',
      })

      const deleted = await contactService.delete(created.id)
      expect(deleted).toBe(true)

      const retrieved = await contactService.getById(created.id)
      expect(retrieved).toBeNull()
    })

    it('returns false for non-existent contact', async () => {
      const deleted = await contactService.delete('non-existent')
      expect(deleted).toBe(false)
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      await contactService.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@hvac.com',
        company: 'Cool Air HVAC',
        status: 'lead',
      })

      await contactService.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@repair.com',
        phone: '555-9999',
        status: 'active',
      })

      await contactService.create({
        firstName: 'Bob',
        lastName: 'Johnson',
        company: 'Johnson Heating',
        status: 'inactive',
      })
    })

    it('searches by first name', async () => {
      const results = await contactService.search('john')
      expect(results).toHaveLength(2) // John Doe and Bob Johnson
      expect(results.some(c => c.firstName === 'John')).toBe(true)
      expect(results.some(c => c.lastName === 'Johnson')).toBe(true)
    })

    it('searches by last name', async () => {
      const results = await contactService.search('smith')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Jane')
    })

    it('searches by email', async () => {
      const results = await contactService.search('hvac.com')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('John')
    })

    it('searches by company', async () => {
      const results = await contactService.search('heating')
      expect(results).toHaveLength(1)
      expect(results[0].lastName).toBe('Johnson')
    })

    it('searches by phone', async () => {
      const results = await contactService.search('555-9999')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Jane')
    })

    it('is case-insensitive', async () => {
      const results = await contactService.search('JANE')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Jane')
    })

    it('returns all contacts for empty query', async () => {
      const results = await contactService.search('')
      expect(results).toHaveLength(3)
    })

    it('returns empty array for no matches', async () => {
      const results = await contactService.search('nonexistent')
      expect(results).toHaveLength(0)
    })
  })

  describe('filterByStatus', () => {
    beforeEach(async () => {
      await contactService.create({ firstName: 'Lead', lastName: '1', status: 'lead' })
      await contactService.create({ firstName: 'Lead', lastName: '2', status: 'lead' })
      await contactService.create({ firstName: 'Active', lastName: '1', status: 'active' })
      await contactService.create({ firstName: 'Inactive', lastName: '1', status: 'inactive' })
    })

    it('filters contacts by lead status', async () => {
      const results = await contactService.filterByStatus('lead')
      expect(results).toHaveLength(2)
      expect(results.every(c => c.status === 'lead')).toBe(true)
    })

    it('filters contacts by active status', async () => {
      const results = await contactService.filterByStatus('active')
      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('active')
    })

    it('filters contacts by inactive status', async () => {
      const results = await contactService.filterByStatus('inactive')
      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('inactive')
    })
  })

  describe('getStatusCounts', () => {
    it('returns zero counts when no contacts exist', async () => {
      const counts = await contactService.getStatusCounts()
      expect(counts).toEqual({ lead: 0, active: 0, inactive: 0 })
    })

    it('returns accurate counts for each status', async () => {
      await contactService.create({ firstName: 'L1', lastName: 'Test', status: 'lead' })
      await contactService.create({ firstName: 'L2', lastName: 'Test', status: 'lead' })
      await contactService.create({ firstName: 'A1', lastName: 'Test', status: 'active' })
      await contactService.create({ firstName: 'I1', lastName: 'Test', status: 'inactive' })
      await contactService.create({ firstName: 'I2', lastName: 'Test', status: 'inactive' })
      await contactService.create({ firstName: 'I3', lastName: 'Test', status: 'inactive' })

      const counts = await contactService.getStatusCounts()
      expect(counts).toEqual({ lead: 2, active: 1, inactive: 3 })
    })
  })

  describe('count', () => {
    it('returns 0 when no contacts exist', async () => {
      const count = await contactService.count()
      expect(count).toBe(0)
    })

    it('returns correct total count', async () => {
      await contactService.create({ firstName: 'A', lastName: 'Test', status: 'lead' })
      await contactService.create({ firstName: 'B', lastName: 'Test', status: 'active' })
      await contactService.create({ firstName: 'C', lastName: 'Test', status: 'inactive' })

      const count = await contactService.count()
      expect(count).toBe(3)
    })

    it('updates count after deletion', async () => {
      const contact = await contactService.create({ 
        firstName: 'Test', 
        lastName: 'User', 
        status: 'lead' 
      })
      
      expect(await contactService.count()).toBe(1)
      
      await contactService.delete(contact.id)
      expect(await contactService.count()).toBe(0)
    })
  })

  describe('clear', () => {
    it('removes all contacts', async () => {
      await contactService.create({ firstName: 'A', lastName: 'Test', status: 'lead' })
      await contactService.create({ firstName: 'B', lastName: 'Test', status: 'active' })
      
      expect(await contactService.count()).toBe(2)
      
      await contactService.clear()
      
      expect(await contactService.count()).toBe(0)
      expect(await contactService.getAll()).toEqual([])
    })
  })
})
