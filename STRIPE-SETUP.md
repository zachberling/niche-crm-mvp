# 💳 Stripe Payment Setup Guide

This guide will help you add payment processing to your Niche CRM.

## Overview

**What you'll get:**
- 3 pricing tiers ($79, $149, $249/month)
- 14-day free trial on all plans
- Secure checkout with Stripe
- Customer portal for managing subscriptions
- Automatic webhook handling for subscription events

---

## Step 1: Create Stripe Account

1. Go to **https://stripe.com** → Sign up
2. Activate your account (may require business details)
3. Switch to **Test Mode** (toggle in top-right) for development

---

## Step 2: Create Products & Prices

### 2.1 Create Products

In Stripe Dashboard → **Products** → **Add product**

Create three products:

**Product 1: Starter**
- Name: `CRM Starter`
- Description: `Up to 250 contacts`
- Click **Add pricing**

**Product 2: Professional** (mark as "Recommended")
- Name: `CRM Professional`
- Description: `Up to 1,000 contacts with AI features`

**Product 3: Premium**
- Name: `CRM Premium`
- Description: `Unlimited contacts with priority support`

### 2.2 Add Pricing

For each product, add a **recurring price**:

| Product | Price | Billing | Free Trial |
|---------|-------|---------|------------|
| Starter | $79 | Monthly | 14 days |
| Professional | $149 | Monthly | 14 days |
| Premium | $249 | Monthly | 14 days |

**Important:** Copy each **Price ID** (looks like `price_xxxxxxxxxxxxx`)

---

## Step 3: Get API Keys

1. In Stripe Dashboard → **Developers** → **API keys**
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Keep this secure!

---

## Step 4: Set Up Environment Variables

### Local Development (.env)

Create/update `niche-crm-mvp/.env`:

```env
# Stripe Keys (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Price IDs (from Step 2)
VITE_STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
VITE_STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
VITE_STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxx
```

### Vercel (Production)

Add these to **Vercel → Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | pk_test_xxx | From Step 3 |
| `STRIPE_SECRET_KEY` | sk_test_xxx | Secret! Don't share |
| `VITE_STRIPE_STARTER_PRICE_ID` | price_xxx | From Step 2 |
| `VITE_STRIPE_PRO_PRICE_ID` | price_xxx | From Step 2 |
| `VITE_STRIPE_PREMIUM_PRICE_ID` | price_xxx | From Step 2 |

---

## Step 5: Deploy Supabase Edge Functions

Supabase Edge Functions handle server-side Stripe operations.

### 5.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 5.2 Link Your Project

```bash
cd niche-crm-mvp
supabase link --project-ref YOUR_PROJECT_ID
```

### 5.3 Set Function Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5.4 Deploy Functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

### 5.5 Get Function URLs

After deployment, you'll get URLs like:
```
https://xxxxx.supabase.co/functions/v1/create-checkout-session
```

**Update your code** to use these URLs instead of `/api/*`

---

## Step 6: Set Up Webhooks

Webhooks allow Stripe to notify your app about subscription events.

### 6.1 Create Webhook Endpoint

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:** `https://xxxxx.supabase.co/functions/v1/stripe-webhook`
4. **Events to listen for:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**

### 6.2 Get Webhook Secret

After creating the webhook:
1. Click on the webhook endpoint
2. Copy the **Signing secret** (starts with `whsec_...`)

### 6.3 Add Webhook Secret

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Then redeploy the webhook function:
```bash
supabase functions deploy stripe-webhook
```

---

## Step 7: Update Database Schema

Run the subscription migration:

1. Supabase Dashboard → **SQL Editor**
2. Open `supabase-stripe-migration.sql`
3. Copy and paste the SQL
4. Click **Run**

This creates the `subscriptions` table.

---

## Step 8: Test the Integration

### 8.1 Test Card Numbers

Use these in Test Mode:

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0341` | Requires authentication |
| `4000 0000 0000 0002` | Card declined |

**Expiry:** Any future date (e.g., 12/34)  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

### 8.2 Test Flow

1. Go to your app → `/pricing` page
2. Click **Start Free Trial** on any plan
3. Fill in test card info
4. Complete checkout
5. Check Stripe Dashboard → **Customers** to see the new subscription
6. Check Supabase → **Table Editor** → `subscriptions` to verify data

---

## Step 9: Customer Portal

Allow customers to manage their subscriptions:

```tsx
import { createPortalSession } from '@/lib/stripe'

const handleManageSubscription = async () => {
  const customerId = 'cus_xxxxxxxxxxxxx' // From your database
  const url = await createPortalSession(customerId, window.location.origin)
  window.location.href = url
}
```

---

## Step 10: Go Live

When ready for production:

### 10.1 Activate Stripe Account

1. Complete Stripe onboarding (business details, bank account)
2. Switch from Test Mode to **Live Mode**

### 10.2 Create Live Products & Prices

Repeat Step 2 in Live Mode (prices aren't copied from test mode)

### 10.3 Update Environment Variables

Replace all `pk_test_` and `sk_test_` keys with `pk_live_` and `sk_live_` versions

### 10.4 Set Up Live Webhook

Create a new webhook endpoint (Step 6) using your live function URL

---

## Pricing Structure

| Plan | Price | Contacts | Features |
|------|-------|----------|----------|
| Starter | $79/mo | 250 | Basic CRM, Email support |
| Professional | $149/mo | 1,000 | AI features, Priority support, API access |
| Premium | $249/mo | Unlimited | All features, 24/7 support, White-label |

**Free Trial:** 14 days on all plans (no credit card for trial in test mode)

---

## Troubleshooting

### ❌ "Stripe publishable key not found"

**Fix:** Add `VITE_STRIPE_PUBLISHABLE_KEY` to your `.env` or Vercel environment variables

---

### ❌ Checkout session fails

**Fix:** Check that:
1. Price IDs are correct
2. Edge functions are deployed
3. Stripe secret key is set in Supabase secrets

---

### ❌ Webhooks not working

**Fix:**
1. Verify webhook URL matches your function URL
2. Check webhook secret is set correctly
3. Look at Supabase function logs: `supabase functions logs stripe-webhook`

---

## Revenue Projections

**Conservative (Month 6):**
- 20 Starter + 25 Pro + 5 Premium = $6,825/mo

**Target (Month 12):**
- 40 Starter + 50 Pro + 10 Premium = $13,110/mo

**Optimistic (Month 18):**
- 60 Starter + 75 Pro + 20 Premium = $21,135/mo

---

## Files Created

```
niche-crm-mvp/
├── src/
│   ├── lib/stripe.ts                   ← Stripe client & config
│   └── components/PricingPlans.tsx     ← Pricing page UI
├── supabase/
│   └── functions/
│       ├── create-checkout-session/    ← Checkout API
│       ├── create-portal-session/      ← Portal API
│       └── stripe-webhook/             ← Webhook handler
├── supabase-stripe-migration.sql       ← Subscriptions table
└── STRIPE-SETUP.md                     ← This guide
```

---

## Next Steps

- [ ] Create Stripe account
- [ ] Set up products & pricing
- [ ] Deploy Supabase Edge Functions
- [ ] Configure webhooks
- [ ] Test with test card
- [ ] Launch! 🚀

**Questions?** Check Stripe docs: https://stripe.com/docs/billing/subscriptions/overview
