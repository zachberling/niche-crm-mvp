import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContactDetail } from './ContactDetail'
import { useCRMStore } from '@/store/crmStore'
import { Contact } from '@/types/contact'
import { Activity, ActivityType } from '@/types/activity'

// Mock the store
vi.mock('@/store/crmStore', () => ({
  useCRMStore: vi.fn(),
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  formatRelative: (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  },
}))

describe('ContactDetail', () => {
  const mockContact: Contact = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    company: 'Acme Corp',
    status: 'lead',
    notes: 'Test notes',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  const mockActivities: Activity[] = [
    {
      id: '1',
      contactId: '1',
      type: 'call' as ActivityType,
      title: 'Called about quote',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '2',
      contactId: '1',
      type: 'email' as ActivityType,
      title: 'Sent proposal',
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    },
  ]

  const mockDeleteContact = vi.fn()
  const mockAddActivity = vi.fn()
  const mockGetContactActivities = vi.fn()
  const mockOnClose = vi.fn()
  const mockOnEdit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetContactActivities.mockReturnValue(mockActivities)
    vi.mocked(useCRMStore).mockReturnValue({
      deleteContact: mockDeleteContact,
      addActivity: mockAddActivity,
      getContactActivities: mockGetContactActivities,
    } as any)
  })

  describe('Rendering', () => {
    it('should render contact detail panel', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByTestId('contact-detail')).toBeInTheDocument()
    })

    it('should display contact name and initials', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should display contact status badge', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const badge = screen.getByText('lead')
      expect(badge).toHaveClass('badge-lead')
    })

    it('should display email when present', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should display phone when present', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('555-1234')).toBeInTheDocument()
      expect(screen.getByText('Phone')).toBeInTheDocument()
    })

    it('should display company when present', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      // Company appears in header and in contact info section
      expect(screen.getAllByText('Acme Corp')).toHaveLength(2)
      expect(screen.getByText('Company')).toBeInTheDocument()
    })

    it('should display notes when present', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('Test notes')).toBeInTheDocument()
    })

    it('should not display email section when email is missing', () => {
      const contactWithoutEmail = { ...mockContact, email: undefined }
      render(
        <ContactDetail contact={contactWithoutEmail} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.queryByText('Email')).not.toBeInTheDocument()
    })

    it('should not display phone section when phone is missing', () => {
      const contactWithoutPhone = { ...mockContact, phone: undefined }
      render(
        <ContactDetail contact={contactWithoutPhone} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.queryByText('Phone')).not.toBeInTheDocument()
    })

    it('should not display company section when company is missing', () => {
      const contactWithoutCompany = { ...mockContact, company: undefined }
      render(
        <ContactDetail contact={contactWithoutCompany} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.queryByText('Company')).not.toBeInTheDocument()
    })

    it('should not display notes section when notes are missing', () => {
      const contactWithoutNotes = { ...mockContact, notes: undefined }
      render(
        <ContactDetail contact={contactWithoutNotes} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.queryByText('Notes')).not.toBeInTheDocument()
    })
  })

  describe('Activity Display', () => {
    it('should display all activities', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('Called about quote')).toBeInTheDocument()
      expect(screen.getByText('Sent proposal')).toBeInTheDocument()
    })

    it('should display activity count', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText(/Activity \(2\)/)).toBeInTheDocument()
    })

    it('should display empty state when no activities', () => {
      mockGetContactActivities.mockReturnValue([])
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('No activity logged yet.')).toBeInTheDocument()
      expect(screen.getByText(/Activity \(0\)/)).toBeInTheDocument()
    })

    it('should display activity with correct emoji for each type', () => {
      const activities: Activity[] = [
        { id: '1', contactId: '1', type: 'call', title: 'Call', createdAt: new Date() },
        { id: '2', contactId: '1', type: 'email', title: 'Email', createdAt: new Date() },
        { id: '3', contactId: '1', type: 'meeting', title: 'Meeting', createdAt: new Date() },
        { id: '4', contactId: '1', type: 'note', title: 'Note', createdAt: new Date() },
        { id: '5', contactId: '1', type: 'task', title: 'Task', createdAt: new Date() },
      ]
      mockGetContactActivities.mockReturnValue(activities)
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('📞')).toBeInTheDocument()
      expect(screen.getByText('✉️')).toBeInTheDocument()
      expect(screen.getByText('🤝')).toBeInTheDocument()
      expect(screen.getByText('📝')).toBeInTheDocument()
      expect(screen.getByText('✅')).toBeInTheDocument()
    })

    it('should display relative time for activities', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('1h ago')).toBeInTheDocument()
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })
  })

  describe('Activity Logging', () => {
    it('should render all activity type buttons', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByRole('button', { name: /📞 Call/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /✉️ Email/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🤝 Meeting/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /📝 Note/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /✅ Task/ })).toBeInTheDocument()
    })

    it('should have "note" as default activity type', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const noteButton = screen.getByRole('button', { name: /📝 Note/ })
      expect(noteButton).toHaveClass('active')
    })

    it('should change activity type when clicking type button', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const callButton = screen.getByRole('button', { name: /📞 Call/ })
      fireEvent.click(callButton)
      expect(callButton).toHaveClass('active')
    })

    it('should update placeholder text based on selected activity type', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const input = screen.getByTestId('activity-input')
      expect(input).toHaveAttribute('placeholder', 'Add note note…')

      const callButton = screen.getByRole('button', { name: /📞 Call/ })
      fireEvent.click(callButton)
      expect(input).toHaveAttribute('placeholder', 'Add call note…')
    })

    it('should add activity when form is submitted with text', async () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const input = screen.getByTestId('activity-input')
      const submitButton = screen.getByTestId('log-activity-btn')

      fireEvent.change(input, { target: { value: 'New activity' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddActivity).toHaveBeenCalledWith({
          contactId: '1',
          type: 'note',
          title: 'New activity',
        })
      })
    })

    it('should clear input after successful submission', async () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const input = screen.getByTestId('activity-input') as HTMLInputElement
      const submitButton = screen.getByTestId('log-activity-btn')

      fireEvent.change(input, { target: { value: 'New activity' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should not add activity when input is empty', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const submitButton = screen.getByTestId('log-activity-btn')
      fireEvent.click(submitButton)
      expect(mockAddActivity).not.toHaveBeenCalled()
    })

    it('should not add activity when input contains only whitespace', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const input = screen.getByTestId('activity-input')
      const submitButton = screen.getByTestId('log-activity-btn')

      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.click(submitButton)
      expect(mockAddActivity).not.toHaveBeenCalled()
    })

    it('should trim whitespace from activity title', async () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const input = screen.getByTestId('activity-input')
      const submitButton = screen.getByTestId('log-activity-btn')

      fireEvent.change(input, { target: { value: '  New activity  ' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddActivity).toHaveBeenCalledWith({
          contactId: '1',
          type: 'note',
          title: 'New activity',
        })
      })
    })

    it('should submit form on Enter key', async () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const input = screen.getByTestId('activity-input')

      fireEvent.change(input, { target: { value: 'New activity' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(mockAddActivity).toHaveBeenCalledWith({
          contactId: '1',
          type: 'note',
          title: 'New activity',
        })
      })
    })

    it('should add activity with correct type when type is changed', async () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const callButton = screen.getByRole('button', { name: /📞 Call/ })
      const input = screen.getByTestId('activity-input')
      const submitButton = screen.getByTestId('log-activity-btn')

      fireEvent.click(callButton)
      fireEvent.change(input, { target: { value: 'Called customer' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddActivity).toHaveBeenCalledWith({
          contactId: '1',
          type: 'call',
          title: 'Called customer',
        })
      })
    })
  })

  describe('Action Buttons', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      // Find the last button in header which is the close button (X icon)
      const buttons = screen.getAllByRole('button')
      const headerButtons = buttons.slice(0, 3) // First 3 buttons are in header (Edit, Delete, Close)
      const closeButton = headerButtons[2] // Close is the third button
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onEdit when edit button is clicked', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const editButton = screen.getByTitle('Edit')
      fireEvent.click(editButton)
      expect(mockOnEdit).toHaveBeenCalled()
    })

    it('should delete contact and close panel when delete button is clicked', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      const deleteButton = screen.getByTitle('Delete')
      fireEvent.click(deleteButton)
      expect(mockDeleteContact).toHaveBeenCalledWith('1')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle contact with minimal data', () => {
      const minimalContact: Contact = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      render(
        <ContactDetail contact={minimalContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.queryByText('Email')).not.toBeInTheDocument()
      expect(screen.queryByText('Phone')).not.toBeInTheDocument()
    })

    it('should handle very long names', () => {
      const longNameContact = {
        ...mockContact,
        firstName: 'Verylongfirstname',
        lastName: 'Verylonglastname',
      }
      render(
        <ContactDetail contact={longNameContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('Verylongfirstname Verylonglastname')).toBeInTheDocument()
      expect(screen.getByText('VV')).toBeInTheDocument()
    })

    it('should handle all different status types', () => {
      const statuses: Array<Contact['status']> = ['lead', 'customer', 'inactive']
      statuses.forEach((status) => {
        const { rerender } = render(
          <ContactDetail contact={{ ...mockContact, status }} onClose={mockOnClose} onEdit={mockOnEdit} />
        )
        const badge = screen.getByText(status)
        expect(badge).toHaveClass(`badge-${status}`)
        rerender(<div />)
      })
    })

    it('should call getContactActivities with correct contact ID', () => {
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(mockGetContactActivities).toHaveBeenCalledWith('1')
    })

    it('should handle activity with unknown type gracefully', () => {
      const activitiesWithUnknown: Activity[] = [
        {
          id: '1',
          contactId: '1',
          type: 'unknown' as ActivityType,
          title: 'Unknown activity',
          createdAt: new Date(),
        },
      ]
      mockGetContactActivities.mockReturnValue(activitiesWithUnknown)
      render(
        <ContactDetail contact={mockContact} onClose={mockOnClose} onEdit={mockOnEdit} />
      )
      expect(screen.getByText('Unknown activity')).toBeInTheDocument()
      expect(screen.getByText('•')).toBeInTheDocument() // Fallback emoji
    })
  })
})
