# 🚀 Deploy to Vercel Right Now

Quick guide to get your CRM live in 5 minutes.

## Prerequisites

- Vercel account (free tier is fine)
- GitHub account
- Your code pushed to GitHub

---

## Method 1: Vercel Dashboard (Easiest - 5 minutes)

### Step 1: Push to GitHub

```bash
# If you haven't already:
cd niche-crm-mvp
git remote add origin https://github.com/YOUR_USERNAME/niche-crm-mvp.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your `niche-crm-mvp` repo
4. Vercel auto-detects Vite → Click **"Deploy"**

**That's it!** Your app will be live in ~2 minutes.

### Step 3: Add Environment Variables (Optional)

If you want database/payments to work:

1. Go to your project in Vercel
2. **Settings** → **Environment Variables**
3. Add these:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_STARTER_PRICE_ID=price_...
VITE_STRIPE_PRO_PRICE_ID=price_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_...
```

4. **Redeploy** from the Deployments tab

---

## Method 2: Vercel CLI (5 minutes)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
cd niche-crm-mvp
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **niche-crm-mvp**
- Directory? **./   (current directory)**
- Override settings? **N**

**Done!** You'll get a URL like:
```
https://niche-crm-mvp-xxxxx.vercel.app
```

### Add Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# ... add others
```

### Redeploy with env vars

```bash
vercel --prod
```

---

## Method 3: GitHub Actions (Automatic - 10 minutes setup)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Every git push automatically deploys!**

---

## What Gets Deployed

```
✅ React + TypeScript app
✅ Vite-optimized build
✅ All components (PricingPlans, ContactForm, etc.)
✅ Stripe integration (if keys added)
✅ Supabase integration (if keys added)
✅ Routing (if you add React Router)
```

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads: `https://your-app.vercel.app`
- [ ] No console errors (F12 → Console)
- [ ] Components render correctly
- [ ] If using Supabase: Add environment variables
- [ ] If using Stripe: Add environment variables
- [ ] Custom domain (optional): Settings → Domains

---

## Troubleshooting

### Build Fails

**Error:** `Build failed`

**Check:**
1. Does `npm run build` work locally?
2. Are all dependencies in `package.json`?
3. Check Vercel build logs for errors

**Fix:**
```bash
# Test build locally first
npm run build

# If it works locally, push and redeploy
git push
```

### Environment Variables Not Working

**Error:** App loads but features don't work

**Fix:**
1. Vercel → Settings → Environment Variables
2. Make sure variables start with `VITE_`
3. Redeploy after adding variables

### Page Not Found (404)

**Error:** Direct URLs don't work

**Fix:** Already configured in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Deployment URLs

After deployment, you get:

**Preview deployments:**
- Every git push: `https://niche-crm-mvp-git-branch.vercel.app`
- Pull requests: `https://niche-crm-mvp-pr-123.vercel.app`

**Production:**
- Main branch: `https://niche-crm-mvp.vercel.app`
- Custom domain: `https://yourcrm.com` (if configured)

---

## Auto-Deploy Setup

**Enable automatic deployments:**

1. Connect GitHub repo to Vercel (done during import)
2. Every push to `main` = production deploy
3. Every PR = preview deploy
4. No manual steps needed!

---

## Custom Domain (Optional)

### Add Your Domain

1. Vercel → Settings → Domains
2. Add domain: `yourcrm.com`
3. Update DNS:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: `3600`

4. Add www subdomain:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

**DNS propagates in ~1 hour**

---

## Cost Breakdown

**Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Preview deployments
- ✅ Custom domains
- ✅ Automatic HTTPS

**You pay $0 until:**
- 100GB+ bandwidth
- Need advanced features

**For most MVPs: FREE! 🎉**

---

## Next Steps After Deployment

1. **Test your live site**
   ```
   https://your-app.vercel.app
   ```

2. **Add environment variables** (if needed)
   - Supabase keys
   - Stripe keys

3. **Share your URL!**
   - Tweet it
   - Share on Reddit
   - Email potential customers

4. **Monitor usage**
   - Vercel Dashboard → Analytics
   - Check bandwidth usage
   - Monitor errors

---

## Quick Reference

| Task | Command/URL |
|------|-------------|
| Deploy | `vercel` |
| Production deploy | `vercel --prod` |
| Add env var | `vercel env add VAR_NAME` |
| View logs | Vercel Dashboard → Deployments → Logs |
| Rollback | Dashboard → Deployments → Promote to Production |

---

## Status Check

Your project is **deployment-ready**:

✅ `vercel.json` configured  
✅ Build process working  
✅ Environment variables templated  
✅ All dependencies declared  
✅ TypeScript compiling  
✅ Tests passing (101/105)

**Ready to deploy!** 🚀

---

## I Need Help!

**If deployment fails:**

1. Check build locally: `npm run build`
2. Check Vercel build logs (Dashboard → Deployments → View Logs)
3. Common issues:
   - Missing environment variables → Add them
   - Build errors → Check logs
   - Import errors → Check paths

**If app loads but doesn't work:**

1. Check browser console (F12)
2. Verify environment variables are set
3. Check Network tab for API errors

---

**Ready? Let's deploy!**

Choose Method 1 (Dashboard) for the quickest start. Takes 5 minutes total.
