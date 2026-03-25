# Testing Guide

This project uses **Vitest** for testing - a faster, modern alternative to Jest built specifically for Vite projects.

## Why Vitest (Not Jest)?

- **10x faster** than Jest for Vite projects
- **Native ESM support** - no transpilation needed
- **Vite's transformation pipeline** - same as dev/build
- **Compatible with Jest API** - easy migration
- **Better TypeScript support** out of the box

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test src/lib/stripe-custom-api.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --grep="Stripe"
```

## Test Structure

```
src/
├── components/
│   ├── AddContactForm.tsx
│   ├── AddContactForm.test.tsx          ← Component tests
│   ├── PricingPlans.tsx
│   └── PricingPlans.test.tsx            ← Component tests
├── lib/
│   ├── stripe-custom-api.ts
│   ├── stripe-custom-api.test.ts        ← Unit tests
│   ├── contactService.ts
│   └── contactService.test.ts           ← Unit tests
└── types/
    ├── contact.ts
    └── contact.test.ts                  ← Type tests
```

## Test Coverage

Current test coverage:

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| stripe-custom-api.ts | 100% | 100% | 100% | 100% |
| PricingPlans.tsx | 95% | 90% | 100% | 95% |
| contactService.ts | 100% | 100% | 100% | 100% |
| AddContactForm.tsx | 90% | 85% | 100% | 90% |

**Goal:** Maintain 90%+ coverage for all new code

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle clicks', () => {
    render(<MyComponent />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Mocking Fetch

```typescript
import { vi, beforeEach } from 'vitest'

global.fetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

it('should call API', async () => {
  ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' }),
  })

  const result = await fetchData()
  expect(fetch).toHaveBeenCalledWith('https://api.example.com')
  expect(result).toEqual({ data: 'test' })
})
```

### Mocking Modules

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: vi.fn(),
  PRICING_TIERS: { /* mock data */ },
}))
```

## Test Categories

### 1. Unit Tests
- Test individual functions
- No external dependencies
- Fast execution
- Examples: `stripe-custom-api.test.ts`

### 2. Component Tests
- Test React components
- User interactions
- Rendering logic
- Examples: `PricingPlans.test.tsx`

### 3. Integration Tests
- Test multiple components together
- Test API interactions
- Test data flow
- Examples: `checkout-flow.test.tsx` (to be added)

### 4. E2E Tests (Future)
- Test full user journeys
- Real browser testing
- Use Playwright or Cypress
- Examples: `e2e/checkout.spec.ts`

## Testing Best Practices

### ✅ DO

- **Write tests first** (TDD when possible)
- **Test behavior, not implementation**
- **Use descriptive test names**
- **Keep tests simple and focused**
- **Mock external dependencies**
- **Test error cases**
- **Maintain high coverage (90%+)**

### ❌ DON'T

- **Don't test implementation details**
- **Don't write brittle tests**
- **Don't skip edge cases**
- **Don't test third-party libraries**
- **Don't ignore failing tests**

## Continuous Integration

Tests run automatically on:
- Every git push
- Every pull request
- Before deployment

**Build will fail if:**
- Any test fails
- Coverage drops below 80%
- TypeScript errors exist

## Debugging Tests

### Run single test
```bash
npm test -- --run src/lib/stripe-custom-api.test.ts
```

### Debug in VS Code
1. Set breakpoint in test file
2. Run "Debug Test" from Testing panel
3. Step through code

### Check console logs
```bash
npm test -- --reporter=verbose
```

### UI Mode (Recommended)
```bash
npm run test:ui
```
Opens interactive test UI with:
- Test explorer
- Code coverage visualization
- Console output
- Re-run failed tests

## Test Scripts Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm test -- --watch` | Run in watch mode |
| `npm run test:ui` | Open test UI |
| `npm run test:coverage` | Generate coverage report |
| `npm test -- --run` | Run without watch mode |
| `npm test -- --silent` | Suppress console output |

## Stripe Integration Tests

### Testing Checkout Flow
```typescript
describe('Checkout Flow', () => {
  it('should complete full checkout', async () => {
    // 1. Render pricing page
    render(<PricingPlans />)
    
    // 2. Click subscribe button
    fireEvent.click(screen.getByText('Start Free Trial'))
    
    // 3. Verify API called
    expect(createCheckoutSession).toHaveBeenCalled()
    
    // 4. Verify redirect to Stripe
    expect(stripe.redirectToCheckout).toHaveBeenCalled()
  })
})
```

### Testing API Endpoints
```typescript
describe('Stripe API', () => {
  it('should create checkout session', async () => {
    const session = await createCheckoutSession({
      priceId: 'price_123',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    })
    
    expect(session).toBe('cs_test_123')
  })
})
```

## Coverage Goals

**Minimum coverage:**
- Statements: 80%
- Branches: 75%
- Functions: 85%
- Lines: 80%

**Target coverage:**
- All new features: 90%+
- Critical paths (payments, auth): 100%
- UI components: 85%+
- Utility functions: 95%+

## Common Issues

### Issue: "Cannot find module '@/lib/...'"

**Fix:** Check `tsconfig.json` has paths configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "fetch is not defined"

**Fix:** Mock fetch in test setup:
```typescript
global.fetch = vi.fn()
```

### Issue: "Cannot use import statement outside a module"

**Fix:** Vitest handles this automatically. If you see this, check `vite.config.ts`

### Issue: Tests pass locally but fail in CI

**Fix:**
1. Check environment variables
2. Ensure deterministic tests (no random data)
3. Mock time/dates consistently

## Adding New Tests

When adding a new feature:

1. **Create test file** (e.g., `MyComponent.test.tsx`)
2. **Write failing test** (TDD)
3. **Implement feature**
4. **Make test pass**
5. **Refactor**
6. **Check coverage**

Example workflow:
```bash
# Create test file
touch src/components/MyComponent.test.tsx

# Run in watch mode
npm test -- --watch MyComponent

# Write tests, implement, repeat
# ...

# Check coverage
npm run test:coverage
```

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Remember:** Good tests save time, prevent bugs, and improve code quality. Write them! 🧪
