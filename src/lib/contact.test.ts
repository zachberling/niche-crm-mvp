import { describe, it, expect } from 'vitest'
import { ContactSchema, CreateContactSchema } from '@/types/contact'

describe('Contact Schema', () => {
  it('validates a complete contact object', () => {
    const validContact = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Inc',
      status: 'lead' as const,
      source: 'website',
      notes: 'Interested in premium plan',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = ContactSchema.safeParse(validContact)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const invalidContact = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email',
      status: 'lead' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = ContactSchema.safeParse(invalidContact)
    expect(result.success).toBe(false)
  })

  it('requires first and last name', () => {
    const noName = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: '',
      lastName: '',
      status: 'lead' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = ContactSchema.safeParse(noName)
    expect(result.success).toBe(false)
  })
})

describe('CreateContact Schema', () => {
  it('validates contact creation without id and timestamps', () => {
    const newContact = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      status: 'lead' as const,
    }

    const result = CreateContactSchema.safeParse(newContact)
    expect(result.success).toBe(true)
  })
})
