# 🚀 Quick Start - Deploy in 10 Minutes

Follow these steps to get your CRM live on the internet.

## ✅ Step 1: Create Supabase Project (3 min)

1. Go to **https://supabase.com** → Sign in/up
2. Click **New Project**
3. Settings:
   - Name: `niche-crm-mvp`
   - Password: (choose a strong one, save it)
   - Region: (pick closest to you)
4. Click **Create Project** → Wait ~2 min

## ✅ Step 2: Set Up Database (2 min)

1. In Supabase dashboard → **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open your local file: `supabase-schema.sql`
4. Copy ALL the SQL and paste into Supabase editor
5. Click **Run** (green button)
6. Should say "Success. No rows returned"

## ✅ Step 3: Get Your Credentials (1 min)

1. In Supabase → **Settings** (gear icon) → **API**
2. **COPY THESE TWO VALUES:**
   - Project URL (looks like: `https://abcdefghijk.supabase.co`)
   - anon public key (long string: `eyJhbGci...`)

**Keep this tab open!** You'll need these in Step 5.

## ✅ Step 4: Push to GitHub (2 min)

```bash
cd niche-crm-mvp

# If you haven't pushed yet:
git remote add origin https://github.com/YOUR_USERNAME/niche-crm-mvp.git
git branch -M main
git push -u origin main
```

## ✅ Step 5: Deploy to Vercel (2 min)

1. Go to **https://vercel.com** → Sign in/up with GitHub
2. Click **Add New...** → **Project**
3. Find `niche-crm-mvp` → **Import**
4. **BEFORE clicking Deploy:**
   - Scroll to **Environment Variables**
   - Add these TWO variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | (paste Project URL from Step 3) |
| `VITE_SUPABASE_ANON_KEY` | (paste anon key from Step 3) |

5. Click **Deploy** → Wait ~2 minutes

## ✅ Step 6: Test It! (1 min)

1. Vercel will show you a URL: `https://niche-crm-mvp-xxxxx.vercel.app`
2. Click **Visit** → You should see your CRM!
3. Try adding a contact
4. Go back to Supabase → **Table Editor** → **contacts**
5. Your test contact should be there! 🎉

---

## 🎉 You're Live!

Your app is now:
- ✅ Running on Vercel (auto-deploys on every git push)
- ✅ Connected to Supabase (scalable PostgreSQL database)
- ✅ Free tier (costs $0 until you have real traffic)

## What's Next?

1. **Share your URL** with potential customers
2. **Get feedback** on what features they need
3. **Iterate** based on real user needs
4. **Add authentication** when you're ready (Supabase Auth is easy)

## Need Help?

Check `DEPLOYMENT.md` for detailed troubleshooting.

---

**Total time: ~10 minutes** ⏱️

**Cost: $0** 💰

**Lines of code you wrote: 0** (I did it all 😉)
