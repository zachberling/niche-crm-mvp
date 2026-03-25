# 🔧 Custom API Setup for Stripe

This guide shows you how to use **your own backend API** instead of Supabase Edge Functions.

## Overview

You'll need to create 4 API endpoints:

1. `POST /api/stripe/create-checkout-session` - Start checkout
2. `POST /api/stripe/create-portal-session` - Manage subscription
3. `POST /api/stripe/webhook` - Handle Stripe events
4. `GET /api/stripe/subscription-status` - Check subscription

---

## Option 1: Use the Example Code

I've created complete working examples in `api-examples/stripe-routes.js`.

### For Express.js:

```bash
npm install stripe express body-parser
```

Copy the Express example from `stripe-routes.js` and run:

```js
node api-examples/stripe-routes.js
```

### For Next.js:

Create these files in your Next.js project:

```
pages/api/stripe/
├── create-checkout-session.js
├── create-portal-session.js
├── webhook.js
└── subscription-status.js
```

Copy the Next.js examples from `stripe-routes.js`.

### For Other Frameworks:

The route functions are framework-agnostic. Just:
1. Import the functions
2. Wire them to your routes
3. Handle POST/GET methods appropriately

---

## Option 2: Your Existing API

If you already have an API, add these 4 endpoints using the logic from `stripe-routes.js`.

**Key points:**
- Use `stripe` npm package server-side
- Verify webhook signatures
- Store subscription data in YOUR database
- Return proper JSON responses

---

## Environment Variables

### Your API Server

Add these to your backend:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
DATABASE_URL=your-database-connection-string
```

### Your Frontend (niche-crm-mvp)

Update `.env`:

```env
# Your API base URL
VITE_API_BASE_URL=http://localhost:3000/api
# or production:
# VITE_API_BASE_URL=https://api.yourcrm.com/api

# Stripe publishable key (frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Price IDs
VITE_STRIPE_STARTER_PRICE_ID=price_xxxxx
VITE_STRIPE_PRO_PRICE_ID=price_xxxxx
VITE_STRIPE_PREMIUM_PRICE_ID=price_xxxxx
```

---

## Update Frontend Code

Replace the Supabase stripe module with the custom API version:

**Before:**
```ts
import { createCheckoutSession } from '@/lib/stripe'
```

**After:**
```ts
import { createCheckoutSession } from '@/lib/stripe-custom-api'
```

Or just rename the file:
```bash
cd niche-crm-mvp/src/lib
mv stripe-custom-api.ts stripe.ts  # Replace original
```

---

## Database Schema

You'll need a `subscriptions` table in YOUR database:

### SQL (PostgreSQL, MySQL, etc.):

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  price_id VARCHAR(255) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);
```

### MongoDB:

```js
const SubscriptionSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  stripeCustomerId: { type: String, unique: true, required: true },
  stripeSubscriptionId: { type: String, unique: true, required: true },
  status: { type: String, required: true },
  priceId: { type: String, required: true },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: { type: Boolean, default: false },
}, { timestamps: true })
```

### Prisma:

```prisma
model Subscription {
  id                    String   @id @default(uuid())
  userId                String
  userEmail             String
  stripeCustomerId      String   @unique
  stripeSubscriptionId  String   @unique
  status                String
  priceId               String
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  cancelAtPeriodEnd     Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([stripeCustomerId])
}
```

---

## Set Up Stripe Webhook

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**
3. **URL:** `https://your-api.com/api/stripe/webhook`
4. **Events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. **Copy signing secret** (starts with `whsec_`)
6. Add to your API environment variables

---

## Testing Locally

### 1. Install Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
# or
npm install -g stripe-cli
```

### 2. Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This gives you a webhook secret like `whsec_xxxxx`. Use it for local testing.

### 3. Test Checkout

```bash
# Start your API
node server.js  # or whatever starts your API

# Start frontend
cd niche-crm-mvp
npm run dev
```

Visit `http://localhost:5173/pricing` and test checkout.

---

## Deployment

### Backend (Your API)

Deploy to:
- **Heroku** - Easy, $7/mo
- **Railway** - Modern, free tier
- **DigitalOcean App Platform** - $5/mo
- **AWS Lambda** - Serverless, pay-per-use
- **Your own VPS** - Full control

Make sure to:
1. Set environment variables
2. Enable HTTPS (Stripe requires it for webhooks)
3. Update webhook URL in Stripe

### Frontend (Vercel)

Update `VITE_API_BASE_URL` to your production API URL:

**Vercel → Settings → Environment Variables:**
```
VITE_API_BASE_URL=https://api.yourcrm.com/api
```

---

## API Endpoints Reference

### POST /api/stripe/create-checkout-session

**Request:**
```json
{
  "priceId": "price_xxxxx",
  "successUrl": "https://yourcrm.com/success",
  "cancelUrl": "https://yourcrm.com/pricing",
  "customerEmail": "user@example.com",
  "metadata": {
    "userId": "123"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxxxx"
}
```

### POST /api/stripe/create-portal-session

**Request:**
```json
{
  "customerId": "cus_xxxxx",
  "returnUrl": "https://yourcrm.com/account"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxxxx"
}
```

### POST /api/stripe/webhook

**Headers:**
```
stripe-signature: t=xxx,v1=xxx
```

**Response:**
```json
{
  "received": true
}
```

### GET /api/stripe/subscription-status?userId=123

**Response:**
```json
{
  "status": "active",
  "plan": "professional",
  "currentPeriodEnd": "2026-04-25T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

---

## Security Checklist

- [ ] Never expose `STRIPE_SECRET_KEY` to frontend
- [ ] Always verify webhook signatures
- [ ] Use HTTPS for all API endpoints (required by Stripe)
- [ ] Validate all user inputs
- [ ] Rate limit checkout endpoint
- [ ] Log all Stripe events for debugging
- [ ] Use environment variables, never hardcode keys

---

## Troubleshooting

### ❌ CORS errors from frontend

**Fix:** Add CORS headers to your API:

```js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})
```

### ❌ Webhook signature verification fails

**Fix:**
1. Make sure you're using **raw body** for webhook endpoint
2. Check that `STRIPE_WEBHOOK_SECRET` matches your webhook in Stripe
3. For local testing, use `stripe listen` webhook secret

### ❌ Frontend can't reach API

**Fix:**
1. Check `VITE_API_BASE_URL` is correct
2. Make sure API is running
3. Verify CORS is configured
4. Check browser network tab for errors

---

## Summary

**Your API needs:**
1. 4 endpoints (checkout, portal, webhook, status)
2. Stripe npm package
3. Database to store subscriptions
4. HTTPS in production

**Frontend needs:**
1. `VITE_API_BASE_URL` pointing to your API
2. Stripe publishable key
3. Price IDs from Stripe

**Everything else stays the same!**

---

## Example Tech Stacks

### Option A: Next.js Full-Stack
- Frontend: Next.js (React)
- API: Next.js API Routes
- Database: PostgreSQL (Supabase or Neon)
- Deploy: Vercel (all-in-one)

### Option B: Express + React
- Frontend: Vite React (your current setup)
- API: Express.js
- Database: PostgreSQL
- Deploy: Frontend on Vercel, API on Railway

### Option C: Serverless
- Frontend: Vite React on Vercel
- API: AWS Lambda functions
- Database: DynamoDB or RDS
- Deploy: API via Serverless Framework

All work great with Stripe!

---

Need help? Check the example code in `api-examples/stripe-routes.js` 🚀
