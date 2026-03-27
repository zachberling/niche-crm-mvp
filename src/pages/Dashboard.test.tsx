import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { useCRMStore } from '@/store/crmStore'
import { useHVACStore } from '@/store/hvacStore'
import type { Contact } from '@/types/contact'
import type { Activity } from '@/types/activity'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock date functions for consistent testing
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    differenceInDays: vi.fn((date1: Date, date2: Date) => {
      return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
    }),
  }
})

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset stores
    useCRMStore.setState({
      contacts: [],
      activities: [],
      leads: [],
    })
    useHVACStore.setState({
      jobs: [],
      equipment: [],
      automations: [],
    })
  })

  describe('Header', () => {
    it('should render dashboard title', () => {
      renderDashboard()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should have schedule job button that navigates to jobs page', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      const scheduleBtn = screen.getByRole('button', { name: /schedule a new job/i })
      expect(scheduleBtn).toBeInTheDocument()
      
      await user.click(scheduleBtn)
      expect(mockNavigate).toHaveBeenCalledWith('/jobs')
    })
  })

  describe('Stats Cards', () => {
    it('should display zero stats when no data exists', () => {
      renderDashboard()
      
      const statsSection = screen.getByRole('region', { name: /key metrics/i })
      expect(within(statsSection).getByText('Total Contacts')).toBeInTheDocument()
      expect(within(statsSection).getAllByText('0').length).toBeGreaterThan(0)
      expect(within(statsSection).getByText('Active Jobs')).toBeInTheDocument()
      expect(within(statsSection).getByText('Revenue')).toBeInTheDocument()
      expect(within(statsSection).getByText('$0')).toBeInTheDocument()
      expect(within(statsSection).getByText('Automations')).toBeInTheDocument()
    })

    it('should calculate and display correct contact stats', () => {
      const contacts: Contact[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: 'lead',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          status: 'inactive',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      useCRMStore.setState({ contacts })
      renderDashboard()

      const statsSection = screen.getByRole('region', { name: /key metrics/i })
      expect(within(statsSection).getByText('3')).toBeInTheDocument() // Total contacts
    })

    it('should navigate to contacts page when clicking contact stat card', async () => {
      const user = userEvent.setup()
      useCRMStore.setState({
        contacts: [{
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      })
      
      renderDashboard()
      
      const contactsCard = screen.getByText('Total Contacts').closest('.stat-card')
      expect(contactsCard).toBeInTheDocument()
      
      await user.click(contactsCard!)
      expect(mockNavigate).toHaveBeenCalledWith('/contacts')
    })

    it('should calculate revenue from completed jobs', () => {
      useHVACStore.setState({
        jobs: [
          {
            id: '1',
            contactId: 'c1',
            title: 'AC Repair',
            type: 'repair',
            status: 'completed',
            scheduledAt: new Date().toISOString(),
            invoiceAmount: 250,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            contactId: 'c2',
            title: 'Maintenance',
            type: 'maintenance',
            status: 'completed',
            scheduledAt: new Date().toISOString(),
            invoiceAmount: 150,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            contactId: 'c3',
            title: 'Install',
            type: 'installation',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            invoiceAmount: 500, // Should not count - not completed
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const statsSection = screen.getByRole('region', { name: /key metrics/i })
      expect(within(statsSection).getByText('$400')).toBeInTheDocument() // 250 + 150
    })

    it('should count active jobs correctly', () => {
      useHVACStore.setState({
        jobs: [
          {
            id: '1',
            contactId: 'c1',
            title: 'Job 1',
            type: 'repair',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            contactId: 'c2',
            title: 'Job 2',
            type: 'repair',
            status: 'en_route',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            contactId: 'c3',
            title: 'Job 3',
            type: 'repair',
            status: 'in_progress',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            contactId: 'c4',
            title: 'Job 4',
            type: 'repair',
            status: 'completed',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const statsSection = screen.getByRole('region', { name: /key metrics/i })
      // Should show 3 active jobs (scheduled, en_route, in_progress)
      const activeJobsText = within(statsSection).getByText('Active Jobs').closest('.stat-card')
      expect(within(activeJobsText!).getByText('3')).toBeInTheDocument()
    })

    it('should count enabled automations', () => {
      useHVACStore.setState({
        automations: [
          {
            id: '1',
            name: 'Welcome Email',
            trigger: { type: 'contact_created', conditions: [] },
            actions: [{ type: 'send_email', config: { template: 'welcome' } }],
            enabled: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Follow Up',
            trigger: { type: 'activity_logged', conditions: [] },
            actions: [{ type: 'send_sms', config: { message: 'Thanks' } }],
            enabled: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Disabled Automation',
            trigger: { type: 'contact_created', conditions: [] },
            actions: [{ type: 'send_email', config: { template: 'test' } }],
            enabled: false,
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const statsSection = screen.getByRole('region', { name: /key metrics/i })
      const automationsCard = within(statsSection).getByText('Automations').closest('.stat-card')
      expect(within(automationsCard!).getByText('2')).toBeInTheDocument()
    })
  })

  describe('Service Due Alert', () => {
    it('should not show alert when no equipment is due for service', () => {
      useHVACStore.setState({
        equipment: [
          {
            id: '1',
            contactId: 'c1',
            type: 'AC Unit',
            manufacturer: 'Carrier',
            model: 'X100',
            serialNumber: 'SN123',
            installDate: '2020-01-01',
            nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should show alert when equipment is due for service within 30 days', () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now

      useHVACStore.setState({
        equipment: [
          {
            id: '1',
            contactId: 'c1',
            type: 'AC Unit',
            manufacturer: 'Carrier',
            model: 'X100',
            serialNumber: 'SN123',
            installDate: '2020-01-01',
            nextServiceDate: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(within(alert).getByText(/1 equipment unit due for service/i)).toBeInTheDocument()
    })

    it('should show plural message for multiple equipment units due', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now

      useHVACStore.setState({
        equipment: [
          {
            id: '1',
            contactId: 'c1',
            type: 'AC Unit',
            manufacturer: 'Carrier',
            model: 'X100',
            serialNumber: 'SN123',
            installDate: '2020-01-01',
            nextServiceDate: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            contactId: 'c2',
            type: 'Furnace',
            manufacturer: 'Trane',
            model: 'F200',
            serialNumber: 'SN456',
            installDate: '2019-01-01',
            nextServiceDate: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const alert = screen.getByRole('alert')
      expect(within(alert).getByText(/2 equipment units due for service/i)).toBeInTheDocument()
    })

    it('should navigate to equipment page when clicking alert', async () => {
      const user = userEvent.setup()
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)

      useHVACStore.setState({
        equipment: [
          {
            id: '1',
            contactId: 'c1',
            type: 'AC Unit',
            manufacturer: 'Carrier',
            model: 'X100',
            serialNumber: 'SN123',
            installDate: '2020-01-01',
            nextServiceDate: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const alert = screen.getByRole('alert')
      await user.click(alert)
      
      expect(mockNavigate).toHaveBeenCalledWith('/equipment')
    })

    it('should navigate to equipment page when pressing Enter on alert', async () => {
      const user = userEvent.setup()
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)

      useHVACStore.setState({
        equipment: [
          {
            id: '1',
            contactId: 'c1',
            type: 'AC Unit',
            manufacturer: 'Carrier',
            model: 'X100',
            serialNumber: 'SN123',
            installDate: '2020-01-01',
            nextServiceDate: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const alert = screen.getByRole('alert')
      alert.focus()
      await user.keyboard('{Enter}')
      
      expect(mockNavigate).toHaveBeenCalledWith('/equipment')
    })
  })

  describe('Recent Jobs Section', () => {
    it('should show empty state when no jobs exist', () => {
      renderDashboard()
      
      const jobsSection = screen.getByRole('region', { name: /recent jobs/i })
      expect(within(jobsSection).getByText('No jobs scheduled')).toBeInTheDocument()
    })

    it('should display recent jobs with contact information', () => {
      const contact: Contact = {
        id: 'c1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      useCRMStore.setState({ contacts: [contact] })
      useHVACStore.setState({
        jobs: [
          {
            id: 'j1',
            contactId: 'c1',
            title: 'AC Repair',
            type: 'repair',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const jobsSection = screen.getByRole('region', { name: /recent jobs/i })
      expect(within(jobsSection).getByText('AC Repair')).toBeInTheDocument()
      expect(within(jobsSection).getByText('John Doe')).toBeInTheDocument()
      expect(within(jobsSection).getByText('scheduled')).toBeInTheDocument()
    })

    it('should show correct emoji for job type', () => {
      useCRMStore.setState({
        contacts: [
          {
            id: 'c1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      })

      useHVACStore.setState({
        jobs: [
          {
            id: 'j1',
            contactId: 'c1',
            title: 'Emergency',
            type: 'emergency',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'j2',
            contactId: 'c1',
            title: 'Maintenance',
            type: 'maintenance',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'j3',
            contactId: 'c1',
            title: 'Repair',
            type: 'repair',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const jobsSection = screen.getByRole('region', { name: /recent jobs/i })
      expect(within(jobsSection).getByText('🚨')).toBeInTheDocument() // emergency
      expect(within(jobsSection).getByText('🔧')).toBeInTheDocument() // maintenance
      expect(within(jobsSection).getByText('🛠️')).toBeInTheDocument() // repair
    })

    it('should limit displayed jobs to 5', () => {
      const contact: Contact = {
        id: 'c1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      useCRMStore.setState({ contacts: [contact] })
      
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        id: `j${i}`,
        contactId: 'c1',
        title: `Job ${i}`,
        type: 'repair' as const,
        status: 'scheduled' as const,
        scheduledAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }))

      useHVACStore.setState({ jobs })

      renderDashboard()
      
      const jobsSection = screen.getByRole('region', { name: /recent jobs/i })
      const jobList = within(jobsSection).getByRole('list')
      const jobItems = within(jobList).getAllByRole('listitem')
      
      expect(jobItems).toHaveLength(5)
    })

    it('should navigate to jobs page when clicking view all button', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      const jobsSection = screen.getByRole('region', { name: /recent jobs/i })
      const viewAllBtn = within(jobsSection).getByRole('button', { name: /view all jobs/i })
      
      await user.click(viewAllBtn)
      expect(mockNavigate).toHaveBeenCalledWith('/jobs')
    })

    it('should navigate to jobs page when clicking a job item', async () => {
      const user = userEvent.setup()
      const contact: Contact = {
        id: 'c1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      useCRMStore.setState({ contacts: [contact] })
      useHVACStore.setState({
        jobs: [
          {
            id: 'j1',
            contactId: 'c1',
            title: 'AC Repair',
            type: 'repair',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const jobButton = screen.getByRole('button', { name: /AC Repair for John Doe/i })
      await user.click(jobButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/jobs')
    })
  })

  describe('Recent Activity Section', () => {
    it('should show empty state when no activities exist', () => {
      renderDashboard()
      
      const activitySection = screen.getByRole('region', { name: /recent activity/i })
      expect(within(activitySection).getByText('No activity yet')).toBeInTheDocument()
    })

    it('should display recent activities with icons', () => {
      const activities: Activity[] = [
        {
          id: 'a1',
          contactId: 'c1',
          type: 'call',
          title: 'Called customer',
          description: 'Discussed repair options',
          createdAt: new Date(),
        },
        {
          id: 'a2',
          contactId: 'c2',
          type: 'email',
          title: 'Sent estimate',
          description: 'Quote for AC unit',
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
      ]

      useCRMStore.setState({ activities })
      renderDashboard()
      
      const activitySection = screen.getByRole('region', { name: /recent activity/i })
      expect(within(activitySection).getByText('Called customer')).toBeInTheDocument()
      expect(within(activitySection).getByText('Sent estimate')).toBeInTheDocument()
      expect(within(activitySection).getByText('📞')).toBeInTheDocument() // call icon
      expect(within(activitySection).getByText('✉️')).toBeInTheDocument() // email icon
    })

    it('should limit displayed activities to 6', () => {
      const activities: Activity[] = Array.from({ length: 10 }, (_, i) => ({
        id: `a${i}`,
        contactId: 'c1',
        type: 'note' as const,
        title: `Activity ${i}`,
        description: 'Test',
        createdAt: new Date(Date.now() - i * 1000 * 60),
      }))

      useCRMStore.setState({ activities })
      renderDashboard()
      
      const activitySection = screen.getByRole('region', { name: /recent activity/i })
      const activityList = within(activitySection).getByRole('list')
      const activityItems = within(activityList).getAllByRole('listitem')
      
      expect(activityItems).toHaveLength(6)
    })

    it('should navigate to activity page when clicking view all button', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      const activitySection = screen.getByRole('region', { name: /recent activity/i })
      const viewAllBtn = within(activitySection).getByRole('button', { name: /view all activity/i })
      
      await user.click(viewAllBtn)
      expect(mockNavigate).toHaveBeenCalledWith('/activity')
    })

    it('should show correct icons for different activity types', () => {
      const activities: Activity[] = [
        {
          id: 'a1',
          contactId: 'c1',
          type: 'call',
          title: 'Call',
          createdAt: new Date(),
        },
        {
          id: 'a2',
          contactId: 'c2',
          type: 'email',
          title: 'Email',
          createdAt: new Date(),
        },
        {
          id: 'a3',
          contactId: 'c3',
          type: 'meeting',
          title: 'Meeting',
          createdAt: new Date(),
        },
        {
          id: 'a4',
          contactId: 'c4',
          type: 'note',
          title: 'Note',
          createdAt: new Date(),
        },
      ]

      useCRMStore.setState({ activities })
      renderDashboard()
      
      const activitySection = screen.getByRole('region', { name: /recent activity/i })
      expect(within(activitySection).getByText('📞')).toBeInTheDocument() // call
      expect(within(activitySection).getByText('✉️')).toBeInTheDocument() // email
      expect(within(activitySection).getByText('🤝')).toBeInTheDocument() // meeting
      expect(within(activitySection).getByText('📝')).toBeInTheDocument() // note
    })
  })

  describe('Quick Actions', () => {
    it('should render all quick action buttons', () => {
      renderDashboard()
      
      const quickActions = screen.getByRole('region', { name: /quick actions/i })
      
      expect(within(quickActions).getByRole('button', { name: /schedule job/i })).toBeInTheDocument()
      expect(within(quickActions).getByRole('button', { name: /add contact/i })).toBeInTheDocument()
      expect(within(quickActions).getByRole('button', { name: /track equipment/i })).toBeInTheDocument()
      expect(within(quickActions).getByRole('button', { name: /new automation/i })).toBeInTheDocument()
      expect(within(quickActions).getByRole('button', { name: /connect app/i })).toBeInTheDocument()
    })

    it('should navigate to correct pages when clicking quick action buttons', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      const quickActions = screen.getByRole('region', { name: /quick actions/i })
      
      await user.click(within(quickActions).getByRole('button', { name: /schedule job/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/jobs')
      
      await user.click(within(quickActions).getByRole('button', { name: /add contact/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/contacts')
      
      await user.click(within(quickActions).getByRole('button', { name: /track equipment/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/equipment')
      
      await user.click(within(quickActions).getByRole('button', { name: /new automation/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/automations')
      
      await user.click(within(quickActions).getByRole('button', { name: /connect app/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/integrations')
    })
  })

  describe('Integration Tests', () => {
    it('should render complete dashboard with all data populated', () => {
      // Set up comprehensive test data
      const contacts: Contact[] = [
        {
          id: 'c1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'c2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: 'lead',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const activities: Activity[] = [
        {
          id: 'a1',
          contactId: 'c1',
          type: 'call',
          title: 'Follow-up call',
          createdAt: new Date(),
        },
      ]

      useCRMStore.setState({ contacts, activities })
      
      useHVACStore.setState({
        jobs: [
          {
            id: 'j1',
            contactId: 'c1',
            title: 'AC Repair',
            type: 'repair',
            status: 'scheduled',
            scheduledAt: new Date().toISOString(),
            invoiceAmount: 350,
            createdAt: new Date().toISOString(),
          },
        ],
        equipment: [],
        automations: [
          {
            id: 'auto1',
            name: 'Welcome Email',
            trigger: { type: 'contact_created', conditions: [] },
            actions: [{ type: 'send_email', config: { template: 'welcome' } }],
            enabled: true,
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      // Verify all sections are present
      expect(screen.getByRole('region', { name: /key metrics/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /recent jobs/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /recent activity/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /quick actions/i })).toBeInTheDocument()
      
      // Verify data is displayed
      expect(screen.getByText('2')).toBeInTheDocument() // Total contacts
      expect(screen.getByText('AC Repair')).toBeInTheDocument()
      expect(screen.getByText('Follow-up call')).toBeInTheDocument()
    })

    it('should handle dashboard with no data gracefully', () => {
      renderDashboard()
      
      // All sections should still render
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /key metrics/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /recent jobs/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /recent activity/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /quick actions/i })).toBeInTheDocument()
      
      // Empty states should be visible
      expect(screen.getByText('No jobs scheduled')).toBeInTheDocument()
      expect(screen.getByText('No activity yet')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on all interactive elements', () => {
      renderDashboard()
      
      expect(screen.getByRole('button', { name: /schedule a new job/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /key metrics/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /recent jobs/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /recent activity/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /quick actions/i })).toBeInTheDocument()
    })

    it('should have semantic HTML structure', () => {
      renderDashboard()
      
      expect(screen.getByRole('banner', { name: '' })).toBeInTheDocument() // header
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should show proper alert role for service due notification', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)

      useHVACStore.setState({
        equipment: [
          {
            id: '1',
            contactId: 'c1',
            type: 'AC Unit',
            manufacturer: 'Carrier',
            model: 'X100',
            serialNumber: 'SN123',
            installDate: '2020-01-01',
            nextServiceDate: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      })

      renderDashboard()
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-label', expect.stringContaining('equipment'))
    })
  })
})
