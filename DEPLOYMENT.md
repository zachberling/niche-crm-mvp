# Deployment Guide - Vercel + Supabase

This guide will get your Niche CRM MVP deployed and running in production.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Supabase account (free tier is fine)

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose:
   - **Name:** `niche-crm-mvp` (or your preferred name)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
4. Wait for project to provision (~2 minutes)

### 1.2 Run the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the query editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"

### 1.3 Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository

```bash
cd niche-crm-mvp

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Niche CRM MVP"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/niche-crm-mvp.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your `niche-crm-mvp` repository
4. Vercel will auto-detect it's a Vite project

### 3.2 Configure Environment Variables

Before deploying, add these environment variables in Vercel:

1. Click **Environment Variables**
2. Add these:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | From Step 1.3 |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Step 1.3 |

3. Click **Deploy**

### 3.3 Wait for Deployment

- First deployment takes ~2-3 minutes
- You'll get a URL like: `https://niche-crm-mvp.vercel.app`

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. You should see the CRM interface
3. Click **Add Contact** - it should save to Supabase
4. Check Supabase dashboard → **Table Editor** → `contacts` to verify

---

## Step 5: (Optional) Set Up Custom Domain

1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `crm.yourdomain.com`)
3. Follow Vercel's DNS instructions

---

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└─────┬───────┘
      │ HTTPS
      ▼
┌─────────────┐
│   Vercel    │ (Static hosting)
│  React App  │
└─────┬───────┘
      │ API calls
      ▼
┌─────────────┐
│  Supabase   │ (PostgreSQL)
│  Database   │
└─────────────┘
```

---

## Local Development with Supabase

### Option A: Use Production Database

1. Create `.env` file (copy from `.env.example`)
2. Add your Supabase credentials
3. Run `npm run dev`

**⚠️ Warning:** This uses production data!

### Option B: Use Local Supabase (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Get local credentials
supabase status

# Update .env with local URLs
```

---

## Troubleshooting

### Build Fails on Vercel

**Error:** `Missing environment variables`

**Fix:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel settings

---

### Can't Connect to Database

**Error:** `supabase is not defined`

**Fix:** Check that env variables are set correctly and start with `VITE_` prefix

---

### RLS Policies Blocking Access

**Error:** `new row violates row-level security policy`

**Fix:** In Supabase, disable RLS temporarily:
```sql
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
```

(Later, re-enable and configure proper auth)

---

## Next Steps

- [ ] Add authentication (Supabase Auth)
- [ ] Set up proper RLS policies for multi-tenant
- [ ] Add production analytics (Plausible, Vercel Analytics)
- [ ] Configure custom domain
- [ ] Set up CI/CD with GitHub Actions
- [ ] Add error monitoring (Sentry)

---

## Cost Breakdown

**Free tier includes:**
- Vercel: 100GB bandwidth/month, unlimited deployments
- Supabase: 500MB database, 2GB bandwidth, 50K monthly active users

**Should handle:**
- ~5,000 monthly visitors
- ~100 active users
- ~10,000 contacts total

**You won't pay anything until you scale significantly!**

---

## Support

If you run into issues:
1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard → Logs)
3. Check browser console for errors
4. Ask in Discord!

🚀 **Good luck with your launch!**
