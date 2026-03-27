import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobChecklist } from './JobChecklist'
import { Job } from '@/types/hvac'

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}))

describe('JobChecklist', () => {
  const mockJob: Job = {
    id: '1',
    type: 'maintenance',
    contactId: 'c1',
    scheduledDate: new Date('2024-01-15'),
    status: 'scheduled',
    description: 'Routine maintenance',
    checklistItems: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render checklist title', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      expect(screen.getByText(/Checklist/)).toBeInTheDocument()
    })

    it('should show load template button when checklist is empty', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      expect(screen.getByText('Load template')).toBeInTheDocument()
    })

    it('should not show load template button when items exist', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: 'Test item', checked: false }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      expect(screen.queryByText('Load template')).not.toBeInTheDocument()
    })

    it('should show progress counter when items exist', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'Item 1', checked: true },
          { id: '2', label: 'Item 2', checked: false },
        ],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      expect(screen.getByText('(1/2)')).toBeInTheDocument()
    })

    it('should not show progress counter when no items', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      expect(screen.queryByText(/\(\d+\/\d+\)/)).not.toBeInTheDocument()
    })

    it('should render all checklist items', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'First item', checked: false },
          { id: '2', label: 'Second item', checked: true },
          { id: '3', label: 'Third item', checked: false },
        ],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
      expect(screen.getByText('Third item')).toBeInTheDocument()
    })

    it('should render input field for new items', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      expect(screen.getByPlaceholderText('Add checklist item…')).toBeInTheDocument()
    })

    it('should render add button', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      expect(screen.getByLabelText('Add item')).toBeInTheDocument()
    })

    it('should render voice button', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      expect(screen.getByLabelText('Add by voice')).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should show progress bar when items exist', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: 'Test', checked: false }],
      }
      const { container } = render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const progressBar = container.querySelector('[style*="background: var(--border)"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('should not show progress bar when no items', () => {
      const { container } = render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const progressBar = container.querySelector('[style*="background: var(--border)"]')
      expect(progressBar).not.toBeInTheDocument()
    })

    it('should show correct progress percentage', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'Item 1', checked: true },
          { id: '2', label: 'Item 2', checked: true },
          { id: '3', label: 'Item 3', checked: false },
          { id: '4', label: 'Item 4', checked: false },
        ],
      }
      const { container } = render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const progressFill = container.querySelector('[style*="width: 50%"]')
      expect(progressFill).toBeInTheDocument()
    })
  })

  describe('Loading Templates', () => {
    it('should load maintenance template for maintenance job', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const loadButton = screen.getByText('Load template')
      fireEvent.click(loadButton)

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          checklistItems: expect.arrayContaining([
            expect.objectContaining({ label: 'Inspect air filter — replace if needed' }),
            expect.objectContaining({ label: 'Check refrigerant levels' }),
            expect.objectContaining({ label: 'Clean evaporator & condenser coils' }),
          ]),
        })
      )
    })

    it('should load repair template for repair job', () => {
      const repairJob = { ...mockJob, type: 'repair' as const }
      render(<JobChecklist job={repairJob} onUpdate={mockOnUpdate} />)
      const loadButton = screen.getByText('Load template')
      fireEvent.click(loadButton)

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          checklistItems: expect.arrayContaining([
            expect.objectContaining({ label: 'Diagnose fault code / symptom' }),
            expect.objectContaining({ label: 'Complete repair' }),
          ]),
        })
      )
    })

    it('should load installation template for installation job', () => {
      const installJob = { ...mockJob, type: 'installation' as const }
      render(<JobChecklist job={installJob} onUpdate={mockOnUpdate} />)
      const loadButton = screen.getByText('Load template')
      fireEvent.click(loadButton)

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          checklistItems: expect.arrayContaining([
            expect.objectContaining({ label: 'Verify equipment matches order' }),
            expect.objectContaining({ label: 'Install unit per manufacturer specs' }),
          ]),
        })
      )
    })

    it('should load inspection template for inspection job', () => {
      const inspectionJob = { ...mockJob, type: 'inspection' as const }
      render(<JobChecklist job={inspectionJob} onUpdate={mockOnUpdate} />)
      const loadButton = screen.getByText('Load template')
      fireEvent.click(loadButton)

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          checklistItems: expect.arrayContaining([
            expect.objectContaining({ label: 'Inspect heat exchanger' }),
            expect.objectContaining({ label: 'Test carbon monoxide levels' }),
          ]),
        })
      )
    })

    it('should default to maintenance template for unknown job type', () => {
      const unknownJob = { ...mockJob, type: 'unknown' as any }
      render(<JobChecklist job={unknownJob} onUpdate={mockOnUpdate} />)
      const loadButton = screen.getByText('Load template')
      fireEvent.click(loadButton)

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          checklistItems: expect.arrayContaining([
            expect.objectContaining({ label: 'Inspect air filter — replace if needed' }),
          ]),
        })
      )
    })

    it('should set all template items as unchecked', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const loadButton = screen.getByText('Load template')
      fireEvent.click(loadButton)

      const items = mockOnUpdate.mock.calls[0][0].checklistItems
      expect(items.every((item: any) => item.checked === false)).toBe(true)
    })
  })

  describe('Adding Items', () => {
    it('should add new item when clicking add button', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…')
      const addButton = screen.getByLabelText('Add item')

      fireEvent.change(input, { target: { value: 'New task' } })
      fireEvent.click(addButton)

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [
          expect.objectContaining({
            label: 'New task',
            checked: false,
          }),
        ],
      })
    })

    it('should add new item when pressing Enter', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…')

      fireEvent.change(input, { target: { value: 'New task' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [
          expect.objectContaining({
            label: 'New task',
            checked: false,
          }),
        ],
      })
    })

    it('should not add item when input is empty', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const addButton = screen.getByLabelText('Add item')

      fireEvent.click(addButton)
      expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it('should not add item when input contains only whitespace', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…')
      const addButton = screen.getByLabelText('Add item')

      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.click(addButton)

      expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it('should trim whitespace from new items', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…')
      const addButton = screen.getByLabelText('Add item')

      fireEvent.change(input, { target: { value: '  New task  ' } })
      fireEvent.click(addButton)

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [
          expect.objectContaining({
            label: 'New task',
          }),
        ],
      })
    })

    it('should clear input after adding item', async () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…') as HTMLInputElement
      const addButton = screen.getByLabelText('Add item')

      fireEvent.change(input, { target: { value: 'New task' } })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should add to existing items', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: 'existing', label: 'Existing item', checked: false }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…')
      const addButton = screen.getByLabelText('Add item')

      fireEvent.change(input, { target: { value: 'New item' } })
      fireEvent.click(addButton)

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [
          { id: 'existing', label: 'Existing item', checked: false },
          expect.objectContaining({ label: 'New item' }),
        ],
      })
    })
  })

  describe('Toggling Items', () => {
    it('should toggle item from unchecked to checked', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: 'Test item', checked: false }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const checkButton = screen.getByLabelText('Check item')

      fireEvent.click(checkButton)

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [{ id: '1', label: 'Test item', checked: true }],
      })
    })

    it('should toggle item from checked to unchecked', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: 'Test item', checked: true }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const checkButton = screen.getByLabelText('Uncheck item')

      fireEvent.click(checkButton)

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [{ id: '1', label: 'Test item', checked: false }],
      })
    })

    it('should only toggle the clicked item', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'Item 1', checked: false },
          { id: '2', label: 'Item 2', checked: false },
        ],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const checkButtons = screen.getAllByLabelText('Check item')

      fireEvent.click(checkButtons[1])

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [
          { id: '1', label: 'Item 1', checked: false },
          { id: '2', label: 'Item 2', checked: true },
        ],
      })
    })

    it('should have correct aria-pressed attribute', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'Checked', checked: true },
          { id: '2', label: 'Unchecked', checked: false },
        ],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)

      const uncheckedButton = screen.getByLabelText('Uncheck item')
      const checkedButton = screen.getByLabelText('Check item')

      expect(uncheckedButton).toHaveAttribute('aria-pressed', 'true')
      expect(checkedButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Removing Items', () => {
    it('should remove item when clicking remove button', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'Item 1', checked: false },
          { id: '2', label: 'Item 2', checked: false },
        ],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const removeButtons = screen.getAllByLabelText('Remove item')

      fireEvent.click(removeButtons[0])

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [{ id: '2', label: 'Item 2', checked: false }],
      })
    })

    it('should remove correct item', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [
          { id: '1', label: 'Item 1', checked: false },
          { id: '2', label: 'Item 2', checked: false },
          { id: '3', label: 'Item 3', checked: false },
        ],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const removeButtons = screen.getAllByLabelText('Remove item')

      fireEvent.click(removeButtons[1])

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [
          { id: '1', label: 'Item 1', checked: false },
          { id: '3', label: 'Item 3', checked: false },
        ],
      })
    })

    it('should handle removing last item', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: 'Only item', checked: false }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const removeButton = screen.getByLabelText('Remove item')

      fireEvent.click(removeButton)

      expect(mockOnUpdate).toHaveBeenCalledWith({
        checklistItems: [],
      })
    })
  })

  describe('Voice Input', () => {
    it('should show listening state when voice button is clicked', () => {
      const mockStart = vi.fn()
      const MockRecognition = vi.fn(function(this: any) {
        this.start = mockStart
        this.stop = vi.fn()
        this.onresult = null
        this.onend = null
        this.lang = ''
      })
      ;(window as any).webkitSpeechRecognition = MockRecognition

      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const voiceButton = screen.getByLabelText('Add by voice')

      fireEvent.click(voiceButton)

      expect(mockStart).toHaveBeenCalled()
      expect(screen.getByLabelText('Listening…')).toBeInTheDocument()
    })

    it('should not start voice when SpeechRecognition is unavailable', () => {
      ;(window as any).SpeechRecognition = undefined
      ;(window as any).webkitSpeechRecognition = undefined

      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const voiceButton = screen.getByLabelText('Add by voice')

      fireEvent.click(voiceButton)

      // Should not crash and button should remain in non-listening state
      expect(screen.queryByLabelText('Listening…')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle job with undefined checklistItems', () => {
      const jobWithoutChecklist = { ...mockJob, checklistItems: undefined }
      render(<JobChecklist job={jobWithoutChecklist} onUpdate={mockOnUpdate} />)
      expect(screen.getByText('Load template')).toBeInTheDocument()
    })

    it('should handle very long item labels', () => {
      const longLabel = 'A'.repeat(200)
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: longLabel, checked: false }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle rapid toggling', () => {
      const jobWithItems = {
        ...mockJob,
        checklistItems: [{ id: '1', label: 'Test', checked: false }],
      }
      render(<JobChecklist job={jobWithItems} onUpdate={mockOnUpdate} />)
      const checkButton = screen.getByLabelText('Check item')

      fireEvent.click(checkButton)
      fireEvent.click(checkButton)
      fireEvent.click(checkButton)

      expect(mockOnUpdate).toHaveBeenCalledTimes(3)
    })

    it('should not trigger add on other keys', () => {
      render(<JobChecklist job={mockJob} onUpdate={mockOnUpdate} />)
      const input = screen.getByPlaceholderText('Add checklist item…')

      fireEvent.change(input, { target: { value: 'New task' } })
      fireEvent.keyDown(input, { key: 'Tab' })
      fireEvent.keyDown(input, { key: 'Escape' })

      expect(mockOnUpdate).not.toHaveBeenCalled()
    })
  })
})
