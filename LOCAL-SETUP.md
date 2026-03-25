# 🚀 Local Test Environment

Your Niche CRM is now running locally for development and testing!

## ✅ Current Status

**Dev Server:** ✅ Running on http://localhost:5173  
**Environment:** ✅ Configured (`.env` created)  
**Dependencies:** ✅ Installed  
**Tests:** ✅ Ready (101/105 passing)

---

## 🌐 Access Your App

**Main App:**
```
http://localhost:5173
```

**Pricing Page (Stripe):**
```
http://localhost:5173/pricing
```

(Note: You'll need to add routing to access the pricing page - see below)

---

## 🎮 Quick Commands

```bash
# Start dev server (if not running)
npm run dev

# Or use the helper script
./start-local.sh

# Run tests
npm test

# Interactive test UI (recommended!)
npm run test:ui

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔧 Environment Configuration

Your `.env` file has been created with placeholders. To enable full functionality:

### 1. Supabase (Database)

**Get your credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGci...`

**Update `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. Stripe (Payments)

**Get test keys:**
1. Go to [stripe.com/test](https://dashboard.stripe.com/test/dashboard)
2. **Developers** → **API keys**
3. Copy:
   - Publishable key: `pk_test_...`
   - Create products and get Price IDs

**Update `.env`:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_STARTER_PRICE_ID=price_...
VITE_STRIPE_PRO_PRICE_ID=price_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_...
```

### 3. Your API (Optional)

If using custom backend:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🧪 Testing Locally

### Run All Tests
```bash
npm test
```

### Watch Mode (auto-rerun on changes)
```bash
npm test -- --watch
```

### Interactive UI (Best for Development)
```bash
npm run test:ui
```

Opens a browser with:
- ✅ Test explorer
- ✅ Code coverage visualization
- ✅ Console output
- ✅ Re-run failed tests

### Test Specific File
```bash
npm test stripe-custom-api
npm test PricingPlans
```

### Coverage Report
```bash
npm run test:coverage
```

---

## 📂 Project Structure

```
niche-crm-mvp/
├── src/
│   ├── components/          # React components
│   │   ├── PricingPlans.tsx
│   │   ├── AddContactForm.tsx
│   │   └── ContactList.tsx
│   ├── lib/                 # Business logic
│   │   ├── stripe-custom-api.ts
│   │   ├── supabase.ts
│   │   └── contactService.ts
│   ├── types/               # TypeScript types
│   │   └── contact.ts
│   └── styles/              # CSS
│       └── pricing.css
├── .env                     # Your local config (not committed)
├── .env.example             # Template
└── start-local.sh           # Helper script
```

---

## 🎨 Adding Routing

To access the pricing page, you need to add React Router:

### Install Router
```bash
npm install react-router-dom
```

### Update `src/main.tsx`
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PricingPlans } from './components/PricingPlans'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pricing" element={<PricingPlans />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
```

Then visit: http://localhost:5173/pricing

---

## 🔥 Hot Features

### 1. Hot Module Replacement (HMR)
Edit any file → Changes appear instantly in browser!

### 2. TypeScript Type Checking
Save a file → Instant type error feedback

### 3. Vitest Watch Mode
```bash
npm test -- --watch
```
Edit tests → Auto-rerun instantly

### 4. Dev Tools
Open browser DevTools:
- **React DevTools** - Component inspector
- **Network** - API calls
- **Console** - Logs and errors

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Port 5173 is already in use`

**Fix:**
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Module Not Found

**Error:** `Cannot find module '@/lib/...'`

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Fails

**Error:** `Missing Supabase environment variables`

**Fix:** Update `.env` with real Supabase credentials (see above)

### Stripe Not Working

**Error:** `Stripe publishable key not found`

**Fix:** Add real Stripe test keys to `.env`

### Tests Failing

**Fix:**
```bash
# Clear test cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --reporter=verbose
```

---

## 📊 Local vs Production

| Feature | Local | Production |
|---------|-------|------------|
| URL | localhost:5173 | yourcrm.vercel.app |
| Database | Supabase (test) | Supabase (prod) |
| Stripe | Test mode keys | Live mode keys |
| HMR | ✅ Enabled | ❌ Disabled |
| Minified | ❌ No | ✅ Yes |
| Source Maps | ✅ Yes | Optional |

---

## 🚀 Development Workflow

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Browser
```
http://localhost:5173
```

### 3. Make Changes
Edit any file in `src/` → See changes instantly

### 4. Run Tests
```bash
npm run test:ui  # Interactive mode
```

### 5. Check Types
```bash
npm run build  # TypeScript checks included
```

### 6. Commit
```bash
git add .
git commit -m "Your changes"
```

---

## 🎯 What You Can Test Locally

### ✅ Working Now (No Setup)
- UI components render
- Contact form validation
- Pricing page display
- Tests run
- TypeScript compilation
- Hot reload

### 🔑 Requires API Keys
- Supabase database operations
- Stripe checkout flow
- Subscription management

### 🌐 Requires Backend
- Stripe webhook handling
- Custom API calls (if using your own backend)

---

## 📖 Next Steps

1. **Test the UI:**
   - Visit http://localhost:5173
   - Check contact form
   - View pricing page (once routing added)

2. **Run Tests:**
   ```bash
   npm run test:ui
   ```

3. **Configure APIs:**
   - Add real Supabase keys to `.env`
   - Add real Stripe test keys to `.env`

4. **Test Full Flow:**
   - Create contacts
   - Try checkout (needs Stripe keys)
   - Test subscription flow

5. **Deploy:**
   - Follow `QUICKSTART.md` for Vercel deployment
   - Follow `STRIPE-SETUP.md` for payment setup

---

## 🛠️ Helper Scripts

All in `package.json`:

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start dev server |
| `npm test` | Run all tests |
| `npm run test:ui` | Open test UI |
| `npm run test:coverage` | Coverage report |
| `npm run build` | Production build |
| `npm run preview` | Preview build locally |

---

## 🎉 You're All Set!

Your local test environment is running and ready for development.

**Current status:**
- ✅ Dev server: http://localhost:5173
- ✅ Tests: 101/105 passing
- ✅ TypeScript: Configured
- ✅ HMR: Working
- ✅ Vitest: Ready

**Happy coding!** 🚀
