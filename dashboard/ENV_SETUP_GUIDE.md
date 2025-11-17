# 🔧 Environment Variables Setup Guide

## Quick Fix for "Environment Variables Not Working"

### Step 1: Create .env.local file

```bash
cd dashboard
cp .env.local.example .env.local
```

Or create it manually:
```bash
touch dashboard/.env.local
```

### Step 2: Verify the file exists

```bash
ls -la dashboard/.env.local
```

You should see the file listed. If not, you need to create it!

## Common Issues & Solutions

### Issue 1: "Missing environment variable" error

**Problem:** Environment variables are not being loaded.

**Solution:**
1. Make sure `.env.local` exists in the `dashboard` folder (not the root!)
2. Restart your dev server after creating/editing `.env.local`
3. Make sure variable names match exactly (case-sensitive!)

```bash
# Stop server (Ctrl+C)
# Then restart
cd dashboard
npm run dev
```

### Issue 2: "NEXT_PUBLIC_ variables undefined in browser"

**Problem:** Client-side variables are undefined.

**Solution:** 
Variables used in client components MUST start with `NEXT_PUBLIC_`

✅ Correct:
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
```

❌ Wrong:
```env
SUPABASE_URL=https://...  # Won't work in browser!
```

### Issue 3: "Variables work locally but not in production"

**Problem:** Vercel/production doesn't have the variables.

**Solution:**
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Add all variables from `.env.local`
4. Redeploy

### Issue 4: File is in wrong location

**Correct structure:**
```
zeeblocker/
├── extension/
└── dashboard/          ← You should be here
    ├── .env.local      ← File should be here
    ├── .env.local.example
    ├── package.json
    └── app/
```

**Wrong location:**
```
zeeblocker/
├── .env.local          ← Wrong! Too high up
├── extension/
└── dashboard/
```

## Step-by-Step Setup

### 1. Supabase Setup (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Create new project (wait ~2 minutes)
3. Go to Project Settings → API
4. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Run the database schema:
   - Go to SQL Editor
   - Copy content from `dashboard/lib/supabase/schema.sql`
   - Paste and run

### 2. Stripe Setup (5 minutes)

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Enable Test Mode** (toggle in top right)
3. Go to Developers → API Keys
4. Copy these:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

5. Create products:
   - Go to Products → Add Product
   - Create 3 products:
     - Pro: $15/month recurring
     - Family: $25/month recurring
     - Organization: $30/month recurring
   - Copy the **Price ID** (starts with `price_`) for each:

```env
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_FAMILY_PRICE_ID=price_xxxxx
STRIPE_ORG_PRICE_ID=price_xxxxx
```

6. Webhook (for local testing - optional):
```env
STRIPE_WEBHOOK_SECRET=whsec_test_skip_for_now
```

### 3. Resend Setup (2 minutes)

1. Go to [https://resend.com](https://resend.com)
2. Create account (free tier)
3. Go to API Keys
4. Create key and copy:

```env
RESEND_API_KEY=re_xxxxx
```

5. For testing, use their test email:
```env
EMAIL_FROM=onboarding@resend.dev
```

### 4. Application Settings

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=your-email@example.com
```

## Your Complete .env.local File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Stripe (TEST MODE KEYS!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_skip_for_now

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_FAMILY_PRICE_ID=price_xxxxx
STRIPE_ORG_PRICE_ID=price_xxxxx

# Resend
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=onboarding@resend.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
```

## Testing Your Configuration

After setting up, you should see this in the terminal when starting the dev server:

```
🔧 Environment Configuration:
   Supabase: ✅
   Stripe: ✅
   Email: ✅
   App URL: ✅
```

If you see ❌, that variable is missing!

## Troubleshooting Commands

```bash
# Check if .env.local exists
ls -la dashboard/.env.local

# View contents (careful - contains secrets!)
cat dashboard/.env.local

# Restart dev server
cd dashboard
npm run dev

# Clear Next.js cache if having issues
rm -rf dashboard/.next
npm run dev
```

## Security Notes

⚠️ **NEVER commit .env.local to git!**

The `.gitignore` file should include:
```
.env.local
.env*.local
```

✅ **DO commit:**
- `.env.local.example` (template without real values)

❌ **DON'T commit:**
- `.env.local` (contains real secrets)

## Need Help?

If you're still getting errors:

1. **Share the error message** (remove actual key values!)
2. **Check file location**: `dashboard/.env.local` (not root!)
3. **Restart dev server** after any changes
4. **Check for typos** in variable names
5. **Make sure all required variables are set**

## Minimal Setup for Testing

If you just want to test the UI without backend services:

```env
# Minimum to start the server
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_PRO_PRICE_ID=price_placeholder
STRIPE_FAMILY_PRICE_ID=price_placeholder
STRIPE_ORG_PRICE_ID=price_placeholder
RESEND_API_KEY=re_placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

This will let you see the UI, but features won't work until you add real keys.

---

**Ready to launch?** Follow the full setup above! 🚀

