import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCheckoutSession, createPortalSession, getSubscriptionStatus, PRICING_TIERS } from './stripe-custom-api'

// Mock fetch
global.fetch = vi.fn()

describe('Stripe Custom API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PRICING_TIERS', () => {
    it('should have three tiers', () => {
      expect(Object.keys(PRICING_TIERS)).toHaveLength(3)
      expect(PRICING_TIERS.starter).toBeDefined()
      expect(PRICING_TIERS.professional).toBeDefined()
      expect(PRICING_TIERS.premium).toBeDefined()
    })

    it('should have correct pricing', () => {
      expect(PRICING_TIERS.starter.price).toBe(79)
      expect(PRICING_TIERS.professional.price).toBe(149)
      expect(PRICING_TIERS.premium.price).toBe(249)
    })

    it('should mark professional as popular', () => {
      expect(PRICING_TIERS.professional.popular).toBe(true)
      expect(PRICING_TIERS.starter.popular).toBeUndefined()
      expect(PRICING_TIERS.premium.popular).toBeUndefined()
    })

    it('should have correct contact limits', () => {
      expect(PRICING_TIERS.starter.limits.contacts).toBe(250)
      expect(PRICING_TIERS.professional.limits.contacts).toBe(1000)
      expect(PRICING_TIERS.premium.limits.contacts).toBe(Infinity)
    })

    it('should have features list', () => {
      expect(PRICING_TIERS.starter.features).toBeInstanceOf(Array)
      expect(PRICING_TIERS.starter.features.length).toBeGreaterThan(0)
    })
  })

  describe('createCheckoutSession', () => {
    it('should call API with correct parameters', async () => {
      const mockSessionId = 'cs_test_123'
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: mockSessionId }),
      })

      const params = {
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        customerEmail: 'test@example.com',
      }

      const sessionId = await createCheckoutSession(params)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stripe/create-checkout-session'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        }
      )
      expect(sessionId).toBe(mockSessionId)
    })

    it('should throw error on failed API call', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'API Error' }),
      })

      await expect(
        createCheckoutSession({
          priceId: 'price_123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow('API Error')
    })

    it('should include metadata when provided', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_123' }),
      })

      const metadata = { userId: '456' }
      await createCheckoutSession({
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        metadata,
      })

      const callBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      )
      expect(callBody.metadata).toEqual(metadata)
    })
  })

  describe('createPortalSession', () => {
    it('should call API with customerId and returnUrl', async () => {
      const mockUrl = 'https://billing.stripe.com/session/xxx'
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: mockUrl }),
      })

      const customerId = 'cus_123'
      const returnUrl = 'https://example.com/account'

      const url = await createPortalSession(customerId, returnUrl)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stripe/create-portal-session'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId, returnUrl }),
        }
      )
      expect(url).toBe(mockUrl)
    })

    it('should throw error on failed API call', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Portal error' }),
      })

      await expect(
        createPortalSession('cus_123', 'https://example.com')
      ).rejects.toThrow('Portal error')
    })
  })

  describe('getSubscriptionStatus', () => {
    it('should fetch subscription status for user', async () => {
      const mockStatus = {
        status: 'active',
        plan: 'professional',
        currentPeriodEnd: '2026-04-25T00:00:00Z',
      }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      })

      const userId = 'user_123'
      const status = await getSubscriptionStatus(userId)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/stripe/subscription-status?userId=${userId}`),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      expect(status).toEqual(mockStatus)
    })

    it('should throw error when API fails', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      })

      await expect(getSubscriptionStatus('user_123')).rejects.toThrow(
        'Failed to get subscription status'
      )
    })
  })

  describe('API URL configuration', () => {
    it('should use VITE_API_BASE_URL from environment', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'cs_test' }),
      })

      await createCheckoutSession({
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })

      // Should call with API base URL (default or from env)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/stripe\/create-checkout-session$/),
        expect.any(Object)
      )
    })
  })
})
