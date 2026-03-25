import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PricingPlans } from './PricingPlans'
import * as stripeLib from '@/lib/stripe'

// Mock the stripe module
vi.mock('@/lib/stripe', () => ({
  PRICING_TIERS: {
    starter: {
      name: 'Starter',
      price: 79,
      priceId: 'price_starter',
      features: ['250 contacts', 'Email support'],
      limits: { contacts: 250 },
    },
    professional: {
      name: 'Professional',
      price: 149,
      priceId: 'price_pro',
      features: ['1,000 contacts', 'AI features'],
      limits: { contacts: 1000 },
      popular: true,
    },
    premium: {
      name: 'Premium',
      price: 249,
      priceId: 'price_premium',
      features: ['Unlimited contacts'],
      limits: { contacts: Infinity },
    },
  },
  getStripe: vi.fn(),
  createCheckoutSession: vi.fn(),
}))

describe('PricingPlans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render pricing header', () => {
      render(<PricingPlans />)
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      expect(screen.getByText(/14-day free trial/i)).toBeInTheDocument()
    })

    it('should render all three pricing tiers', () => {
      render(<PricingPlans />)
      expect(screen.getByText('Starter')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    it('should display correct prices', () => {
      render(<PricingPlans />)
      expect(screen.getByText('79')).toBeInTheDocument()
      expect(screen.getByText('149')).toBeInTheDocument()
      expect(screen.getByText('249')).toBeInTheDocument()
    })

    it('should show "Most Popular" badge on Professional tier', () => {
      render(<PricingPlans />)
      expect(screen.getByText('Most Popular')).toBeInTheDocument()
    })

    it('should render all features for each tier', () => {
      render(<PricingPlans />)
      expect(screen.getByText('250 contacts')).toBeInTheDocument()
      expect(screen.getByText('Email support')).toBeInTheDocument()
      expect(screen.getByText('1,000 contacts')).toBeInTheDocument()
      expect(screen.getByText('AI features')).toBeInTheDocument()
      expect(screen.getByText('Unlimited contacts')).toBeInTheDocument()
    })

    it('should render subscribe buttons for all tiers', () => {
      render(<PricingPlans />)
      const buttons = screen.getAllByText('Start Free Trial')
      expect(buttons).toHaveLength(3)
    })

    it('should render pricing footer', () => {
      render(<PricingPlans />)
      expect(screen.getByText(/All plans include/i)).toBeInTheDocument()
      expect(screen.getByText(/Cancel anytime/i)).toBeInTheDocument()
    })
  })

  describe('Subscription Flow', () => {
    it('should call createCheckoutSession when subscribe button is clicked', async () => {
      const mockGetStripe = vi.fn().mockResolvedValue({
        redirectToCheckout: vi.fn().mockResolvedValue({ error: null }),
      })
      const mockCreateCheckout = vi.fn().mockResolvedValue('cs_test_123')
      
      vi.mocked(stripeLib.getStripe).mockImplementation(mockGetStripe)
      vi.mocked(stripeLib.createCheckoutSession).mockImplementation(mockCreateCheckout)

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0]) // Click Starter plan

      await waitFor(() => {
        expect(mockCreateCheckout).toHaveBeenCalledWith(
          expect.objectContaining({
            priceId: 'price_starter',
            successUrl: expect.stringContaining('/success'),
            cancelUrl: expect.stringContaining('/pricing'),
          })
        )
      })
    })

    it('should redirect to Stripe Checkout after session creation', async () => {
      const mockRedirect = vi.fn().mockResolvedValue({ error: null })
      const mockGetStripe = vi.fn().mockResolvedValue({
        redirectToCheckout: mockRedirect,
      })
      vi.mocked(stripeLib.getStripe).mockImplementation(mockGetStripe)
      vi.mocked(stripeLib.createCheckoutSession).mockResolvedValue('cs_test_123')

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[1]) // Click Professional plan

      await waitFor(() => {
        expect(mockRedirect).toHaveBeenCalledWith({ sessionId: 'cs_test_123' })
      })
    })

    it('should show loading state during checkout', async () => {
      vi.mocked(stripeLib.createCheckoutSession).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('cs_test'), 100))
      )

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0])

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })

    it('should disable all buttons while loading', async () => {
      vi.mocked(stripeLib.createCheckoutSession).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('cs_test'), 100))
      )

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0])

      await waitFor(() => {
        buttons.forEach((button) => {
          expect(button).toBeDisabled()
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should show alert when Stripe is not configured', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      // Mock PRICING_TIERS with empty priceId
      const originalTiers = { ...stripeLib.PRICING_TIERS }
      ;(stripeLib as any).PRICING_TIERS = {
        ...originalTiers,
        starter: { ...originalTiers.starter, priceId: '' },
      }

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0])

      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Stripe is not configured')
      )

      // Restore
      ;(stripeLib as any).PRICING_TIERS = originalTiers
      mockAlert.mockRestore()
    })

    it('should show alert when checkout fails', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})
      vi.mocked(stripeLib.createCheckoutSession).mockRejectedValueOnce(
        new Error('Checkout failed')
      )

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0])

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled()
      }, { timeout: 3000 })

      mockAlert.mockRestore()
    })

    it('should show alert when Stripe redirect fails', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const mockRedirect = vi.fn().mockResolvedValue({ 
        error: { message: 'Redirect failed' } 
      })
      const mockGetStripe = vi.fn().mockResolvedValue({
        redirectToCheckout: mockRedirect,
      })
      
      vi.mocked(stripeLib.getStripe).mockImplementation(mockGetStripe)
      vi.mocked(stripeLib.createCheckoutSession).mockResolvedValueOnce('cs_test_123')

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0])

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled()
      }, { timeout: 3000 })

      mockAlert.mockRestore()
    })

    it('should handle Stripe loading failure', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})
      vi.mocked(stripeLib.getStripe).mockResolvedValueOnce(null)
      vi.mocked(stripeLib.createCheckoutSession).mockResolvedValueOnce('cs_test_123')

      render(<PricingPlans />)
      
      const buttons = screen.getAllByText('Start Free Trial')
      fireEvent.click(buttons[0])

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled()
      }, { timeout: 3000 })

      mockAlert.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<PricingPlans />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Choose Your Plan')
    })

    it('should have clickable buttons', () => {
      render(<PricingPlans />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Styling', () => {
    it('should apply popular class to Professional tier', () => {
      const { container } = render(<PricingPlans />)
      const popularCards = container.querySelectorAll('.popular')
      expect(popularCards.length).toBe(1)
    })

    it('should render pricing grid', () => {
      const { container } = render(<PricingPlans />)
      const grid = container.querySelector('.pricing-grid')
      expect(grid).toBeInTheDocument()
    })

    it('should render all pricing cards', () => {
      const { container } = render(<PricingPlans />)
      const cards = container.querySelectorAll('.pricing-card')
      expect(cards).toHaveLength(3)
    })
  })
})
