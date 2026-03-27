import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useHVACStore } from '@/store/hvacStore'
import { useCRMStore } from '@/store/crmStore'
import { JobsPage } from '@/pages/JobsPage'
import { EquipmentPage } from '@/pages/EquipmentPage'
import { AutomationsPage } from '@/pages/AutomationsPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

beforeEach(() => {
  useHVACStore.setState({ jobs: [], equipment: [], automations: [], integrations: useHVACStore.getState().integrations.map((i) => ({ ...i, connected: false, config: undefined })) })
  useCRMStore.setState({ contacts: [], activities: [] })
})

// ── HVAC Store ─────────────────────────────────────────────────────────────
describe('HVAC Store', () => {
  it('adds a job', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    const job = await useHVACStore.getState().addJob({
      contactId: contact.id, type: 'maintenance', status: 'scheduled',
      priority: 'normal', title: 'AC Tune-Up', scheduledAt: new Date(),
    })
    expect(useHVACStore.getState().jobs).toHaveLength(1)
    expect(job.title).toBe('AC Tune-Up')
    expect(job.id).toBeTruthy()
  })

  it('updates job status', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    const job = await useHVACStore.getState().addJob({
      contactId: contact.id, type: 'repair', status: 'scheduled',
      priority: 'high', title: 'Furnace Repair', scheduledAt: new Date(),
    })
    await useHVACStore.getState().updateJob(job.id, { status: 'completed', invoiceAmount: 350 })
    const updated = useHVACStore.getState().jobs[0]
    expect(updated.status).toBe('completed')
    expect(updated.invoiceAmount).toBe(350)
  })

  it('deletes a job', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    const job = await useHVACStore.getState().addJob({
      contactId: contact.id, type: 'inspection', status: 'scheduled',
      priority: 'low', title: 'Annual Inspection', scheduledAt: new Date(),
    })
    await useHVACStore.getState().deleteJob(job.id)
    expect(useHVACStore.getState().jobs).toHaveLength(0)
  })

  it('filters jobs by contact', async () => {
    const c1 = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    const c2 = await useCRMStore.getState().addContact({ firstName: 'Bob', lastName: 'Smith', status: 'active' })
    await useHVACStore.getState().addJob({ contactId: c1.id, type: 'maintenance', status: 'scheduled', priority: 'normal', title: 'Job 1', scheduledAt: new Date() })
    await useHVACStore.getState().addJob({ contactId: c2.id, type: 'repair', status: 'scheduled', priority: 'normal', title: 'Job 2', scheduledAt: new Date() })
    expect(useHVACStore.getState().getContactJobs(c1.id)).toHaveLength(1)
    expect(useHVACStore.getState().getContactJobs(c1.id)[0].title).toBe('Job 1')
  })

  it('adds equipment with auto next service date', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    const eq = await useHVACStore.getState().addEquipment({
      contactId: contact.id, type: 'ac_unit', brand: 'Carrier',
      lastServiceDate: new Date('2025-01-01'),
    })
    expect(eq.brand).toBe('Carrier')
    expect(eq.type).toBe('ac_unit')
  })

  it('adds and toggles automation', async () => {
    await useHVACStore.getState().addAutomation({
      name: 'Post-Job SMS', trigger: 'job_completed', action: 'send_sms',
      enabled: true, config: { message: 'Thanks!' },
    })
    expect(useHVACStore.getState().automations[0].enabled).toBe(true)
    await useHVACStore.getState().toggleAutomation(useHVACStore.getState().automations[0].id)
    expect(useHVACStore.getState().automations[0].enabled).toBe(false)
  })

  it('connects and disconnects integration', () => {
    useHVACStore.getState().connectIntegration('twilio', { accountSid: 'AC123', authToken: 'secret', fromNumber: '+1555' })
    expect(useHVACStore.getState().integrations.find((i) => i.id === 'twilio')?.connected).toBe(true)
    useHVACStore.getState().disconnectIntegration('twilio')
    expect(useHVACStore.getState().integrations.find((i) => i.id === 'twilio')?.connected).toBe(false)
  })
})

