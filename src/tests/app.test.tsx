import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCRMStore } from '@/store/crmStore'
import { Contacts } from '@/pages/Contacts'
import { ContactForm } from '@/components/ContactForm'
import { Dashboard } from '@/pages/Dashboard'
import { SettingsPage } from '@/pages/SettingsPage'
import { Pricing } from '@/pages/Pricing'

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

beforeEach(() => {
  useCRMStore.setState({ contacts: [], activities: [] })
})

// ── Utils ──────────────────────────────────────────────────────────────────
describe('formatRelative', () => {
  it('returns "just now" for recent dates', async () => {
    const { formatRelative } = await import('@/lib/utils')
    expect(formatRelative(new Date())).toBe('just now')
  })

  it('returns minutes ago', async () => {
    const { formatRelative } = await import('@/lib/utils')
    const d = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelative(d)).toBe('5m ago')
  })

  it('returns hours ago', async () => {
    const { formatRelative } = await import('@/lib/utils')
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelative(d)).toBe('3h ago')
  })
})

// ── Store ──────────────────────────────────────────────────────────────────
describe('CRM Store', () => {
  it('adds a contact', () => {
    const { addContact } = useCRMStore.getState()
    const c = addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    expect(useCRMStore.getState().contacts).toHaveLength(1)
    expect(c.firstName).toBe('Jane')
    expect(c.id).toBeTruthy()
  })

  it('updates a contact', () => {
    const { addContact, updateContact } = useCRMStore.getState()
    const c = addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    updateContact(c.id, { status: 'active' })
    expect(useCRMStore.getState().contacts[0].status).toBe('active')
  })

  it('deletes a contact', () => {
    const { addContact, deleteContact } = useCRMStore.getState()
    const c = addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    deleteContact(c.id)
    expect(useCRMStore.getState().contacts).toHaveLength(0)
  })

  it('deletes contact activities when contact is deleted', () => {
    const { addContact, addActivity, deleteContact } = useCRMStore.getState()
    const c = addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    addActivity({ contactId: c.id, type: 'note', title: 'Test note' })
    deleteContact(c.id)
    expect(useCRMStore.getState().activities).toHaveLength(0)
  })

  it('adds an activity', () => {
    const { addContact, addActivity, getContactActivities } = useCRMStore.getState()
    const c = addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    addActivity({ contactId: c.id, type: 'call', title: 'Follow-up call' })
    expect(getContactActivities(c.id)).toHaveLength(1)
  })

  it('filters activities by contact', () => {
    const { addContact, addActivity, getContactActivities } = useCRMStore.getState()
    const c1 = addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    const c2 = addContact({ firstName: 'Bob', lastName: 'Smith', status: 'active' })
    addActivity({ contactId: c1.id, type: 'note', title: 'Note for Jane' })
    addActivity({ contactId: c2.id, type: 'email', title: 'Email to Bob' })
    expect(getContactActivities(c1.id)).toHaveLength(1)
    expect(getContactActivities(c1.id)[0].title).toBe('Note for Jane')
  })
})

