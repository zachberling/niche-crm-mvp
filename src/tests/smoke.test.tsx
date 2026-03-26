import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ── Mock Supabase ──────────────────────────────────────────────────────────
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

import { supabase } from '@/lib/supabase'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { OnboardingPage } from '@/pages/OnboardingPage'

// ── Landing Page ───────────────────────────────────────────────────────────
describe('LandingPage smoke tests', () => {
  it('renders hero headline', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    expect(screen.getByText(/Stop losing HVAC leads/i)).toBeTruthy()
  })

  it('renders pricing plans', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    expect(screen.getByText('Starter')).toBeTruthy()
    expect(screen.getByText('Pro')).toBeTruthy()
    expect(screen.getByText('Team')).toBeTruthy()
  })

  it('navigates to signup on CTA click', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    fireEvent.click(screen.getAllByText(/Start Free Trial/i)[0])
    expect(mockNavigate).toHaveBeenCalledWith('/auth?mode=signup')
  })

  it('navigates to login on Sign In click', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Sign In'))
    expect(mockNavigate).toHaveBeenCalledWith('/auth?mode=login')
  })
})

// ── Auth Page ──────────────────────────────────────────────────────────────
describe('AuthPage smoke tests', () => {
  beforeEach(() => { mockNavigate.mockClear() })

  it('renders login form by default', () => {
    render(<MemoryRouter initialEntries={['/auth']}><AuthPage /></MemoryRouter>)
    expect(screen.getAllByText('Sign In')[0]).toBeTruthy()
    expect(screen.getByPlaceholderText('Email')).toBeTruthy()
    expect(screen.getByPlaceholderText('Password')).toBeTruthy()
  })

  it('shows error on failed login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      error: { message: 'Invalid credentials' },
    } as any)
    render(<MemoryRouter initialEntries={['/auth']}><AuthPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeTruthy())
  })

  it('redirects to dashboard on successful login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ error: null } as any)
    render(<MemoryRouter initialEntries={['/auth']}><AuthPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('redirects to onboarding on successful signup', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ error: null } as any)
    render(<MemoryRouter initialEntries={['/auth?mode=signup']}><AuthPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/onboarding'))
  })
})

// ── Onboarding ─────────────────────────────────────────────────────────────
describe('OnboardingPage smoke tests', () => {
  it('renders first step', () => {
    render(<MemoryRouter><OnboardingPage /></MemoryRouter>)
    expect(screen.getByText(/Let's set up your account/i)).toBeTruthy()
  })

  it('next button disabled when fields empty', () => {
    render(<MemoryRouter><OnboardingPage /></MemoryRouter>)
    const next = screen.getByText('Next')
    expect(next.closest('button')).toHaveProperty('disabled', true)
  })

  it('advances to step 2 when fields filled', async () => {
    render(<MemoryRouter><OnboardingPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText(/Arctic Air/i), { target: { value: 'My HVAC Co' } })
    const selects = document.querySelectorAll('select')
    if (selects.length > 0) fireEvent.change(selects[0], { target: { value: 'Owner / Operator' } })
    fireEvent.click(screen.getByText('Next'))
    await waitFor(() => expect(screen.getByText(/About your team/i)).toBeTruthy())
  })
})
