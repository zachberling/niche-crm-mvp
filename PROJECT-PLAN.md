# Niche CRM MVP - Project Plan

## ✅ PHASE 1: Foundation (COMPLETE)
- [x] Project scaffolding with Vitest
- [x] TypeScript configuration
- [x] Test setup with React Testing Library
- [x] Core domain models (Contact schema)
- [x] First passing tests

## 🎯 PHASE 2: Choose Your Vertical (NEXT)

Pick ONE vertical to build for first:

### Option A: Independent Insurance Agents
**Pain Points:**
- Managing 100-500+ client policies
- Renewal tracking (miss a renewal = lost commission)
- Multi-carrier quote management
- Compliance documentation

**Vertical-Specific Features:**
- Policy renewal calendar
- Carrier comparison tool
- Automated renewal reminders
- Commission tracking

**Pricing:** $149-$299/month (high-value customer)

---

### Option B: HVAC Contractors
**Pain Points:**
- Seasonal scheduling chaos
- Emergency service calls interrupting planned work
- Equipment/parts inventory
- Following up on estimates

**Vertical-Specific Features:**
- Service area mapping
- Equipment history per customer
- Seasonal maintenance reminders
- Estimate tracking

**Pricing:** $99-$199/month

---

### Option C: Real Estate Wholesalers
**Pain Points:**
- Managing deal pipeline
- Tracking property comps
- Coordinating with buyers/sellers
- Time-sensitive negotiations

**Vertical-Specific Features:**
- Property deal pipeline
- Comp tracker
- Automated follow-up sequences
- Contract deadline alerts

**Pricing:** $149-$249/month

---

### Option D: Landscaping Companies
**Pain Points:**
- Seasonal work planning
- Multiple job sites daily
- Weather-dependent scheduling
- Recurring maintenance clients

**Vertical-Specific Features:**
- Route optimization
- Weather-aware scheduling
- Recurring service management
- Property photos/notes

**Pricing:** $99-$179/month

---

## 📋 PHASE 3: Core MVP Features (6 weeks)

### Week 1-2: Data Layer
- [x] Contact CRUD operations
- [x] Lead pipeline management (7 stages, qualification scoring, analytics)
- [x] Activity logging
- [x] Search and filtering
- [x] Tests for all core functions (176 tests passing)

### Week 3-4: UI Layer
- [ ] Contact list view
- [ ] Contact detail view
- [ ] Add/edit contact forms
- [ ] Dashboard with key metrics
- [ ] Mobile-responsive design

### Week 5: AI Features
- [ ] Automated follow-up suggestions
- [ ] Lead scoring (AI-powered)
- [ ] Email template generation
- [ ] Activity summarization

### Week 6: Launch Prep
- [ ] Authentication & authorization
- [ ] Billing integration (Stripe)
- [ ] Onboarding flow
- [ ] Landing page
- [ ] Documentation

---

## 🚀 PHASE 4: Validation & Launch

### Pre-Launch (2 weeks before):
- [ ] Beta test with 5-10 users from target vertical
- [ ] Gather feedback and iterate
- [ ] Finalize pricing tiers
- [ ] Prepare launch assets (screenshots, video demo)

### Launch Day:
- [ ] Product Hunt launch
- [ ] Post on relevant subreddits (r/insurance, r/HVAC, etc.)
- [ ] Indie Hackers showcase
- [ ] Direct outreach to people interviewed

### Post-Launch (30 days):
- [ ] Daily user interviews
- [ ] Track key metrics (signups, activation, churn)
- [ ] Iterate on feedback
- [ ] Goal: 10 paying customers

---

## 📊 Success Metrics

### Month 1:
- 50+ signups
- 10 paying customers
- $1,000 MRR

### Month 3:
- 30 paying customers
- $3,000-$5,000 MRR
- <5% monthly churn

### Month 6:
- 50-100 paying customers
- $7,500-$15,000 MRR
- Feature parity with niche competitors

### Month 12:
- 100-200 paying customers
- $15,000-$40,000 MRR
- Ready to clone for second vertical

---

## 🛠️ Tech Decisions Made

**Why these choices:**
- **Vitest** → Faster than Jest, better DX
- **Zustand** → Simpler than Redux, perfect for MVP
- **Zod** → Runtime validation + TypeScript types
- **TanStack Query** → Best data fetching for React
- **Next.js** (coming) → SEO + API routes in one

---

## 💰 Revenue Model

### Pricing Tiers:
- **Starter:** $99/mo (up to 250 contacts)
- **Professional:** $199/mo (up to 1,000 contacts + AI features)
- **Premium:** $299/mo (unlimited + priority support)

### Revenue Projections:
- 50 customers @ $149 avg = $7,450 MRR
- 100 customers @ $149 avg = $14,900 MRR
- 200 customers @ $149 avg = $29,800 MRR

**Break-even:** ~15 customers (covers infrastructure + basic ops)

---

## ⚡ Next Immediate Steps

1. **YOU DECIDE:** Which vertical? (Insurance, HVAC, Real Estate, Landscaping)
2. **I BUILD:** Vertical-specific schema extensions
3. **WE VALIDATE:** Interview 3 people in that vertical THIS WEEK
4. **WE SHIP:** Week 1 features with tests

**Ready to pick your vertical?** 🚀
