import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContactList } from './ContactList'
import { Contact } from '@/types/contact'

const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-0100',
    company: 'ACME HVAC',
    status: 'lead',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('ContactList', () => {
  it('renders empty state when no contacts', () => {
    render(<ContactList contacts={[]} />)
    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument()
  })

  it('renders list of contacts', () => {
    render(<ContactList contacts={mockContacts} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays contact details', () => {
    render(<ContactList contacts={mockContacts} />)
    expect(screen.getByText('ACME HVAC')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('555-0100')).toBeInTheDocument()
  })

  it('calls onContactClick when contact is clicked', () => {
    const handleClick = vi.fn()
    render(<ContactList contacts={mockContacts} onContactClick={handleClick} />)
    
    fireEvent.click(screen.getByText('John Doe'))
    expect(handleClick).toHaveBeenCalledWith(mockContacts[0])
  })

  it('displays status badges', () => {
    render(<ContactList contacts={mockContacts} />)
    expect(screen.getByText('lead')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })
})