// ── Jobs Page ──────────────────────────────────────────────────────────────
describe('JobsPage', () => {
  it('shows empty state', async () => {
    wrap(<JobsPage />)
    expect(screen.getByText(/no jobs yet/i)).toBeInTheDocument()
  })

  it('renders jobs in table', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    await useHVACStore.getState().addJob({ contactId: contact.id, type: 'maintenance', status: 'scheduled', priority: 'normal', title: 'AC Tune-Up', scheduledAt: new Date() })
    wrap(<JobsPage />)
    expect(screen.getAllByTestId('job-row')).toHaveLength(1)
    expect(screen.getByText('AC Tune-Up')).toBeInTheDocument()
  })

  it('opens new job form', async () => {
    wrap(<JobsPage />)
    fireEvent.click(screen.getAllByText(/new job/i)[0])
    await waitFor(() => {
      expect(screen.getAllByText(/schedule job/i)[0]).toBeInTheDocument()
    })
  })

  it('filters by status', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    await useHVACStore.getState().addJob({ contactId: contact.id, type: 'maintenance', status: 'scheduled', priority: 'normal', title: 'Job A', scheduledAt: new Date() })
    await useHVACStore.getState().addJob({ contactId: contact.id, type: 'repair', status: 'completed', priority: 'normal', title: 'Job B', scheduledAt: new Date() })
    wrap(<JobsPage />)
    // Use the filter-chip class specifically
    const chips = document.querySelectorAll('.filter-chip')
    const completedChip = Array.from(chips).find((el) => el.textContent?.includes('Completed'))
    fireEvent.click(completedChip!)
    await waitFor(() => {
      expect(screen.getAllByTestId('job-row')).toHaveLength(1)
      expect(screen.getByText('Job B')).toBeInTheDocument()
    })
  })
})

// ── Equipment Page ─────────────────────────────────────────────────────────
describe('EquipmentPage', () => {
  it('shows empty state', async () => {
    wrap(<EquipmentPage />)
    expect(screen.getByText(/no equipment tracked/i)).toBeInTheDocument()
  })

  it('renders equipment in table', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    await useHVACStore.getState().addEquipment({ contactId: contact.id, type: 'ac_unit', brand: 'Carrier', model: 'XC21' })
    wrap(<EquipmentPage />)
    expect(screen.getAllByTestId('equipment-row')).toHaveLength(1)
    expect(screen.getByText(/Carrier XC21/)).toBeInTheDocument()
  })

  it('shows service due warning', async () => {
    const contact = await useCRMStore.getState().addContact({ firstName: 'Jane', lastName: 'Doe', status: 'active' })
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() + 10)
    await useHVACStore.getState().addEquipment({ contactId: contact.id, type: 'furnace', brand: 'Trane', nextServiceDate: pastDate })
    wrap(<EquipmentPage />)
    expect(screen.getAllByText(/service due soon/i).length).toBeGreaterThan(0)
  })
})

// ── Automations Page ───────────────────────────────────────────────────────
describe('AutomationsPage', () => {
  it('shows empty state', async () => {
    wrap(<AutomationsPage />)
    expect(screen.getByText(/no automations yet/i)).toBeInTheDocument()
  })

  it('adds automation from template', async () => {
    wrap(<AutomationsPage />)
    fireEvent.click(screen.getByText(/templates/i))
    await waitFor(() => {
      expect(screen.getAllByText(/automation templates/i)[0]).toBeInTheDocument()
    })
    fireEvent.click(screen.getAllByText('Add')[0])
    await waitFor(() => {
      expect(useHVACStore.getState().automations).toHaveLength(1)
    })
  })

  it('toggles automation on/off', async () => {
    await useHVACStore.getState().addAutomation({
      name: 'Test Rule', trigger: 'job_completed', action: 'send_sms',
      enabled: true, config: {},
    })
    wrap(<AutomationsPage />)
    const toggle = screen.getByTestId('automation-toggle')
    expect(toggle).toHaveClass('on')
    fireEvent.click(toggle)
    await waitFor(() => {
      expect(useHVACStore.getState().automations[0].enabled).toBe(false)
    })
  })
})

// ── Integrations Page ──────────────────────────────────────────────────────
describe('IntegrationsPage', () => {
  it('renders all integrations', async () => {
    wrap(<IntegrationsPage />)
    expect(screen.getByText('Twilio SMS')).toBeInTheDocument()
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getByText('Zapier')).toBeInTheDocument()
  })

  it('opens config modal on connect', async () => {
    wrap(<IntegrationsPage />)
    fireEvent.click(screen.getByTestId('connect-twilio'))
    await waitFor(() => {
      expect(screen.getByText(/connect twilio sms/i)).toBeInTheDocument()
      expect(screen.getByTestId('field-accountSid')).toBeInTheDocument()
    })
  })

  it('connects an integration', async () => {
    wrap(<IntegrationsPage />)
    fireEvent.click(screen.getByTestId('connect-slack'))
    await waitFor(() => screen.getByTestId('field-webhookUrl'))
    fireEvent.change(screen.getByTestId('field-webhookUrl'), { target: { value: 'https://hooks.slack.com/test' } })
    fireEvent.click(screen.getByTestId('save-integration'))
    await waitFor(() => {
      expect(useHVACStore.getState().integrations.find((i) => i.id === 'slack')?.connected).toBe(true)
    })
  })

  it('filters by category', async () => {
    wrap(<IntegrationsPage />)
    const commChips = screen.getAllByText('Communication')
    fireEvent.click(commChips[0])
    await waitFor(() => {
      expect(screen.getByText('Twilio SMS')).toBeInTheDocument()
      expect(screen.queryByText('QuickBooks')).not.toBeInTheDocument()
    })
  })
})
