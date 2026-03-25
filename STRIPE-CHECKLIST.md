# 💳 Stripe Setup Checklist

Track your progress setting up payments.

## ☐ Stripe Account

- [ ] Created Stripe account
- [ ] Activated account (completed onboarding)
- [ ] Switched to Test Mode

## ☐ Products & Pricing

- [ ] Created "CRM Starter" product ($79/mo)
- [ ] Created "CRM Professional" product ($149/mo)
- [ ] Created "CRM Premium" product ($249/mo)
- [ ] Copied all three Price IDs
- [ ] Set 14-day trial on all plans

## ☐ API Keys

- [ ] Copied Publishable Key (pk_test_...)
- [ ] Copied Secret Key (sk_test_...) - **Keep secure!**

## ☐ Environment Variables

### Local (.env file)
- [ ] Added `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Added `STRIPE_SECRET_KEY`
- [ ] Added `VITE_STRIPE_STARTER_PRICE_ID`
- [ ] Added `VITE_STRIPE_PRO_PRICE_ID`
- [ ] Added `VITE_STRIPE_PREMIUM_PRICE_ID`

### Vercel (Production)
- [ ] Added all 5 Stripe variables to Vercel
- [ ] Redeployed after adding variables

## ☐ Supabase Edge Functions

- [ ] Installed Supabase CLI (`npm install -g supabase`)
- [ ] Linked project (`supabase link`)
- [ ] Set secrets:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deployed functions:
  - [ ] `create-checkout-session`
  - [ ] `create-portal-session`
  - [ ] `stripe-webhook`
- [ ] Copied function URLs

## ☐ Webhooks

- [ ] Created webhook endpoint in Stripe
- [ ] Added webhook URL: `https://xxxxx.supabase.co/functions/v1/stripe-webhook`
- [ ] Selected events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_failed`
- [ ] Copied webhook signing secret (whsec_...)
- [ ] Set `STRIPE_WEBHOOK_SECRET` in Supabase
- [ ] Redeployed webhook function

## ☐ Database

- [ ] Ran `supabase-stripe-migration.sql` in Supabase SQL Editor
- [ ] Verified `subscriptions` table created
- [ ] Verified RLS policies applied

## ☐ Testing

- [ ] Tested checkout with card `4242 4242 4242 4242`
- [ ] Verified subscription in Stripe Dashboard
- [ ] Verified subscription in Supabase `subscriptions` table
- [ ] Tested Customer Portal access
- [ ] Tested subscription cancellation

## ☐ Production (When Ready)

- [ ] Completed Stripe account activation
- [ ] Added bank account for payouts
- [ ] Switched to Live Mode
- [ ] Created live products & prices
- [ ] Updated environment variables with live keys
- [ ] Created live webhook endpoint
- [ ] Tested live checkout

---

## Quick Reference

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Requires Auth: `4000 0000 0000 0341`
- Declined: `4000 0000 0000 0002`

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

---

## Status: [ ] Not Started | [ ] In Progress | [ ] ✅ Complete!