// ── ContactForm ────────────────────────────────────────────────────────────
describe('ContactForm', () => {
  it('renders form fields', () => {
    wrap(<ContactForm onClose={() => {}} />)
    expect(screen.getByTestId('input-firstName')).toBeInTheDocument()
    expect(screen.getByTestId('input-lastName')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-status')).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    wrap(<ContactForm onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => {
      expect(screen.getByText(/first name required/i)).toBeInTheDocument()
    })
  })

  it('adds a contact on valid submit', async () => {
    const onClose = vi.fn()
    wrap(<ContactForm onClose={onClose} />)
    fireEvent.change(screen.getByTestId('input-firstName'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByTestId('input-lastName'), { target: { value: 'Doe' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
      expect(useCRMStore.getState().contacts[0].firstName).toBe('Jane')
    })
  })

  it('pre-fills form when editing a contact', () => {
    const contact = useCRMStore.getState().addContact({
      firstName: 'Alice', lastName: 'Smith', status: 'active', email: 'alice@test.com',
    })
    wrap(<ContactForm contact={contact} onClose={() => {}} />)
    expect(screen.getByTestId('input-firstName')).toHaveValue('Alice')
    expect(screen.getByTestId('input-email')).toHaveValue('alice@test.com')
  })

  it('updates contact on edit submit', async () => {
    const contact = useCRMStore.getState().addContact({
      firstName: 'Alice', lastName: 'Smith', status: 'lead',
    })
    const onClose = vi.fn()
    wrap(<ContactForm contact={contact} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('input-firstName'), { target: { value: 'Alicia' } })
    fireEvent.click(screen.getByTestId('submit-btn'))
    await waitFor(() => {
      expect(useCRMStore.getState().contacts[0].firstName).toBe('Alicia')
      expect(onClose).toHaveBeenCalled()
    })
  })
})

// ── Contacts Page ──────────────────────────────────────────────────────────
describe('Contacts Page', () => {
  it('shows empty state when no contacts', () => {
    wrap(<Contacts />)
    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument()
  })

  it('renders contacts in table', () => {
    useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    useCRMStore.getState().addContact({ firstName: 'Bob', lastName: 'Smith', status: 'active' })
    wrap(<Contacts />)
    expect(screen.getAllByTestId('contact-row')).toHaveLength(2)
  })

  it('filters contacts by search', async () => {
    useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    useCRMStore.getState().addContact({ firstName: 'Bob', lastName: 'Smith', status: 'active' })
    wrap(<Contacts />)
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'jane' } })
    await waitFor(() => {
      expect(screen.getAllByTestId('contact-row')).toHaveLength(1)
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
  })

  it('filters contacts by status chip', async () => {
    useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    useCRMStore.getState().addContact({ firstName: 'Bob', lastName: 'Smith', status: 'active' })
    wrap(<Contacts />)
    fireEvent.click(screen.getByTestId('filter-active'))
    await waitFor(() => {
      expect(screen.getAllByTestId('contact-row')).toHaveLength(1)
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    })
  })

  it('opens add contact modal', async () => {
    wrap(<Contacts />)
    fireEvent.click(screen.getByTestId('add-contact-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('input-firstName')).toBeInTheDocument()
    })
  })

  it('deletes a contact', async () => {
    useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'lead' })
    wrap(<Contacts />)
    fireEvent.click(screen.getByTestId('delete-btn'))
    await waitFor(() => {
      expect(screen.queryByTestId('contact-row')).not.toBeInTheDocument()
    })
  })
})

// ── Dashboard ──────────────────────────────────────────────────────────────
describe('Dashboard', () => {
  it('shows zero stats when empty', () => {
    wrap(<Dashboard />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })

  it('shows correct contact count', () => {
    useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    useCRMStore.getState().addContact({ firstName: 'Bob', lastName: 'Smith', status: 'lead' })
    wrap(<Dashboard />)
    expect(screen.getByText('2')).toBeInTheDocument() // total
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1) // active=1, lead=1
  })
})

// ── Pricing ────────────────────────────────────────────────────────────────
describe('Pricing', () => {
  it('renders all three plans', () => {
    wrap(<Pricing />)
    expect(screen.getByTestId('plan-starter')).toBeInTheDocument()
    expect(screen.getByTestId('plan-professional')).toBeInTheDocument()
    expect(screen.getByTestId('plan-premium')).toBeInTheDocument()
  })

  it('shows Most Popular badge on Professional', () => {
    wrap(<Pricing />)
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })
})

// ── Settings ───────────────────────────────────────────────────────────────
describe('Settings', () => {
  it('renders toggle controls', () => {
    wrap(<SettingsPage />)
    expect(screen.getByTestId('toggle-notifications')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-dark-mode')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-email-digest')).toBeInTheDocument()
  })

  it('toggles a setting', async () => {
    wrap(<SettingsPage />)
    const toggle = screen.getByTestId('toggle-email-digest')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(toggle)
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
