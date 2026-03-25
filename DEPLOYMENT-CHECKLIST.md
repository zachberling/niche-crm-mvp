# 📋 Deployment Checklist

Use this to track your deployment progress.

## Supabase Setup

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Ran `supabase-schema.sql` in SQL Editor
- [ ] Verified tables created (contacts, activities)
- [ ] Copied Project URL
- [ ] Copied anon public key

## GitHub Setup

- [ ] Code pushed to GitHub repository
- [ ] Repository is public or accessible to Vercel

## Vercel Setup

- [ ] Created Vercel account
- [ ] Connected GitHub account
- [ ] Imported project from GitHub
- [ ] Added environment variable: `VITE_SUPABASE_URL`
- [ ] Added environment variable: `VITE_SUPABASE_ANON_KEY`
- [ ] First deployment successful
- [ ] Visited live URL and tested

## Testing

- [ ] App loads without errors
- [ ] Can add a new contact
- [ ] Contact appears in Supabase Table Editor
- [ ] Can view contact list
- [ ] Can edit a contact
- [ ] Can delete a contact

## Optional (Later)

- [ ] Set up custom domain
- [ ] Add authentication (Supabase Auth)
- [ ] Set up proper RLS policies
- [ ] Add analytics (Vercel/Plausible)
- [ ] Add error monitoring (Sentry)
- [ ] Configure production environment separately

---

## Environment Variables Reference

**Vercel Dashboard → Your Project → Settings → Environment Variables**

| Variable | Where to Find It | Example |
|----------|------------------|---------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## Deployment URLs

**Fill these in after deployment:**

- **Vercel URL:** https://_____________________________.vercel.app
- **Supabase Project URL:** https://_____________________________.supabase.co
- **GitHub Repo:** https://github.com/_____/_____________________

---

## Troubleshooting

### ❌ Build fails with "Missing environment variables"

**Fix:** Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel settings, then redeploy.

### ❌ App loads but can't save contacts

**Fix:** Check browser console for errors. Likely issue: wrong Supabase URL or anon key.

### ❌ "Row-level security policy violated"

**Fix:** In Supabase SQL Editor, run:
```sql
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
```

### ❌ Can't find my Vercel URL

**Fix:** Vercel dashboard → Your project → Deployments → Click latest → Visit button

---

**Status:** [ ] Not Started | [ ] In Progress | [ ] ✅ Deployed!
