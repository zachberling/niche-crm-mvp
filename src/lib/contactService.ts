import { Contact, CreateContact, ContactSchema } from '@/types/contact'
import { v4 as uuidv4 } from 'uuid'

/**
 * In-memory contact storage for MVP
 * In production, this would be replaced with a database layer
 */
class ContactService {
  private contacts: Map<string, Contact> = new Map()

  /**
   * Create a new contact
   */
  async create(data: CreateContact): Promise<Contact> {
    const now = new Date()
    const contact: Contact = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    // Validate with Zod schema
    const validated = ContactSchema.parse(contact)
    
    this.contacts.set(validated.id, validated)
    return validated
  }

  /**
   * Get a contact by ID
   */
  async getById(id: string): Promise<Contact | null> {
    const contact = this.contacts.get(id)
    return contact || null
  }

  /**
   * Get all contacts
   */
  async getAll(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  /**
   * Update a contact
   */
  async update(id: string, data: Partial<CreateContact>): Promise<Contact | null> {
    const existing = this.contacts.get(id)
    if (!existing) {
      return null
    }

    const updated: Contact = {
      ...existing,
      ...data,
      id: existing.id, // Prevent ID change
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date(),
    }

    // Validate updated contact
    const validated = ContactSchema.parse(updated)
    
    this.contacts.set(id, validated)
    return validated
  }

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<boolean> {
    return this.contacts.delete(id)
  }

  /**
   * Search contacts by name, email, company, or phone
   */
  async search(query: string): Promise<Contact[]> {
    const lowercaseQuery = query.toLowerCase().trim()
    
    if (!lowercaseQuery) {
      return this.getAll()
    }

    const results = Array.from(this.contacts.values()).filter(contact => {
      const searchFields = [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.company,
        contact.phone,
      ].filter(Boolean).map(field => field!.toLowerCase())

      return searchFields.some(field => field.includes(lowercaseQuery))
    })

    return results.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  /**
   * Filter contacts by status
   */
  async filterByStatus(status: Contact['status']): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Get contact count by status
   */
  async getStatusCounts(): Promise<Record<Contact['status'], number>> {
    const contacts = Array.from(this.contacts.values())
    
    return {
      lead: contacts.filter(c => c.status === 'lead').length,
      active: contacts.filter(c => c.status === 'active').length,
      inactive: contacts.filter(c => c.status === 'inactive').length,
    }
  }

  /**
   * Clear all contacts (useful for testing)
   */
  async clear(): Promise<void> {
    this.contacts.clear()
  }

  /**
   * Get total contact count
   */
  async count(): Promise<number> {
    return this.contacts.size
  }
}

// Export singleton instance
export const contactService = new ContactService()
